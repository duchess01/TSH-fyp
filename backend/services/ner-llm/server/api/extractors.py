from fastapi import APIRouter, Depends, HTTPException
from uuid import uuid4, UUID
from server.models.extractors_model import CreateExtractor, GenericResponse, ExtractorData, ExtractorResponse
from db.dbconfig import get_session
from db.models import Extractor
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
import json
from sqlalchemy.exc import SQLAlchemyError


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
        
        
    except SQLAlchemyError as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
            
    
    
    

        
    
@router.get("/{extractor_name}")
async def getExtractorByName(extractor_name, session : Session = Depends(get_session)) -> GenericResponse: 
    
    try  :
        stmt = select(Extractor).where(Extractor.name == extractor_name.lower())
        
        result = session.execute(stmt)
        
        res = result.scalars().first()
        
        
        return GenericResponse(message = "GET Extractor by name success", data = res)
    
    except SQLAlchemyError as e :
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )



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
        return ExtractorResponse(message = "Extractor created successfully", data = ExtractorData(uuid = UUID(str(instance.uuid)), extractor_data = create_request))
        
    except SQLAlchemyError as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        
    