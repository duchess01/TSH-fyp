from pydantic import BaseModel
from typing import Optional, List
from models.base import BaseResponseModel


class Upsert(BaseModel):
    query: str
    ids: List[str]


class QueryQnA(BaseModel):
    query: str


class QueryQnAResponse(BaseResponseModel):
    ids: List[str]
    