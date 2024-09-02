import asyncio
import os
from dotenv import load_dotenv
from langchain.agents import Tool, initialize_agent, AgentType
from langchain_groq import ChatGroq
from langchain.chains import LLMChain

from backend.services.langchain.resources.tools.pinecone.utils import initialize_pinecone_index, encode_string
from backend.services.langchain.resources.tools.pinecone.prompt import RAG_PROMPT
from backend.services.langchain.constants.constants import ALL_MODELS

load_dotenv()
pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
llm = ALL_MODELS["gpt-4o-mini"]["chat_model"]


class PineconeQueryTool:
    def __init__(self, pinecone_index_name):
        self.index = None
        self.pinecone_index_name = pinecone_index_name

    async def initialize(self):
        self.index = await initialize_pinecone_index(self.pinecone_index_name)

    async def run(self, query: str):
        query_vector = encode_string(query)
        response = self.index.query(
            namespace='Interpolation Functions:Cutting Point Interpolation For Cylindrical Interpolation (G07.1)',
            top_k=2,
            include_values=True,
            include_metadata=True,
            vector=query_vector
        )
        concatenated_text = " ".join(
            res["metadata"]["text"] for res in response["matches"])
        print("CONTEXT: ", concatenated_text)
        rag_chain = LLMChain(llm=llm, prompt=RAG_PROMPT)
        rag_response = rag_chain.predict(
            question=query,
            context=concatenated_text
        )
        print("RAG RESPONSE: ", rag_response)
        return rag_response


async def setup_pinecone_tool():
    tool = PineconeQueryTool(pinecone_index_name)
    await tool.initialize()
    pinecone_tool = Tool(
        name="Question Answer Retrieval Tool",
        func=tool.run,  # Directly reference the async function
        description="Useful for when you need to answer questions."
    )
    pinecone_tool.return_direct = True
    return pinecone_tool
