import os
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from typing import Optional



def getModels() :
    
    models = {}
    
    if "OPENAI_API_KEY" in os.environ : 
        models['gpt-3.5-turbo'] = {
            "chat_model" : ChatOpenAI(
                openai_api_key = os.environ.get("OPENAI_API_KEY"),
                model_name = "gpt-3.5-turbo",
                temperature = 0 
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


ALL_MODELS = getModels()

DEFAULT_MODEL  = "gpt-3.5-turbo"

AVAILABLE_MODELS = ALL_MODELS.keys()



def getChatModel(modelName : Optional[str] = None ) -> BaseChatModel:
    
    if modelName is None : 
        return ALL_MODELS[DEFAULT_MODEL]["chat_model"]
    
    
    if modelName not in AVAILABLE_MODELS : 
        raise ValueError(
            f"Model {modelName} not found"
        )
        
    return ALL_MODELS[modelName]["chat_model"]
    

        

