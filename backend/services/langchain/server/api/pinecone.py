import json
import os
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from llm_models import getChatModel
from models.base import BaseResponseModel
from models.match import MatchesData, findMatches, returnMatches
from pydantic import BaseModel, Field, ValidationError
from sentence_transformers import SentenceTransformer
from services.pineconeInit import pcIndex
from utils.embeddings import getEmbeddings
import inspect

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
    
    
#     # model_name (defaults to gpt-3.5-turbo)
#     # print("here only")
    llm = getChatModel(modelName = match.model)
#     # print('reached here')
#     print(type(llm), 'type llm')
#     # instantiate langchain openai
#     print(os.environ.get("PINECONE_INDEX_NAME"), 'pineconeindex')
    
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
    
    print('RESP', responses, 'RESP2')
    
#     dataArray = [] 
    
    try :
        # print(MatchesData, 'matches data')
        # print(responses[0][0], 'responses')
        # match_data = MatchesData(**responses[0][0])
        # print("MATCH DATA", match_data)
        # if(responses):
        #     print("RESPONSES IS TRUE")
        # if(responses[0]):
        #     print("responses[0] is TRUE")
        # if(responses[0][0]):
        #     print("responses[0][0] is TRUE",type(responses[0][0]), responses[0][0])
            # List all attributes and methods
            # print(dir(responses[0][0]))

            # # Get detailed help documentation
            # help(responses[0][0])

            # # Check if specific attributes exist and print them
            # if hasattr(responses[0][0], 'id'):
            #     print('ID:', responses[0][0].id)

            # # Inspect the instance's dictionary of attributes
            # print(responses[0][0].__dict__)

            # # Get the source code of the class (if accessible)
            # print(inspect.getsource(type(responses[0][0])))

################################################################################################
######### Uncomment below to return SINGLE MATCHESDATA ######################
################################################################################################
        responses_dict = responses[0][0].to_dict()
        # return MatchesData(**responses_dict)

################################################################################################




        # print(responses[0][0].to_dict(), 'to dict')
        # print(type(responses[0][0].to_dict()), 'to dict type')
        # print("RESPONSES DICT")
        # print(responses_dict.values())
        # for keys, values in responses[0][0].to_dict():
        #     print("keys, values")
        #     print(keys, values)
        #     print(type(keys), type(values))


        # return MatchesData(**responses_dict)
        # return MatchesData(id=responses[0][0].id, metadata=responses[0][0].metadata, score=responses[0][0].score,
        #                    sparse_values=responses[0][0].sparse_values, values=responses[0][0].values)
        
        # if(MatchesData(**responses_dict)):
        #     print("MATCHES DATA")
        responses_list = responses[0]
        processed_responses = []
        for response in responses_list:
            single_response = MatchesData(**response.to_dict())
            processed_responses.append(single_response)

        # match_data = MatchesData(**responses_dict)
        # print(match_data.model_dump(), 'match_data serialized')

        # print(match_data, 'match_data', type(match_data))
    
        return returnMatches(status_code = 200, data = processed_responses, message= "success")

################################################################################################
######### Uncomment below to return LIST of MATCHESDATA ######################
################################################################################################
        from fastapi.responses import JSONResponse

        responses_list = responses[0]
        processed_responses = []
        for response in responses_list:
            processed_responses.append(response.to_dict())

        response_data = {
            'status_code': 200,
            'message': 'success',
            'data': processed_responses
        }
        return JSONResponse(content=response_data)

################################################################################################
    
    except ValidationError as exc : 
        
        print("Validation Errors", exc.errors(), "END of ERRORS")
        # print("Validation Error",repr(exc.errors()[0]['type'])) 
