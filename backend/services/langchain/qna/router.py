import inspect
from fastapi import APIRouter
import os
from resources.tools.pinecone.utils import get_embedding, initialize_pinecone_index

from dotenv import load_dotenv

from qna.interface import Upsert, QueryQnA, QueryQnAResponse

load_dotenv()

prefix = "/qna"

qna_router = APIRouter(
    prefix=prefix
)


@qna_router.post(
    "/upsert",
    description="upsert qna data into pinecone"
)
async def upsert_qna(query: Upsert):
    try:
        index = await initialize_pinecone_index(os.getenv("PINECONE_QNA_INDEX_NAME"))
        query_embedding = get_embedding(query.query)
        upsert_data = [
            {
                "id": query.ids[0],
                "values": query_embedding,
                "metadata": {
                    "ids": query.ids
                }
            }
        ]
        upsert_response = index.upsert(vectors=upsert_data)

        return {"status": "success", "upserted_count": upsert_response.upserted_count}

    except Exception as error:
        raise Exception(
            500, "Pinecone QnA upsert failed", str(error))


@qna_router.get(
    "/retrieveQna",
    description="query qna data from pinecone"
)
async def query_qna(query: QueryQnA):
    try:
        index = await initialize_pinecone_index(os.getenv("PINECONE_QNA_INDEX_NAME"))
        query_embedding = get_embedding(query.query)
        query_response = index.query(
            vector=query_embedding,
            top_k=1,
            score_threshold=0.7,
            include_values=True,
            include_metadata=True
        )

        if not query_response["matches"]:
            return {"status": "no_match", "ids": []}

        res = []
        for match in query_response["matches"]:
            res.append(match["metadata"]["ids"])
        return {"status": "success", "ids": res}

    except Exception as error:
        raise Exception(
            500, "Pinecone QnA query failed", str(error))
