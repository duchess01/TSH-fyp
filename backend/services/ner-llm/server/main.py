from fastapi import FastAPI, status, Request
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

import logging
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from server.api import extractors

from utils.exception import UnicornException





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




# handle exceptions 
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content = jsonable_encoder({
            "status_code" : status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message" : "Validation error: " + str(exc),
        })
    )
    
    
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder({
            "status_code" : exc.status_code,
            "message" : exc.detail,
        })
    )

    

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="localhost", port=8000)