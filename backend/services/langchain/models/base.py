from pydantic import BaseModel, Field
from typing import Any

class BaseResponseModel(BaseModel):
    status_code : int = Field(default = 200, description = "HTTP status code")
    message : str = Field(..., description = "Message")
    data : Any = Field(..., description = "Data fields")