from langchain_core.prompts import PromptTemplate
x = 5
RAG_PROMPT_TEMPLATE = """
Given the CONTEXT provided, your task is to answer the QUESTION as accurately as possible ONLY with information from CONTEXT. If the question does not relate to context at all, request for a clarification with these words vertabim: `Could you please elaborate on your question?`

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
