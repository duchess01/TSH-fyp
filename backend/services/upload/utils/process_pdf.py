from openai import OpenAI
from PyPDF2 import PdfReader
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import ast
import re

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')

print(OPENAI_API_KEY, "OPENAI_API_KEY")


if OPENAI_API_KEY :
    client = OpenAI(api_key=OPENAI_API_KEY)
    
def run_process(pdf_file): 
    
    print(type(pdf_file), "type of pdf file")
    
    message_content = read_pdf(pdf_file)
        
        
    extracted_content = process_content(message_content, pdf_file)
    
    # upserts to pinecone
    upsert_content_pinecone(extracted_content, pdf_file)
    
    
    # returns extracted_content
    return extracted_content
    

    
    
    
    
    

### helper functions ###
def extract_text_from_page(pdf, page_number):
    
    print(pdf, "PDF")
    print(page_number, "PAGE NUMBER")
    
    try :
        page = pdf.pages[page_number]
        return page.extract_text()
    except : 
        print('PAGE NOT FOUND')
        return ""
        
    

def find_page_by_chapter_name(pdf, chapter_name, max_search_pages=100):
    pdf_page = []
    page_number = 0 
    while page_number <= max_search_pages:
        text = extract_text_from_page(pdf, page_number)
        
        if chapter_name.lower() in text.lower():
            print(f"Found '{chapter_name}' on page {page_number + 1}")
            pdf_page.append(page_number + 1)
        page_number += 1
        
    return pdf_page

def calculate_offsets(toc_dict, pdf_path):
    pdf = PdfReader(pdf_path)
    offsets = []
    for chapter_name, manual_page in toc_dict.items():
        chapter_name_split = chapter_name.split()[-1].strip()  # Use last part of heading
        
        print(chapter_name_split, "CHAPTER NAME SPLIT")
        pdf_page = find_page_by_chapter_name(pdf, chapter_name_split)
        if pdf_page:
            for page_num in pdf_page:
                offset = page_num - manual_page
                offsets.append(offset)
    return offsets

def most_frequent_offset(offsets):
    return max(set(offsets), key=offsets.count)

def adjust_toc_with_offset(toc_dict, consistent_offset):
    adjusted_toc = {}
    toc_item_list = list(toc_dict.items())

    for i in range(len(toc_item_list)):
        chapter_name, manual_page = toc_item_list[i]
        adjusted_page = manual_page + consistent_offset
        
        # Determine the range for end page
        if i < len(toc_item_list) - 1:
            next_manual_page = toc_item_list[i + 1][1]
        else:
            next_manual_page = manual_page  # Last chapter, no next page

        # Avoid overlaps
        end_page = next_manual_page + consistent_offset
        if end_page == adjusted_page:
            end_page += 1
        
        # Add adjusted page to the new TOC structure
        adjusted_toc[chapter_name] = (adjusted_page, end_page)

    return adjusted_toc

# Replace newlines with a space and remove excessive spaces
def clean_text(text):
    cleaned_text = re.sub(r'\s+', ' ', text.strip())
    return cleaned_text

# Function to extract text from a range of pages
def extract_text_from_pages(reader, start_page, end_page):
    content = []
    for page_num in range(start_page - 1, end_page):
        page = reader.pages[page_num]
        extracted_text = page.extract_text()
        cleaned_text = clean_text(extracted_text) if extracted_text else ""
        content.append(cleaned_text)
        
    return content

def get_embedding_for_page(page_content, model="text-embedding-ada-002"):
    response = client.embeddings.create(
        input=page_content, 
        model=model
    )
    return response.data[0].embedding 

def upsert_embeddings(output_dict, extracted_content, index):
    for heading, embeddings in output_dict.items():
        vectors = []
        for i, embed in enumerate(embeddings):
            vector_id = f"{heading}_vec{i+1}" 


            metadata = {"data": extracted_content.get(heading, [])}

            vectors.append({
                "id": vector_id, 
                "values": embed, 
                "metadata": metadata 
            }) 

        index.upsert(
            vectors=vectors,
            namespace=heading,
        )

### end of helper functions ###



### main functions ###
def read_pdf(pdf_file):
    # upload File
    
    
    PDF_file = client.files.create(
        file=open(pdf_file, "rb"),
        purpose="assistants"
    )

    pdf_file_id = next((file.id for file in client.files.list(purpose="assistants").data if file.filename == pdf_file), None)

    # # Create vector store
    # vector_store = client.beta.vector_stores.create(
    #     name="PDF Vector Store",
    #     expires_after = {
    #         "anchor": "last_active_at",
	#         "days": 3
    #     }
    # )

    # # Add file to vector store
    # vector_store_file = client.beta.vector_stores.files.create(
    #     vector_store_id=vector_store.id,
    #     file_id=pdf_file_id
    # )

    # Check if assistant exists
    my_assistants = client.beta.assistants.list(
        order="desc",
        limit="20",
    )

    assistant_exists = False
    for cur in my_assistants.data:
        if cur.name == "TOC Extractor Assistant":
            assistant_exists = True
            assistant = cur
            break

    # Create assistant if it doesn't exist
    if(not assistant_exists):
        assistant = client.beta.assistants.create(
            name="TOC Extractor Assistant",
            instructions="You are a highly specialized assistant that helps extract Table of Contents from uploaded PDF files and formats them as a dictionary of headings and page numbers.",
            model="gpt-4o-mini",
            tools=[{"type": "file_search"}],
        )


    # Update assistant to use vector store
    # assistant = client.beta.assistants.update(
    #     assistant_id=assistant.id,
    #     tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
    # )

    # Create a thread:
    message_file = client.files.create(
        file=open(pdf_file, "rb"), purpose="assistants"
    )

    file_id = pdf_file_id
    query = """
        From the file {file_id}, extract the Table of Contents, which contains headings and their corresponding page numbers. 
        I would like you to format this information as a dictionary where each key is a combination of 'heading number + heading name', 
        and each value is the corresponding page number. If the headings have a hierarchical structure (e.g., Section 1, 1.1, 1.1.1), preserve that in the key. 
        For example: {'1 Introduction': 1, '1.1 Overview': 3, '2 Methodology': 10}.
    """
    thread = client.beta.threads.create(
    messages=[
        {
        "role": "user",
        "content": query,
        "attachments": [
            { "file_id": message_file.id, "tools": [{"type": "file_search"}] }
        ],
    }
    ]
    )

    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id, assistant_id=assistant.id
    )

    messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))

    # Process the response content
    message_content = messages[0].content[0].text

    return message_content.value

def process_content(message_content, pdf_file):
    # Extract dictionary from message content
    start = message_content.find("{")
    end = message_content.rfind("}") + 1
    dictionary_str = message_content[start:end]
    toc_dict = ast.literal_eval(dictionary_str)

    # Find page offset
    offsets = calculate_offsets(toc_dict, pdf_file)
    
    consistent_offset = most_frequent_offset(offsets)
    adjusted_toc = adjust_toc_with_offset(toc_dict, consistent_offset)
    
    store_dictionary = adjusted_toc

    # Extract content as {heading:[content]}
    reader = PdfReader(pdf_file)
    extracted_content = {}
    for heading, (start_page, end_page) in store_dictionary.items():
        extracted_content[heading] = extract_text_from_pages(reader, int(start_page), int(end_page))



    return extracted_content, store_dictionary

def upsert_content_pinecone(extracted_content, pdf_file):
    output_dict = {}
    for heading, pages in extracted_content.items():
        embeddings = [get_embedding_for_page(page) for page in pages] 
        output_dict[heading] = embeddings 
        
        
    print(output_dict, "OUTPUT DICT")

    pc = Pinecone(api_key={PINECONE_API_KEY})

    index_name = pdf_file.split(".")[0]

    pc.create_index(
        name=index_name,
        dimension=1536 ,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        ) 
    )

    index = pc.Index(index_name) 

    # Upsert all embeddings into Pinecone
    try:
        upsert_embeddings(output_dict, extracted_content, index)
    except Exception as e:
        print(f"Error upserting embeddings: {e}")

if __name__ == "__main__":
    pdf_file = "sample.pdf"
    
    run_process(pdf_file)
