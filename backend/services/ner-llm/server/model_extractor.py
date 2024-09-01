from sqlalchemy import Extract
from server.models.extractors_model import ExtractResponse
from langchain_text_splitters import TokenTextSplitter
from db.models import Extractor
from server.models.extractors_model import ExtractResponse, ExtractRequest
from server.llm_models import DEFAULT_MODEL, getChatModel 
from jsonschema import Draft202012Validator,exceptions
from langchain_core.utils.json_schema import dereference_refs
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from typing import Optional, Sequence
from fastapi import HTTPException

@chain
async def extractionRun(req: ExtractRequest):
    
    schema = updateJson(req.json_schema)
    
    model = req.model_name
    
    print(schema)
    
    
    try : 
        Draft202012Validator.check_schema(schema)
    except exceptions.ValidationError as e :
        raise HTTPException(status_code= 422, detail= f"Invalid schema : {e.message}" )
    
    
    # create prompt template from instructions
    
    prompt = makePromptTemplate(req.instructions)
    
    # print("prompt: " + prompt)
    
    # get the model 
    
    model = getChatModel(model)
    # runnable = 
    
    print(prompt.pretty_print(), 'prompt')
    
    structured_llm = prompt | model.with_structured_output(schema)
    
    
    
    
    
    # # chain prompt to model
    # runnable = (prompt | model.with_structured_output(schema = schema).with_config(
    #     {"run_name" : "extraction"}
    # ))
    
    
    
    return await structured_llm.ainvoke({
        "text" : req.text
    })
    
    
    


def makePromptTemplate(instructions: Optional[str]) -> ChatPromptTemplate :
    
    prefix = (
        "You are a top-tier algorithm for extracting information from text. "
        "Only extract information that is relevant to the provided text. "
        "If no information is relevant, use the schema and output "
        "an empty list where appropriate."
        "Please provide the extracted information in the format specified by the schema."
        "DO NOT include any information that is not relevant to the text."
        "DO NOT include any field names (properties) in the output e.g. 'rotary axis part' where 'part' is one of the field names"
        "Please provide the extracted information in the format specified by the schema, without additional field names or irrelevant data. "
    )   
    
    if instructions : 
        system_message = ( "system", f"{prefix}\n\n{instructions}")
        
    else :
        system_message = ( "system", prefix)
        
    
    promptComponents = [system_message]
    
    promptComponents.append(("human", "I need to extract information from the following text: ```\n{text}\n```\n"))
    return ChatPromptTemplate.from_messages(promptComponents)
    
    
    
    
    
    

def updateJson(schema : dict) :
    
    schema_ = {
            "type": "object",
            "properties": {
                "data": {
                    "type": "array",
                    "items": dereference_refs(schema),
                },
            },
            "required": ["data"],
        }
    schema_["title"] = "extractor"
    schema_["description"] = "Extract information matching the given schema."
   
    
    
    
    
    return schema_
    
    
    

async def handleLength(text : str , extractor , model_name : str) :
    json_schema = updateJson(extractor.schema)
    
    
    # TODO: to define chunk_size in another file
    # TODO: workflow for chunking if required
    
    if len(text) > 400 : 
        
        textSplitter = TokenTextSplitter ( chunk_size = 400, chunk_overlap = 0, model_name = DEFAULT_MODEL )
        
        texts = textSplitter.split_text(text)
    
    
        extractionRequest = [
            ExtractRequest (
                text =text,
                schema = json_schema,
                instructions = extractor.instruction,
                model_name = model_name,
            ) 
            for text in texts
        ]
    else :
        
        extractionRequest = [ExtractRequest (
                text =text,
                schema = json_schema,
                instructions = extractor.instruction,
                model_name = model_name,
            )]
    
    
    
    
    return extractionRequest


async def extractUsingExtractor(text : str, extractor : Extractor, model_name : str) -> Sequence[ExtractResponse] :
    
    extractionRequests : Sequence[ExtractRequest] = await handleLength(text, extractor ,  model_name ) 
    
 
    
    
    extractResponse = await extractionRun.abatch(
        extractionRequests, {"max_concurrency" : 1}
    )
    print(extractResponse, 'extractresponse')
    
    extractRes : Sequence[ExtractResponse] = [
        ExtractResponse(
            data = response.data,
            content_too_long = response.content_too_long
        )
        for response in extractResponse
    ]
    
    
    
    
    
    
    return extractRes
    
    
