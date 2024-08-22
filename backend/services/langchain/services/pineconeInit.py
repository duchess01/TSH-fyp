from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
import os
import sys
from dotenv import load_dotenv

load_dotenv()

if os.environ.get("PINECONE_API_KEY") : 
    pc = Pinecone(api_key = os.environ.get("PINECONE_API_KEY"))
    
else : 
    raise Exception("Pinecone api key not detected in .env")


pcIndex = pc.Index(os.environ.get("PINECONE_INDEX_NAME"))






