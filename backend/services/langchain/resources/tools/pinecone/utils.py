import os

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

load_dotenv()

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


async def encode_string(query):
    return model.encode(query)
