from fastapi import APIRouter


router = APIRouter(
    prefix = "/extractors",
    tags = ["create extractors for NER using LLM based on different features required"],
    responses = {404 : {"description" : "Not found"}}
)

@router.get("/")
def get():
    return {"message" : "Get all extractors"}
