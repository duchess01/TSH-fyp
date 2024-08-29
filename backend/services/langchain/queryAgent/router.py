from fastapi import APIRouter

from backend.services.langchain.queryAgent.interface import Query, QueryResponseModel

prefix = "/queryAgent"

query_router = APIRouter(
    prefix=prefix
)


@query_router.post(
    "/",
    response_model=QueryResponseModel,
    response_model_exclude_none=True,
    description="gets LangChain agent response based on user query"
)
async def get_response(query: Query):
    try:
        user_query = query.query

        response = QueryResponseModel(
            status_code=201,
            topic="test",
            user_query=user_query,
            agent_response="test",
            message="success",
            data=None
        )

    except Exception as error:
        raise Exception(
            500, "Langchain agent query answer failed", str(error))
    return response
