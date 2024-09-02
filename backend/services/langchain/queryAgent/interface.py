from pydantic import BaseModel
from typing import Optional

from backend.services.langchain.models.base import BaseResponseModel


class Query(BaseModel):
    query: str
    userId: Optional[str]
    sessionId: str


class QueryResponseModel(BaseResponseModel):
    topic: str
    user_query: str
    agent_response: str
