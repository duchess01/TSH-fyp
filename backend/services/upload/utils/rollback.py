from dotenv import load_dotenv
from fastapi import HTTPException
import os
import requests
from pinecone import Pinecone, PineconeException
load_dotenv()

NER_LLM_URL = os.getenv('NER_LLM_URL')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENVIRONMENT = os.getenv('PINECONE_ENVIRONMENT')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
DOCKER_ENV = os.getenv('DOCKER_ENV')

pc = Pinecone(api_key=PINECONE_API_KEY)

async def rollback_all(manual_url: str):
    if DOCKER_ENV : 
        manual_name = manual_url.split("/")[-1].split(".")[0]
    else :
        manual_name = manual_url.split("\\")[-1].split(".")[0]
    print(f"STARTING ROLLBACK FOR {manual_name}")

    errors = []

    # Rollback databases
    try:
        print(f"ROLLBACK DATABASES FOR {manual_name}")
        response = requests.delete(f"{NER_LLM_URL}/manual/delete/{manual_name}")
        response.raise_for_status()
        print(f"ROLLBACK DATABASES FOR {manual_name} COMPLETED")
    except requests.RequestException as e:
        errors.append(f"Failed to rollback databases: {str(e)}")

    # Rollback manual status
    try:
        print(f"ROLLBACK STATUS ENTRY FOR {manual_name}")
        response = requests.delete(f"{NER_LLM_URL}/manual/status/{manual_name}")
        response.raise_for_status()
        print(f"ROLLBACK STATUS ENTRY FOR {manual_name} COMPLETED")
    except requests.RequestException as e:
        errors.append(f"Failed to rollback manual status: {str(e)}")

    # Rollback Pinecone
    try:
        print(f"ROLLBACK PINECONE FOR {manual_name}")
        # Check if the index exists
        try:
            index_stats = pc.describe_index(PINECONE_INDEX_NAME)
            # If we get here, the index exists
            index = pc.Index(PINECONE_INDEX_NAME)
            # Delete all vectors with metadata matching the manual name
            index.delete(filter={"manual": manual_name})
            print(f"ROLLBACK PINECONE FOR {manual_name} COMPLETED")
        except PineconeException as pe:
            if "index not found" in str(pe).lower():
                print(f"Pinecone index '{PINECONE_INDEX_NAME}' not found. Skipping Pinecone rollback.")
            else:
                print(f"Failed to rollback Pinecone: {str(pe)}")  # Re-raise if it's a different Pinecone error
    except Exception as e:
        errors.append(f"Failed to rollback Pinecone: {str(e)}")

    if errors:
        error_message = "; ".join(errors)
        raise HTTPException(status_code=500, detail=f"Rollback errors occurred: {error_message}")

    print(f"ROLLBACK FOR {manual_name} COMPLETED SUCCESSFULLY")
