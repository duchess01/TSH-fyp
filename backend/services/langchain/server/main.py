import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
from dotenv import load_dotenv
from os.path import join, dirname
from starlette.middleware import Middleware

from backend.services.langchain.models.base import BaseResponseModel
from backend.services.langchain.queryAgent.router import query_router
from backend.services.langchain.constants.constants import BASE_URL_PREFIX
load_dotenv(join(dirname(__file__), '.env'))


ROOT = Path(__file__).parent.parent.parent
origins = ["*"]

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"],
    ),
]

app = FastAPI(title="Langchain Microservice", middleware=middleware)

app.include_router(query_router, prefix=BASE_URL_PREFIX)


@app.get(f"{BASE_URL_PREFIX}/healthcheck", response_model=BaseResponseModel)
def ready():
    response = BaseResponseModel(status_code=200, message="success", data=None)
    return response


if __name__ == "__main__":

    uvicorn.run("backend.services.langchain.server.main:app",
                host="localhost", port=8001, reload=True)
