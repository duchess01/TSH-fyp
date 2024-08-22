from fastapi import APIRouter

from services.pineconeInit import pcIndex
from llm_models import getChatModel
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from models.match import findMatches, returnMatches
from models.base import BaseResponseModel
from utils.embeddings import getEmbeddings
import os
from sentence_transformers import SentenceTransformer
from fastapi.encoders import jsonable_encoder
from models.match import returnMatches
from pydantic import ValidationError
import json


router = APIRouter(
    prefix = "/pinecone",
    tags = ["Extractor Objects"],
)




@router.post("", response_model = returnMatches)
async def extractWithExtractor(match : findMatches
) -> returnMatches :
    # parameters 
    # namespace 
    # text chunk 
    
    
    # model_name (defaults to gpt-3.5-turbo)
    print("here only")
    llm = getChatModel(modelName = match.model)
    print('reached here')
    print(type(llm), 'type llm')
    # instantiate langchain openai
    print(os.environ.get("PINECONE_INDEX_NAME"), 'pineconeindex')
    
    embeddingModel = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    embeddings = getEmbeddings(embeddingModel, match.text_array)
    
    
    responses = []
    for index, emb in enumerate(match.text_array):
        query_res = pcIndex.query(
            namespace = match.name_space,
            vector = embeddings[index],
            top_k = 1,
            include_values = True
        )
        
        result = query_res.get('matches', [])
        if not result :
            print(f"No matches found for index {index}")
            
             
        
        responses.append(result)
            
        
        
    
    # knowledge = PineconeVectorStore.from_existing_index(
    #     index_name = os.environ.get("PINECONE_INDEX_NAME"),
    #     namespace = match.name_space,
    #     embedding = OpenAIEmbeddings(openai_api_key = os.environ.get("OPENAI_API_KEY"))
    # )
    
    # # extract knowledge from pineconeDB
    # # chain type values = ["stuff", "map_reduces", "refine", "map_reduce_refine"]
    # qa = RetrievalQA.from_chain_type(
    #     llm = llm , 
    #     chain_type = "refine",
    #     retriever = knowledge.as_retriever()
    # )    
        
    # res = qa.invoke(match.text_array[0]).get("result")
    
    print('res', responses, 'res')
    
    dataArray = [] 
    
    try :
    
    
        return returnMatches(data = responses, messages= "success")
    
    except ValidationError as exc : 
        print(repr(exc.errors()[0]['type'])) 