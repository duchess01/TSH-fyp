from typing import Union
from fastapi import FastAPI
from pathlib import Path
from services.pineconeInit import pc
from dotenv import load_dotenv
import os
from os.path import join, dirname

from server.api import pinecone



load_dotenv(join(dirname(__file__), '.env'))


app = FastAPI()


ROOT = Path(__file__).parent.parent.parent

app.include_router(pinecone.router)





@app.get("/ready")
def ready() :
    return {
        "endpoint is ready"
    }
    
if __name__ == "__main__":
    import uvicorn
    
    
    
    uvicorn.run(app, host="localhost", port=8001, reload=True)