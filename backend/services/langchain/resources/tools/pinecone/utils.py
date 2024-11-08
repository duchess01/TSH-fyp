# Assuming you're using SentenceTransformers
from typing import List
from sentence_transformers import util
import os
import numpy as np
from openai import OpenAI

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()
client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

pinecone_api_key = os.getenv("PINECONE_API_KEY")


async def initialize_pinecone_index(pinecone_index_name):
    pc = Pinecone(api_key=pinecone_api_key)
    if pinecone_index_name not in pc.list_indexes().names():
        pc.create_index(
            name=pinecone_index_name,
            dimension=1536,  # training & demo: 1536, prod: 384
            metric='euclidean',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-east-1'
            )
        )
    index = pc.Index(pinecone_index_name)
    return index


def get_embedding(text, model="text-embedding-ada-002"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model=model).data[0].embedding


def match_namespace(keyword_array, query):  # [(embedding, namespace), ...]
    query_embedding = get_embedding(query)
    if query_embedding is None:
        raise ValueError("Query embedding could not be generated.")

    best_match = None
    highest_score = -1

    for embedding, namespace in keyword_array:
        if embedding is None:
            print(
                f"Warning: Skipping embedding for namespace {namespace} because it is None.")
            continue

        # Calculate cosine similarity
        score = util.pytorch_cos_sim(embedding, query_embedding).item()
        if score > highest_score:
            highest_score = score
            best_match = namespace
    return best_match

class TopicExtractor:
    def __init__(self):
        self.assistant = self._get_or_create_assistant()

    def _get_or_create_assistant(self):
        assistants = client.beta.assistants.list(order="desc", limit=20)
        for assistant in assistants.data:
            if assistant.name == "Topic Extractor Assistant":
                return assistant
        
        # Create assistant if it doesn't exist
        return client.beta.assistants.create(
            name="Topic Extractor Assistant",
            instructions="You are a highly specialized assistant that helps extract concise topics (1-3 words) from given queries or text.",
            model="gpt-3.5-turbo", 
        )

    def extract_topic(self, query: str, topics : List[str]) -> str:
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                thread = client.beta.threads.create(
                    messages=[
                        {
                            "role": "user",
                            "content": f"You will be provided with a list of topics and a query, check if this query can match with any ONE topic in the list of topics provided, if not generate ONE new topic. Your new topic generated should be specific to machinery terms and NOT general terms. If the query includes error code, the new topic should include the code. \n\nQuery: {query} \n\nTopics: {topics}. Your response will always be a single word or phrase.",
                        }
                    ]
                )

                run = client.beta.threads.runs.create_and_poll(
                    thread_id=thread.id,
                    assistant_id=self.assistant.id
                )

                messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))

                if messages:
                    topic = messages[0].content[0].text.value
                    return topic
 
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_attempts - 1:
                    raise Exception("Failed to extract topic after multiple attempts")

        raise Exception("No topic extracted")