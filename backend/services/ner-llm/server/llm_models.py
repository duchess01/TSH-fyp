import os


from langchain_fireworks import ChatFireworks
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel
from typing import Optional


def getModels():
    # https://python.langchain.com/v0.1/docs/modules/model_io/chat/structured_output/

    # get models if API key exists in ENV
    models = {}
    if "OPENAI_API_KEY" in os.environ:
        models["gpt-3.5-turbo"] = {
            "chat_model": ChatOpenAI(model="gpt-3.5-turbo", temperature=0),
            "description": "GPT-3.5 Turbo",
        }
        models["gpt-4o"] = {
            "chat_model": ChatOpenAI(model="gpt-4o", temperature=0),
            "description": "GPT-4o"
        }
        if os.environ.get("DISABLE_GPT4", "").lower() != "true":
            models["gpt-4-0125-preview"] = {
                "chat_model": ChatOpenAI(model="gpt-4-0125-preview", temperature=0),
                "description": "GPT-4 0125 Preview",
            }
    if "FIREWORKS_API_KEY" in os.environ:
        models["fireworks"] = {
            "chat_model": ChatFireworks(
                model="accounts/fireworks/models/firefunction-v1",
                temperature=0,
            ),
            "description": "Fireworks Firefunction-v1",
        }
    if "TOGETHER_API_KEY" in os.environ:
        models["together-ai-mistral-8x7b-instruct-v0.1"] = {
            "chat_model": ChatOpenAI(
                base_url="https://api.together.xyz/v1",
                api_key=os.environ["TOGETHER_API_KEY"],
                model="mistralai/Mixtral-8x7B-Instruct-v0.1",
                temperature=0,
            ),
            "description": "Mixtral 8x7B Instruct v0.1 (Together AI)",
        }
    if "ANTHROPIC_API_KEY" in os.environ:
        models["claude-3-sonnet-20240229"] = {
            "chat_model": ChatAnthropic(
                model="claude-3-sonnet-20240229", temperature=0
            ),
            "description": "Claude 3 Sonnet",
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


ALL_MODELS = getModels()


def getChatModel(model_name: Optional[str] = None) -> BaseChatModel:
    # depending on which model, get its chat model

    if model_name is None:
        return ALL_MODELS[DEFAULT_MODEL]["chat_model"]

    else:
        # validate whether the model exist in supported models
        ALL_MODELS_KEYS = ALL_MODELS.keys()

        if model_name not in ALL_MODELS_KEYS:
            raise ValueError(
                f"Model {model_name} not found"
            )

        else:

            return ALL_MODELS[model_name]["chat_model"]


allSupportedModels = ALL_MODELS
DEFAULT_MODEL = "gpt-3.5-turbo"
