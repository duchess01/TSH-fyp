from pydantic import BaseModel, Field
from typing import Dict, List


 
    
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

    
    