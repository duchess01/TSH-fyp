from pydantic import BaseModel, Field
from typing import Optional


class test_extractor_models_1(BaseModel):
# test machine model
    name : str = Field(..., description="name of the machine")
    part : str = Field(..., description="part of the machine")
    feature : str = Field(..., description = "feature of the machine")
        
class test_extractor_models_2(BaseModel):
    # Extended extractor model with additional fields
    model_id: int = Field(..., description="Unique identifier for the model")
    manufacturer: str = Field(..., description="Manufacturer of the machine")
    installation_date: str = Field(..., description="Date when the machine was installed")
    last_maintenance_date: Optional[str] = Field(None, description="Date of the last maintenance performed on the machine")
    operational_status: str = Field(..., description="Current operational status of the machine")
    serial_number: str = Field(..., description="Serial number of the machine")
    warranty_expiry_date: Optional[str] = Field(None, description="Warranty expiry date of the machine")
    location: str = Field(..., description="Physical location where the machine is installed")
    operational_hours: Optional[int] = Field(None, description="Total hours the machine has been operational")
    notes: Optional[str] = Field(None, description="Additional notes or comments about the machine")