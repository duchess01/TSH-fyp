from pydantic import BaseModel, Field
from typing import Dict, List, Any

from db.models import UploadStatus


 
    
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
        example=[{"testnamespace": ["value1", "value2"]}]
    )
    
class KeywordData(BaseModel):
    keywords: List[str]
    embeddings: List[float]
    
class ManualMappingRequest(BaseModel):
    manual_name: str = Field(..., description="The name of the manual to track the status of", examples=["manual1", "manual2"])
    manual_mappings: Dict[str, Dict[str, KeywordData]] = Field(
        ..., 
        description="The keyword mappings to associate with the manual",
        example={
            "1 GENERAL": {
                "data": {
                    "keywords": [
                        "manual",
                        "fl-net functions",
                        "fanuc series 30i/300 i",
                        # ... other keywords ...
                    ],
                    "embeddings": [
                        -0.017720036208629608,
                        -0.0034378536511212587,
                        0.0021699066273868084,
                        # ... other embedding values ...
                    ]
                }
            },
            # ... other sections ...
        }
    )
    machine_name : str = Field(..., description="The name of the machine the manual is for", examples=["machine1", "machine2"])


class ManualStatusRequest(BaseModel):
    manual_name: str = Field(..., description="The name of the manual to track the status of", examples=["manual1", "manual2"])
    status: UploadStatus = Field(..., description = "The status of the manual upload", examples=["in_progress","pending",  "completed", "failed"])
