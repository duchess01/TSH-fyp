from fastapi import APIRouter, Depends, HTTPException
from uuid import uuid4
from server.models.extractors_model import CreateExtractor, CreateExtractorResponse, ExtractorData
from db.dbconfig import get_session
from db.models import Extractor
from sqlalchemy.orm import Session


router = APIRouter(
    prefix = "/extractors",
    tags = ["create extractors for NER using LLM based on different features required"],
    responses = {404 : {"description" : "Not found"}}
)




@router.get("/")
def get():
    return {"message" : "Get all extractors"}




@router.post("")
def createExtractor(
    create_request : CreateExtractor,
    
    # depends allows to use the same session in the same request
    session : Session = Depends(get_session), 
) -> CreateExtractorResponse:
    
    # TODO : post to postgresql db, create extractor and return the uuid
    
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
        return CreateExtractorResponse(data = ExtractorData(uuid = instance.uuid, extractor_data = create_request))
        
    except Exception as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        
    