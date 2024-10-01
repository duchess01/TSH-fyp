from pydantic import BaseModel, Field, validator
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import desc

# generic response model
class GenericResponse(BaseModel):
    
    status_code : int = Field(default = 200, description = "HTTP status code")
    message : str = Field(..., description = "Message")
    data : Any = Field(..., description = "Data fields")


