from pydantic import BaseModel, Field, validator
from typing import Any, Dict, List, Optional
from uuid import UUID
from server.validators import validate_json_schema
from server.llm_models import DEFAULT_MODEL
from langserve import CustomUserType
from server.models.examples import extractorExampleReq1, extractorExampleRes1



class CreateExtractor(BaseModel) : 
    name : str = Field(default="", description="Name of the extractor e.g. BaseEntityExtractor, MachineEntityExtractor. OPTIONAL")
    description : str = Field(
        default ="", description = "Description of the extractor. OPTIONAL"
    )
    
    # json schema must be a valid json schema, string : any
    json_schema : Dict[str, Any] = Field (
        ... , description = "JSON schema for the extractor. REQUIRED", alias ="schema", examples=[
            
                extractorExampleReq1
                
            
        ]
    )
    instruction : str = Field(..., description = "instructor for the extractor. REQUIRED")
    

    
    
    
    @validator("json_schema")
    def validate_schema(cls, v: Any) -> Dict[str, Any]:
        # cls is the class itself
        # validates the schema and returns the validated schema
        validate_json_schema(v)
        return v
    
    
    # validator will run first, and even if value not provided
    @validator("name", pre=True, always=True)
    def to_lowercase(cls, v : Any) -> str : 
        
        if isinstance(v, str):
            return v.lower()
        
        return v

class ExtractResponse(BaseModel):
    """Response body for the extract endpoint."""

    data: List[Any]
    
    # for potential future chunking
    content_too_long: Optional[bool]


class ExtractorData(BaseModel):
    uuid : UUID = Field(..., description = "UUID of the extractor")
    extractor_data : CreateExtractor = Field(..., description = "Extractor data")
    
    
class GenericResponse(BaseModel):
    
    status_code : int = Field(default = 200, description = "HTTP status code")
    message : str = Field(..., description = "Message")
    data : Any = Field(..., description = "Data fields")
    
class ExtractorResponse(GenericResponse):
    data : ExtractorData = Field(..., description = "data provided after POST request")

class ExtractEndpoint(BaseModel) :
    extractor_id : str = Field(... , description = "id of the extractor", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6" )
    text : str = Field(..., description = "a text provided by the user to be extracted", example = "Regarding the m2h12 panasonic, how is the servo able to do a anterior extortion ? ")
    model_name : str = Field(default = DEFAULT_MODEL, description = "name of the model, possible values include :  gpt-3.5-turbo, gpt-4-0125-preview, fireworks, together-ai-mistral-8x7b-instruct-v0.1, claude-3-sonnet-20240229 , groq-llama3-8b-8192", example = "groq-llama3-8b-8192")
    
    
class ExtractRequest(CustomUserType) : 
    
    text: str = Field(..., description="text provided by user to be extracted from")
    json_schema: Dict[str, Any] = Field(
        ...,
        description="JSON schema obtained from extractor, describes what content to be extracted from the text.",
        alias="schema"
    )
    instructions: Optional[str] = Field(
        None, description="Supplemental system instructions."
    )
    # examples: Optional[List[ExtractionExample]] = Field(
    #     None, description="Examples of extractions."
    # )
    model_name: Optional[str] = Field("gpt-3.5-turbo", description="Chat model to use.")

    @validator("json_schema")
    def validate_schema(cls, v: Any) -> Dict[str, Any]:
        validate_json_schema(v)
        return v