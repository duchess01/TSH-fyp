# Assuming you're using SentenceTransformers
from sentence_transformers import util
import os
import numpy as np
from openai import OpenAI

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer, util

load_dotenv()
client = OpenAI()

pinecone_api_key = os.getenv("PINECONE_API_KEY")
model = SentenceTransformer('all-MiniLM-L6-v2')


async def initialize_pinecone_index(pinecone_index_name):
    pc = Pinecone(api_key=pinecone_api_key)
    if pinecone_index_name not in pc.list_indexes().names():
        pc.create_index(
            name=pinecone_index_name,
            dimension=1536,  # training & demo: 1536, prod: 384
            metric='euclidean',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-west-2'
            )
        )
    index = pc.Index(pinecone_index_name)
    return index


def encode_string(query):
    query_vector = model.encode(query)
    return query_vector.tolist()


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
