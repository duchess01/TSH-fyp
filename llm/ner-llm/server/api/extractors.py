from fastapi import APIRouter
from pydantic import BaseModel, Field, validator
from typing import Any, Dict
from server.validators import validate_json_schema


router = APIRouter(
    prefix = "/extractors",
    tags = ["create extractors for NER using LLM based on different features required"],
    responses = {404 : {"description" : "Not found"}}
)


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
        

@router.get("/")
def get():
    return {"message" : "Get all extractors"}




@router.post("")

def create_extractor(
    create_request : CreateExtractor
):
    return {"message" : "Create extractor", "data" : create_request.dict()}
    