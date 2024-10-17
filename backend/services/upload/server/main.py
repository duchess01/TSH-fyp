
# to be changed upon deployment
import sys 
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
##################################################################################

from fastapi import FastAPI, status, Request
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

import uvicorn
import logging
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from server.api import upload




logger = logging.getLogger(__name__)

app = FastAPI(
    title="Upload Service",
    description="Service to upload PDF files to be processed.",
    version="0.1",
    openapi_tags=[
        {
            "name": "upload",
            "description": "Operations related to upload of pdf files"
        }
    ],
    debug=True
)




app.add_middleware(
    CORSMiddleware,

    # TODO :update this to the endpoints calling this service
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],


)


@app.get("/ready")
def ready():
    return {"status": "ok"}


app.include_router(upload.router)


# handle exceptions
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message": "Validation error: " + str(exc),
        })
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder({
            "status_code": exc.status_code,
            "message": str(exc.detail),
        })
    )


if __name__ == "__main__":

    uvicorn.run("server.main:app", host="localhost", port=8001, reload=True)
