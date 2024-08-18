from fastapi import APIRouter, Depends, HTTPException
from uuid import uuid4
from server.models.extractors_model import CreateExtractor, GenericResponse, ExtractorData, ExtractorResponse
from db.dbconfig import get_session
from db.models import Extractor
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

import json


router = APIRouter(
    prefix = "/extractors",
    tags = ["Extractor Objects"],
)




@router.get("", summary="get all extractors")
def get(
    
    session : Session = Depends(get_session)
) -> GenericResponse:
    

    
    try :
        
        res = session.query(Extractor).all()
        
        return GenericResponse(message="GET Extractor success", data = res)
        
        
    except Exception as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
            
    
    
    

        
    
    
@router.get("/{name}")
async def getExtractorByName(name, session : Session = Depends(get_session)) : 
    
    stmt = select(Extractor).where(Extractor.name == name.lower())
    
    result = session.execute(stmt)
    
    print(result.scalars().all())



@router.post("", summary = "create an extraction", description="create an extractor from a pydantic model. \n\n schema can be defined using a pydantic function (class.schema())")
def createExtractor(
    create_request : CreateExtractor,
    
    # depends allows to use the same session in the same request
    session : Session = Depends(get_session), 
) -> ExtractorResponse:
    
    # TODO : 
    
    # check if extractor exist
    
    
    
    try :
        instance = Extractor(
        name = create_request.name,
        extractor_id = uuid4(),
        schema = create_request.json_schema,
        description = create_request.description,
        instruction = create_request.instruction
        )
        
        
        session.add(instance)
        session.commit()
        return ExtractorResponse(message = "Extractor created successfully", data = ExtractorData(uuid = instance.uuid, extractor_data = create_request))
        
    except Exception as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        
    