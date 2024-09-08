from pydantic import BaseModel, Field, validator
from typing import Any, Dict, List, Optional
from uuid import UUID
from server.validators import validate_json_schema
from server.llm_models import DEFAULT_MODEL
from langserve import CustomUserType
from server.models.examples import extractorExampleReq1, extractorExampleRes1


# class KeywordMapping(BaseModel):
#     __root__ : List[str] = Field(..., description = "Keyword mapping", example = ["value1", "value2"])

# class KeywordMappingRequest(BaseModel):
#     keywordArray : List[Dict[str,KeywordMapping]]  = Field(..., description = "Array of keyword mappings", example = [{"__root__": KeywordMapping(["value1", "value2"])}])   
    
class KeywordMapping(BaseModel):
    __root__: List[str] = Field(..., description="List of keyword values", example=["value1", "value2"])

    def __iter__(self):
        return iter(self.__root__)
    
    def __getitem__(self, item):
        return self.__root__[item]
    
class KeywordMappingRequest(BaseModel):
    keywordArray: List[Dict[str, KeywordMapping]] = Field(
        ..., 
        description="Array of keyword mappings", 
        example=[{"namespace": {"__root__": ["value1", "value2"]}}]
    )

    
    