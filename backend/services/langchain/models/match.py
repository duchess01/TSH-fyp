from models.base import BaseResponseModel
from pydantic import BaseModel, Field, field_validator
from typing import Any, List, Dict, Optional
from server.validators import validate_json_schema
 
class SparseValues(BaseModel):
    indices: Optional[List[Any]] = None
    values: Optional[List[float]] = None

class MatchesData(BaseModel) :
     id : str = Field(..., description='match id')
     metadata : Any = Field(default=None, description = "metadata of match")
     score : float = Field(..., description = "similarity score")
     sparse_values : SparseValues = Field(...,description="Sparse values")
     values : List[float] = Field(..., description = "list of embedding values")
    
class returnMatches(BaseResponseModel) : 
    data : List[MatchesData] = Field(..., description  ="text response generated from the model")

    # @field_validator("data")
    # def validate_schema(cls, v: Any) -> Dict[str, Any]:
    #     # cls is the class itself
    #     # validates the schema and returns the validated schema
    #     validate_json_schema(v)
    #     return v
    
    
class findMatches(BaseModel):
    text_array : List[str] = Field(..., description = "an array of text chunks to be searched")
    name_space : str = Field(..., description= "namespace of the vector to be searched")
    model : str = Field(default="gpt-3.5-turbo", description = "model to be used for embedding search", alias="model_name")
    
 