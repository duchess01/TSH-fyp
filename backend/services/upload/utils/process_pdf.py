from openai import OpenAI
from PyPDF2 import PdfReader
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import ast
import re
import requests
from fastapi import HTTPException

from utils.rollback import rollback_all

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')

if OPENAI_API_KEY :
    client = OpenAI(api_key=OPENAI_API_KEY)
    
async def run_process(pdf_file): 
    message_content = await read_pdf(pdf_file)
    extracted_content, store_dictionary = process_content(message_content, pdf_file)
    try:
        upsert_content_pinecone(extracted_content, pdf_file)
        
        return extracted_content
    except Exception as e:
        print(f"Error during process: {e}")
        await update_status_in_database(pdf_file, status="failed")
        await rollback_all(pdf_file)


### helper functions ###
def extract_text_from_page(pdf, page_number):
    page = pdf.pages[page_number]
    return page.extract_text()
    
def find_page_by_chapter_name(pdf, chapter_name):
    total_pages = len(pdf.pages)
    pdf_page = []
    page_number = 0 
    while page_number <= total_pages - 1:
        text = extract_text_from_page(pdf, page_number)
        
        if chapter_name.lower() in text.lower():
            pdf_page.append(page_number + 1)
        page_number += 1
        
    return pdf_page

def calculate_offsets(toc_dict, pdf_path):
    pdf = PdfReader(pdf_path)
    offsets = []
    
    
    for chapter_name, manual_page in toc_dict.items():
        pdf_page = find_page_by_chapter_name(pdf, chapter_name)
        if pdf_page:
            for page_num in pdf_page:
                
                if type(manual_page) == int :
                
                    offset = page_num - manual_page
                    offsets.append(offset)
    return offsets

def most_frequent_offset(offsets):
    return max(set(offsets), key=offsets.count)

def adjust_toc_with_offset(toc_dict, consistent_offset, total_pages):
    adjusted_toc = {}
    toc_item_list = list(toc_dict.items())

    for i in range(len(toc_item_list)):
        chapter_name, manual_page = toc_item_list[i]

        # Only proceed if manual_page is an integer and within the valid range
        if isinstance(manual_page, int) and 0 <= manual_page <= total_pages:
            if 0 <= manual_page + consistent_offset <= total_pages:
                adjusted_page = manual_page + consistent_offset
            else:
                adjusted_page = manual_page  # Keep original page if adjustment goes out of range
        else:
            # Skip the chapter if the page is not valid
            print(f"Dropping chapter '{chapter_name}' due to invalid page number: {manual_page}")
            continue

        # Determine the range for end page
        if i < len(toc_item_list) - 1:
            next_manual_page = toc_item_list[i + 1][1]

            # Ensure the next manual page is valid
            if isinstance(next_manual_page, int) and 0 <= next_manual_page <= total_pages:
                end_page = next_manual_page + consistent_offset
                if end_page > total_pages:
                    end_page = total_pages  # Cap end_page to total_pages if out of range
            else:
                end_page = adjusted_page  # If next page is invalid, end at the adjusted current page
        else:
            end_page = adjusted_page  # Last chapter, so set end_page to current adjusted page
        
        # Avoid overlaps
        if end_page == adjusted_page:
            end_page += 1
            if end_page > total_pages:
                end_page = total_pages

        # Add to the adjusted TOC only if valid
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

async def update_status_in_database(pdf_file, status):
    try:
        # Extract the file name without extension
        pdf_file = pdf_file.split("\\")[-1].split(".")[0]
        
        url = "http://localhost:8000/manual/status"  # Consider making this URL configurable
        data = {
            "manual_name": pdf_file,
            "status": status
        }
        response = requests.put(url, json=data)
        
        response.raise_for_status()  # This will raise an HTTPError for bad responses (4xx or 5xx)
        
        print(f"Successfully updated status to {status} for file {pdf_file}")
        return True
    
    except requests.HTTPError as http_err:
        error_message = f"HTTP error occurred while updating status: {http_err}"
        print(error_message)
        if response.text:
            print(f"Response content: {response.text}")


        rollback_all(pdf_file)
        raise HTTPException(status_code=response.status_code, detail=error_message)
    
    except requests.RequestException as req_err:
        error_message = f"Request error occurred while updating status: {req_err}"
        print(error_message)

        rollback_all(pdf_file)
        raise HTTPException(status_code=500, detail=error_message)
    
    except Exception as e:
        error_message = f"Unexpected error during status update: {e}"
        print(error_message)

        rollback_all(pdf_file)
        raise HTTPException(status_code=500, detail=error_message)
    


### end of helper functions ###



### main functions ###
async def read_pdf(pdf_file):
    # upload File
    PDF_file = client.files.create(
        file=open(pdf_file, "rb"),
        purpose="assistants"
    )

    pdf_file_id = next((file.id for file in client.files.list(purpose="assistants").data if file.filename == pdf_file), None)

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

    ## Retry Mechanism ## 
    attempt = 0 
    max_attempts = 3
    messages = []

    

    print(pdf_file, "pdf_file")

    while attempt < max_attempts:
        print(f"Attempt {attempt + 1} of {max_attempts} for run process") 
        # Create a thread:
        message_file = client.files.create(
            file=open(pdf_file, "rb"), purpose="assistants"
        )

        print(OPENAI_API_KEY, "OPENAI_API_KEY")

        print(f"File uploaded successfully. File ID: {message_file.id}")

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


        if messages and len(messages) > 0 and "{" in messages[0].content[0].text.value:
            if messages[0].content[0].text.value.count("{") == 1:
                print("SUCCESSFULLY EXTRACTED TOC")
                break

        print("FAILED TO EXTRACT TOC")
        attempt += 1
    
    if not messages:
        await update_status_in_database(pdf_file, status="failed")
        raise Exception("No messages found")
    # Process the response content
    message_content = messages[0].content[0].text
    # print("MESSAGE CONTENT", message_content)

    return message_content.value

def process_content(message_content, pdf_file):
    # print("message content", message_content)
    # Extract dictionary from message content
    start = message_content.find("{")
    end = message_content.rfind("}") + 1
    dictionary_str = message_content[start:end]
    toc_dict = ast.literal_eval(dictionary_str)
    
    # Drop any chapters with page numbers that are not integers
    def safe_convert_to_int(value):
        try:
            return int(value)
        except ValueError:
            return None
        
    filtered_toc_dict = {k: safe_convert_to_int(v) for k, v in toc_dict.items() if safe_convert_to_int(v) is not None}
    # print(filtered_toc_dict, 'FILTERED TOC DICT')

    # Find page offset
    ## Retry Mechanism ##
    attempt = 0
    max_attempts = 3
    offsets = []
    
    while attempt < max_attempts:
        print(f"Attempt {attempt + 1} of {max_attempts} for calculate offsets")
        offsets = calculate_offsets(filtered_toc_dict, pdf_file)
        if offsets:
            break
        attempt += 1
    
    print(offsets, 'OFFSETS')
    if not offsets:
        update_status_in_database(pdf_file, status="failed")
        raise Exception("No offsets found")
        ## Retry Mechanism ##
    
    consistent_offset = most_frequent_offset(offsets)
    print(consistent_offset, 'CONSISTENT OFFSET', 'OFFSET TYPE', type(consistent_offset))
    
    total_pages = len(PdfReader(pdf_file).pages)
    adjusted_toc = adjust_toc_with_offset(filtered_toc_dict, consistent_offset, total_pages)
    # print(adjusted_toc, 'ADJUSTED TOC')
    
    store_dictionary = adjusted_toc

    # Extract content as {heading:[content]}
    reader = PdfReader(pdf_file)
    extracted_content = {}
    for heading, (start_page, end_page) in store_dictionary.items():
        extracted_content[heading] = extract_text_from_pages(reader, int(start_page), int(end_page))

    return extracted_content, store_dictionary

def upsert_content_pinecone(extracted_content, pdf_file):
    print("upsert content to pine cone ")
    output_dict = {}
    for heading, pages in extracted_content.items():
        embeddings = [get_embedding_for_page(page) for page in pages] 
        output_dict[heading] = embeddings 
        
        
    # insert into pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)

    index_name = pdf_file.split("\\")[-1].split(".")[0].lower().replace("_", "-")

    print("INDEX NAME", index_name)
    
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
        
        update_status_in_database(pdf_file, status="failed")
        raise HTTPException(status_code=500, detail= f"Error upserting embeddings: {e}")
        

if __name__ == "__main__":
    pdf_file = "sample.pdf"
    
    run_process(pdf_file)

    message_content = read_pdf(pdf_file)
    
    extracted_content, store_dictionary = process_content(message_content, pdf_file)
    
    print(store_dictionary, 'store dictionary')
    # embed_content(extracted_content, pdf_file)
