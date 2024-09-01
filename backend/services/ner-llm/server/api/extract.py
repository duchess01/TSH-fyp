from math import e
from fastapi import APIRouter, Form, HTTPException, Depends
from pydantic import Field
from typing import Optional
from db.models import Extractor
from server.llm_models import DEFAULT_MODEL
from server.model_extractor import extractUsingExtractor
from server.models.extractors_model import ExtractResponse, GenericResponse, ExtractEndpoint, ExtractKeywordsEndpoint, ExtractKeywordsReturn, KeywordExtractor, CreateExtractor
from db.dbconfig import get_session
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from server.api.extractors import createExtractor

import logging



router = APIRouter(
    prefix="/extract",
    tags=["using instructions and data from extractors in postgresdb, extract entities from text given"],
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
        
        
        extractor = session.query(Extractor).filter_by(extractor_id=uuid).scalar()
        
        if extractor is None:
            raise HTTPException(status_code=404, detail="Extractor not found")
        
        
        retrievalResponse = await extractUsingExtractor(text, extractor, model_name)
        
        return GenericResponse(message="success", data=retrievalResponse)
        
        
    except SQLAlchemyError as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        

    

    
@router.post("keywords", response_model = GenericResponse)
async def extractKeywords(
    request : ExtractKeywordsEndpoint,
    session : Session = Depends(get_session), 
) -> GenericResponse : 
    text = request.text
    model_name = request.model_name
    
    if request.text is None :
        raise HTTPException(status_code=423, detail="No text provided")
    
    
    # check if keyword extractor exists
    try : 
        extractor = session.query(Extractor).filter_by(name="keyword_extractor").scalar()
        if extractor is None:
            # create extractor if it does not exist
            data = CreateExtractor(
                name = "keyword_extractor",
                description= "this generates keywords from text, specifically NOUNS", 
                schema= KeywordExtractor.schema(),
                instruction= "Extract keywords from the given text, focus on NOUNS and NOUN PHRASES"
                
            )
            
            
            res = createExtractor(data, session)
            
            extractor = session.query(Extractor).filter_by(name="keyword_extractor").scalar()
            
            
        
        print(extractor, 'this is a extracotr')
        keywordResponse = await extractUsingExtractor(text, extractor, model_name)
        
        keywordArrays = [res.data for res in keywordResponse]
        print(keywordArrays, 'keyword arrays')
        
        # returnObject = {}
        # for chunki, chunk in enumerate(keywordArrays):
            
        #     chunkArray = []
        #     for resi, res in enumerate(chunk):
                
            
            
        
        
        
        
        return GenericResponse(message="success", data=keywordArrays)
            
        
    except SQLAlchemyError as e: 
        raise HTTPException(status_code=500, detail=f"Internal server error : {str(e)}")
    
    
    
    
        
        