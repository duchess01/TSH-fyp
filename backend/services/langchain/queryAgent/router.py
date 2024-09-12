import inspect
from fastapi import APIRouter

from backend.services.langchain.queryAgent.interface import Query, QueryResponseModel
from backend.services.langchain.utils.agent.agent_utils import initialize_agent_executor
from backend.services.langchain.services.chat.chat import ChatService
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
        user_id = query.userId
        session_id = query.chatSessionId
        chat_history = ChatService().get_chat_history(user_id, session_id)

        agent_executor = await initialize_agent_executor(chat_history)
        agent_response = agent_executor.run(user_query)

        # Check if the result is awaitable
        if inspect.isawaitable(agent_response):
            agent_response = await agent_response

        print(agent_response)

        response = QueryResponseModel(
            status_code=201,
            topic="test",  # TODO get topic based off a match
            user_query=user_query,
            agent_response=agent_response,
            message="success",
            data=None
        )

    except Exception as error:
        raise Exception(
            500, "Langchain agent query answer failed", str(error))
    return response
