from resources.tools.pinecone.pineconeTool import setup_pinecone_tool
from utils.agent.agent_prompt import agent_prefix, create_agent_suffix
from constants.constants import ALL_MODELS

import re
import os
from pydantic import Field
from typing import Any, Union, Optional, Tuple, ClassVar
from langchain.agents.mrkl.output_parser import MRKLOutputParser
from langchain.agents import Tool
from langchain.agents import AgentExecutor, ZeroShotAgent, AgentOutputParser
from langchain.agents.mrkl.output_parser import MRKLOutputParser
from langchain.schema import AgentAction, AgentFinish, OutputParserException
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()


class CustomAgentExecutor(AgentExecutor):
    final_tool_name: Optional[str] = None
    max_iterations: ClassVar[int] = 2

    def _get_tool_return(
        self, next_step_output: Tuple[AgentAction, str]
    ) -> Optional[AgentFinish]:
        """Check if the tool is a returning tool."""
        agent_action, observation = next_step_output
        name_to_tool_map = {tool.name: tool for tool in self.tools}
        # Invalid tools won't be in the map, so we return False.

        if agent_action.tool in name_to_tool_map:
            if name_to_tool_map[agent_action.tool].return_direct:
                self.final_tool_name = agent_action.tool
                return AgentFinish(
                    {self.agent.return_values[0]: observation},
                    "",
                )

        return None
# Custom MRKLOutputParser to override errors in LLM Output due to knowledge gap


class CustomMRKLOutputParser(MRKLOutputParser):
    # Allows agent to decide if it should pick a particular tool or end the agent chain
    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        includes_answer = "Final Answer:" in text
        regex = (
            r"Action\s*\d*\s*:[\s]*(.*?)[\s]*Action\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)"
        )
        action_match = re.search(regex, text, re.DOTALL)
        print("ACTION MATCH:", action_match)
        if action_match:
            if includes_answer:
                raise OutputParserException(
                    "Parsing LLM output produced both a final answer "
                    f"and a parse-able action: {text}"
                )
            action = action_match.group(1).strip()
            action_input = action_match.group(2)
            tool_input = action_input.strip(" ")

            print("AGENT ACTION:", AgentAction(action, tool_input, text).tool)
            return AgentAction(action, tool_input, text)

        else:
            print("ending chain since vague qn")
            return AgentFinish(
                {"output": text.split("Final Answer:")[-1].strip()}, text
            )

# A variant of ZeroShotAgent to utilize the Custom MRKL parser


class CustomZeroShotAgent(ZeroShotAgent):
    output_parser: AgentOutputParser = CustomMRKLOutputParser()

    @classmethod
    def _get_default_output_parser(cls, **kwargs: Any) -> AgentOutputParser:
        return CustomMRKLOutputParser()


async def initialize_agent_executor(chat_history):
    llm = ALL_MODELS["gpt-4o-mini"]["chat_model"]
    pinecool_tool = await setup_pinecone_tool()
    tools = [pinecool_tool]

    agent_suffix = create_agent_suffix(chat_history)
    prompt = CustomZeroShotAgent.create_prompt(
        tools=tools,
        prefix=agent_prefix,
        suffix=agent_suffix,
        input_variables=["input", "agent_scratchpad",]
    )
    print("PROMPT", prompt)

    llm_chain = LLMChain(
        llm=llm,
        prompt=prompt)
    agent = CustomZeroShotAgent(
        llm_chain=llm_chain,
        tools=tools,
        verbose=True
    )
    agent_executor = CustomAgentExecutor.from_agent_and_tools(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iteration=2
    )
    return agent_executor
