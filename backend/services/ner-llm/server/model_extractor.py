from server.models.extractors_model import ExtractResponse
from langchain.text_splitter import TokenTextSplitter
from db.models import Extractor
from server.models.extractors_model import ExtractResponse, ExtractRequest
from server.llm_models import DEFAULT_MODEL 


async def extractUsingExtractor(text : str, extractor : Extractor, model_name : str)  :
    
    
    
    
    json_schema = extractor.schema
    
    textSplitter = TokenTextSplitter ( chunk_size = 10, chunk_overlap = 0, model_name = DEFAULT_MODEL )
    
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
    
    print(texts)
    return
    
    
