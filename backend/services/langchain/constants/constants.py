from typing import Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
import os

BASE_URL_PREFIX = "/langchain"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT")

llm = ChatGroq(
    model="llama3-8b-8192",
    api_key=GROQ_API_KEY
)


def getModels():
    models = {}
    if "OPENAI_API_KEY" in os.environ:
        models['gpt-4o-mini'] = {
            "chat_model": ChatOpenAI(
                model_name="gpt-4o-mini",
                temperature=0
            )
        }
        models['gpt-4o'] = {
            "chat_model": ChatOpenAI(
                model_name="gpt-4o",
                temperature=0
            )
        }
    if "GROQ_API_KEY" in os.environ:
        models["groq-llama3-8b-8192"] = {
            "chat_model": ChatGroq(
                model="llama3-8b-8192",
                temperature=0,
            ),
            "description": "GROQ Llama 3 8B",
        }
    return models


def getChatModel(modelName: Optional[str] = None) -> BaseChatModel:
    if modelName is None:
        return ALL_MODELS[DEFAULT_MODEL]["chat_model"]
    if modelName not in AVAILABLE_MODELS:
        raise ValueError(
            f"Model {modelName} not found"
        )
    return ALL_MODELS[modelName]["chat_model"]


ALL_MODELS = getModels()
DEFAULT_MODEL = "gpt-4o-mini"
AVAILABLE_MODELS = ALL_MODELS.keys()
