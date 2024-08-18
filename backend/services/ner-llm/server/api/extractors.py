from fastapi import APIRouter, Depends, HTTPException
from uuid import uuid4
from server.models.extractors_model import CreateExtractor, GenericResponse, ExtractorData
from db.dbconfig import get_session
from db.models import Extractor
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

import json


router = APIRouter(
    prefix = "/extractors",
    tags = ["create extractors for NER using LLM based on different features required"],
)




@router.get("")
def get(
    
    session : Session = Depends(get_session)
) -> GenericResponse:
    

    
    try :
        
        res = session.query(Extractor).all()
        
        return GenericResponse(data = res)
        
        
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



@router.post("")
def createExtractor(
    create_request : CreateExtractor,
    
    # depends allows to use the same session in the same request
    session : Session = Depends(get_session), 
) -> GenericResponse:
    
    # TODO : post to postgresql db, create extractor and return the uuid
    
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
        return GenericResponse(data = ExtractorData(uuid = instance.uuid, extractor_data = create_request))
        
    except Exception as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        
    