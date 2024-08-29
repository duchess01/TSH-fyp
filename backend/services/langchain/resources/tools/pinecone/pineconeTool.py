import asyncio
import os
from dotenv import load_dotenv
from langchain.agents import Tool, initialize_agent, AgentType
from langchain_groq import ChatGroq
from backend.services.langchain.resources.tools.pinecone.utils import initialize_pinecone_index, encode_string
from backend.services.langchain.utils.agent.agent_prompt import prompt

load_dotenv()
pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
groq_key = os.getenv("GROQAI_KEY")


class PineconeQueryTool:
    def __init__(self, pinecone_index_name):
        self.index = None
        self.pinecone_index_name = pinecone_index_name

    async def initialize(self):
        self.index = await initialize_pinecone_index(self.pinecone_index_name)

    async def run(self, query: str):
        query_vector = await encode_string(query)
        response = self.index.query(
            namespace='Interpolation Functions:Cutting Point Interpolation For Cylindrical Interpolation (G07.1)',
            top_k=3,
            include_values=True,
            include_metadata=True,
            vector=query_vector
        )
        return [match['id'] for match in response['matches']]


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


async def main():
    # Setup the Pinecone tool
    pinecone_tool = await setup_pinecone_tool()
    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=groq_key
    )

    # Initialize the agent with the tool(s)
    agent = initialize_agent(
        tools=[pinecone_tool],  # Pass the list of tools here
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        llm=llm,
        prompt=prompt
    )

    # Example usage
    response = await agent.run("Modifying the cartridge management table")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())
