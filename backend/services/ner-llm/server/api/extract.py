from fastapi import APIRouter, Form, HTTPException, Depends
from pydantic import Field
from typing import Optional
from db.models import Extractor
from server.llm_models import DEFAULT_MODEL
from server.model_extractor import extractUsingExtractor
from server.models.extractors_model import ExtractResponse, GenericResponse, ExtractEndpoint
from db.dbconfig import get_session
from sqlalchemy.orm import Session

import logging



router = APIRouter(
    prefix="/extract",
    tags=["extract"],
)


@router.post("", response_model = GenericResponse)
async def extractWithExtractor(
    request : ExtractEndpoint,
    session : Session = Depends(get_session), 
) -> GenericResponse :
    
    text = request.text
    uuid = request.extractor_id
    model_name = request.model_name
    
    if request.text is None :
        raise HTTPException(status_code=423, detail="No text provided")
    
    
    try :
        
        
        extractor = session.query(Extractor).filter_by(uuid=uuid).scalar()
        
        if extractor is None:
            raise HTTPException(status_code=404, detail="Extractor not found")
        
        
        retrievalResponse = await extractUsingExtractor(text, extractor, model_name)
        
        return GenericResponse(message="success", data=retrievalResponse)
        
        
    except Exception as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        

    

    