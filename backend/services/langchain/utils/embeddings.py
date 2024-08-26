from langchain_core.language_models.chat_models import BaseChatModel 
from typing import List


def getEmbeddings(embeddingModel: BaseChatModel , text_array : List[str]) -> List[float] : 
    
    res = [] 
    for text in text_array : 
        # TODO: handle shape
        res.append(embeddingModel.encode(text))
    
    print(res)
        
        
        
    
    return res
    
    
    