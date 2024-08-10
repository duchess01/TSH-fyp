from fastapi import APIRouter
from uuid import uuid4
from server.models.extractors_model import CreateExtractor, CreateExtractorResponse, ExtractorData
from db.dbconfig import get_session
from db.models import Extractor

router = APIRouter(
    prefix = "/extractors",
    tags = ["create extractors for NER using LLM based on different features required"],
    responses = {404 : {"description" : "Not found"}}
)




@router.get("/")
def get():
    return {"message" : "Get all extractors"}




@router.post("")
def create_extractor(
    create_request : CreateExtractor
) -> CreateExtractorResponse:
    
    # TODO : post to postgresql db, create extractor and return the uuid
    return CreateExtractorResponse(data = ExtractorData(uuid = uuid4(), extractor_data = create_request))