from fastapi import APIRouter, Depends, HTTPException
from server.models.extractors_model import GenericResponse
from server.models.keywords import KeywordMappingRequest
from db.dbconfig import get_session
from db.models import KeywordMapping
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError


router = APIRouter(
    prefix = "/keywords",
    tags = ["Keyword Mapping Objects [CRUD] to postgres DB"],
)







@router.get("/{namespace}", summary = "get a keyword mapping by namespace", description="get a keyword mapping by namespace")
async def getMappingByNamespace(namespace, session : Session = Depends(get_session)) -> GenericResponse: 
    
    try  :
        stmt = select(KeywordMapping).where(KeywordMapping.namespace == namespace.lower())
        
        result = session.execute(stmt)
        
        res = result.scalars().first()
        
        if res is None :
            raise HTTPException(
                status_code = 404, detail = f"Namespace {namespace} not found"
            )
        
        
        return GenericResponse(message = "GET mapping by namespace success", data = res)
    
    except SQLAlchemyError as e :
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )




# an array of keyword mappings
# e.g. [ { <nameAsNamespace> : [ array of keywords ] } ]

# check if nameAsNamespace exist in the db, if not create it, else throw an error 
@router.post("", summary = "save a keyword mapping into postgres", description="save a keyword mapping to ensure that the model can recognize the keywords as a namespace")
def createNamespaceKeywordMapping(
    keyword_request : KeywordMappingRequest,
    
    # depends allows to use the same session in the same request
    session : Session = Depends(get_session), 
) -> GenericResponse:
    
    # iterate through the array, check if the namespace exist in the db, if not create it, else throw an error
    try:
    
        for namespaceIndex in range(len(keyword_request.keywordArray)) : 
            # check if k exist
            
            itemObject = keyword_request.keywordArray[namespaceIndex]
            
            namespace = ""
            
            for k in itemObject:
                namespace = k 
            
            keywordArray = itemObject[namespace]
            
            stmt = select(KeywordMapping).where(KeywordMapping.namespace == namespace)
            
            result = session.execute(stmt)
            
            res = result.scalars().first()
            
            
            if res is not None :
                raise HTTPException(
                    status_code = 401, detail = f"Namespace record, {namespace} already exist, try PUT instead of POST"
                )
                
            
            print("namespace", namespace)
            print("keywordArray", keywordArray)
            
                
            instance = KeywordMapping (
                namespace = namespace,
                keywordArray = keywordArray
            )
            
            session.add(instance)
            
        session.commit()
        
    

    
   
        return GenericResponse(message= "POST keyword mapping success, saved into db", data = keyword_request.keywordArray)
        
    except SQLAlchemyError as e:
        # handle other exceptions
        raise HTTPException(
            status_code = 500, detail = f"Internal server error : {str(e)}"
        )
        
    