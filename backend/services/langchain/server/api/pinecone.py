# import inspect
# import json
# import os
# from typing import Any, List, Optional

# from fastapi import APIRouter, HTTPException
# from fastapi.encoders import jsonable_encoder
# from langchain_openai import OpenAIEmbeddings
# from langchain_pinecone import PineconeVectorStore
# from sentence_transformers import SentenceTransformer
# from langchain.chains import RetrievalQA
# from pydantic import BaseModel, Field, ValidationError

# from services.pineconeInit import pcIndex
# from constants.constants import getChatModel
# from models.base import BaseResponseModel
# from models.match import MatchesData, findMatches, returnMatches
# from utils.embeddings import getEmbeddings

# router = APIRouter(
#     prefix="/pinecone",
#     tags=["Extractor Objects"],
# )


# @router.post("", response_model=returnMatches)
# async def extractWithExtractor(match: findMatches
#                                ) -> returnMatches:
#     # parameters
#     # namespace
#     # text chunk

#     #     # model_name (defaults to gpt-3.5-turbo)
#     #     # print("here only")
#     llm = getChatModel(modelName=match.model)
# #     # print('reached here')
# #     print(type(llm), 'type llm')
# #     # instantiate langchain openai
# #     print(os.environ.get("PINECONE_INDEX_NAME"), 'pineconeindex')

#     embeddingModel = SentenceTransformer(
#         'sentence-transformers/all-MiniLM-L6-v2')

#     embeddings = getEmbeddings(embeddingModel, match.text_array)

#     responses = []
#     for index, emb in enumerate(match.text_array):
#         query_res = pcIndex.query(
#             namespace=match.name_space,
#             vector=embeddings[index],
#             top_k=1,
#             include_values=True
#         )

#         result = query_res.get('matches', [])
#         if not result:
#             print(f"No matches found for index {index}")

#         responses.append(result)

#     # knowledge = PineconeVectorStore.from_existing_index(
#     #     index_name = os.environ.get("PINECONE_INDEX_NAME"),
#     #     namespace = match.name_space,
#     #     embedding = OpenAIEmbeddings(OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY"))
#     # )

#     # # extract knowledge from pineconeDB
#     # # chain type values = ["stuff", "map_reduces", "refine", "map_reduce_refine"]
#     # qa = RetrievalQA.from_chain_type(
#     #     llm = llm ,
#     #     chain_type = "refine",
#     #     retriever = knowledge.as_retriever()
#     # )

#     # res = qa.invoke(match.text_array[0]).get("result")

#     print('RESP', responses, 'RESP2')

#     try:
#         responses_list = responses[0]
#         processed_responses = []
#         for response in responses_list:
#             single_response = MatchesData(**response.to_dict())
#             processed_responses.append(single_response)

#         return returnMatches(status_code=200, data=processed_responses, message="success")

#     except ValidationError as exc:
#         print("Validation Errors", exc.errors(), "END of ERRORS")
