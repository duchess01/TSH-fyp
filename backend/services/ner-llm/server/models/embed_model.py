from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class GenericResponse(BaseModel):
    status_code : int = Field(default = 200, description = "HTTP status code")
    message : str = Field(..., description = "Message")
    data : Any = Field(..., description = "Data fields")

class EmbedKeywordsEndpoint(BaseModel):
    text : str = Field(..., description = "Text to embed")
    model_name : str = Field(default="text-embedding-ada-002", description = "Name of the embedding model to use")

class EmbedKeywordsReturn(BaseModel):
    embeddings : List[float] = Field(..., description = "Embeddings for the keywords")