from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any, Dict


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

@router.get("/")
def get():
    return {"message" : "Get all extractors"}




@router.post("")

def create_extractor(
    create_request : CreateExtractor
):
    return {"message" : "Create extractor", "data" : create_request.dict()}
    