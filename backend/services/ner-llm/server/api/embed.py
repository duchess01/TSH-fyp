from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.exc import SQLAlchemyError
from server.models.embed_model import EmbedKeywordsEndpoint, GenericResponse
from sqlalchemy.orm import Session
from db.dbconfig import get_session
from openai import OpenAI
import openai
import os
from openai.types import CreateEmbeddingResponse, Embedding

openai_api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(
    prefix="/embed",
    tags=["embeddings for keywords"],
)

@router.post("keywords", response_model=GenericResponse)
async def embedKeywords(
    request: EmbedKeywordsEndpoint,
    session: Session = Depends(get_session),
) -> GenericResponse:
    text = request.text
    model_name = request.model_name

    if request.text is None:
        raise HTTPException(status_code=423, detail="No text provided at request")

    try:
        client = OpenAI(api_key=openai_api_key)

        return GenericResponse(message="Success", data=client.embeddings.create(
            input=text,
            model=model_name
        ).data[0].embedding)

    except SQLAlchemyError as e:
        # handle other exceptions
        raise HTTPException(
            status_code=500, detail=f"Internal server error : {str(e)}"
        )
    except Exception as e:
        # Handle OpenAI API exceptions
        raise HTTPException(
            status_code=500, detail=f"Embedding generation failed: {str(e)}"
        )
