from pydantic import BaseModel, Field
from typing import Any, Optional


class BaseResponseModel(BaseModel):
    status_code: int = Field(default=200, description="HTTP status code")
    message: Optional[str] = Field(..., description="Message")
    data: Optional[Any] = Field(..., description="Data fields")
