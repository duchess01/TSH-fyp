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
        
        
        retrievalResponse = await extractUsingExtractor(text, extractor, model_name, request.chunk_size, request.chunking)
        
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
        
        name = f"keyword_extractor_{request.keyword_count}"
        extractor = session.query(Extractor).filter_by(name=f"keyword_extractor_{request.keyword_count}").scalar()
        if extractor is None:
            # create extractor if it does not exist
            data = CreateExtractor(
                name = f"keyword_extractor_{request.keyword_count}",
                description= "this generates keywords from text, specifically NOUNS", 
                schema= KeywordExtractor.schema(),
                instruction= f"Extract keywords from the given text, focus on NOUNS and NOUN PHRASES, the result should limit the number of keywords extracted to {request.keyword_count} keywords. **DO NOT PROVIDE MORE THAN {request.keyword_count} KEYWORDS**.  ONLY PROVIDE {request.keyword_count} KEYWORDS. choose keywords based on RELEVANCY with the text given."
            )
            
            
            res = createExtractor(data, session)
            
            print("EXTRACTOR CREATED: ", res)
            
            extractor = session.query(Extractor).filter_by(name=f"keyword_extractor_{request.keyword_count}").scalar()
            
        
        keywordResponse = await extractUsingExtractor(text, extractor, model_name, chunk_size=request.chunk_size, chunking=request.chunking)
        
        keywordArrays = [res.data for res in keywordResponse]
        
        keywords = []
        for outer_list in keywordArrays:
            for inner_list in outer_list:
                for item_dict in inner_list["data"]:
                    print("keyword extracted: ", item_dict["keyword"])
                    if item_dict["keyword"].lower() not in keywords or item_dict["keyword"].lower() == "null":
                        keywords.append(item_dict["keyword"].lower())
            
        
        
        
                
            
            
        
        
        
        
        return GenericResponse(message="success", data=ExtractKeywordsReturn(keywords=keywords))
            
        
    except SQLAlchemyError as e: 
        raise HTTPException(status_code=500, detail=f"Internal server error : {str(e)}")
    
    
    
    
        
        