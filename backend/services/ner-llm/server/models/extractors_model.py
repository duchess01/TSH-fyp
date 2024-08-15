from pydantic import BaseModel, Field, validator
from typing import Any, Dict
from uuid import UUID
from server.validators import validate_json_schema



class CreateExtractor(BaseModel) : 
    name : str = Field(default="", description="Name of the extractor e.g. BaseEntityExtractor, MachineEntityExtractor. OPTIONAL")
    description : str = Field(
        default ="", description = "Description of the extractor. OPTIONAL"
    )
    
    # json schema must be a valid json schema, string : any
    json_schema : Dict[str, Any] = Field (
        ... , description = "JSON schema for the extractor. REQUIRED", alias ="schema"
    )
    instruction : str = Field(..., description = "instructor for the extractor. REQUIRED")
    
    @validator("json_schema")
    def validate_schema(cls, v: Any) -> Dict[str, Any]:
        # cls is the class itself
        # validates the schema and returns the validated schema
        validate_json_schema(v)
        return v


class ExtractorData(BaseModel):
    uuid : UUID = Field(..., description = "UUID of the extractor")
    extractor_data : CreateExtractor = Field(..., description = "Extractor data")
    
    
class CreateExtractorResponse(BaseModel):
    
    status_code : int = Field(default = 201, description = "HTTP status code")
    message : str = Field(default = "Extractor created successfully", description = "Message")
    data : ExtractorData = Field(..., description = "Data fields")
