from langchain_core.prompts import PromptTemplate

RAG_PROMPT_TEMPLATE = """
Given the CONTEXT provided, your task is to answer the QUESTION as accurately as possible using information from the CONTEXT. The user's QUESTION may contain imperfect English and cryptic engineering terms, so you must interpret the question carefully. CONTEXT may include technical data or error codes presented in table formats, which may be broken down into text. You MUST attempt to match any terms, codes, or references from the QUESTION to relevant information in the CONTEXT, even if the format is altered. If only partial matches are found, provide the best possible answer based on the available information in the CONTEXT, focusing on the key technical details.DO NOT mention of CONTEXT in your answer.

CONTEXT: {context}

QUESTION: {question}
"""

RAG_PROMPT = PromptTemplate(
    input_variables=[
        "context",
        "question"
    ],
    template=RAG_PROMPT_TEMPLATE
)
