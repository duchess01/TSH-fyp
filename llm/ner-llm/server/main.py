from fastapi import FastAPI
import logging
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from server.api import extractors




logger = logging.getLogger(__name__)

app = FastAPI(
    title = "NER using LLM",
    description = "Named Entity Recognition using Language Model",
    version = "0.1",
    openapi_tags= [
        {
            "name" : "NER", 
            "description" : "Operations related to Named Entity Recognition using Language Model"
        }
    ],
    debug =True
)


ROOT = Path(__file__).parent.parent.parent


app.add_middleware(
    CORSMiddleware,
    
    # TODO :update this to the endpoints calling this service
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods = ["*"],
    allow_headers = ["*"],
    
    
)

@app.get("/ready")
def ready():
    return {"status" : "ok"}

app.include_router(extractors.router)

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="localhost", port=8000)