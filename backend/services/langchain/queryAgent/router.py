import inspect
from fastapi import APIRouter

from queryAgent.interface import Query, QueryResponseModel
from utils.agent.agent_utils import initialize_agent_executor
from services.chat.chat import ChatService
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
        chat_history, latest_topic = ChatService().get_chat_history(user_id, session_id)
        agent_executor = await initialize_agent_executor(chat_history)
        agent_response = agent_executor.run(user_query)

        # Check if the result is awaitable
        if inspect.isawaitable(agent_response):
            agent_response = await agent_response

        if (type(agent_response) == str):
            agent_message = agent_response
            topic = latest_topic
        else:
            agent_message, topic = agent_response
        response = QueryResponseModel(
            status_code=201,
            topic=topic,
            user_query=user_query,
            agent_response=agent_message,
            message="success",
            data=None
        )

    except Exception as error:
        raise Exception(
            500, "Langchain agent query answer failed", str(error))
    return response
