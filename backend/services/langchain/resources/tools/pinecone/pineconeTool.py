import os
from dotenv import load_dotenv
from langchain.agents import Tool
from langchain.chains import LLMChain

from resources.tools.pinecone.utils import initialize_pinecone_index, get_embedding
from resources.tools.pinecone.prompt import RAG_PROMPT
from constants.constants import ALL_MODELS
from services.ner_llm.ner_llm import NerLLMService
from .utils import match_namespace

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
        query_vector = get_embedding(query)
        keyword_map = NerLLMService().get_keyword_mapping()
        namespace = match_namespace(keyword_map, query)
        response = self.index.query(
            namespace=namespace,
            top_k=2,
            include_values=True,
            include_metadata=True,
            vector=query_vector
        )
        concatenated_text = " ".join(
            res["metadata"]["data"][0] for res in response["matches"])

        rag_chain = LLMChain(llm=llm, prompt=RAG_PROMPT)
        rag_response = rag_chain.predict(
            question=query,
            context=concatenated_text
        )
        return (rag_response, namespace)


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
