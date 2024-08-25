
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import Extractor
from db.dbconfig import get_session
from tests.extractors.test_extractor_models import test_extractor_models_1, test_extractor_models_2


def add_mock_data(session) :
    schema_1 = test_extractor_models_1.schema()
    schema_2 = test_extractor_models_2.schema()
    
    user_id_1 = str(uuid4())
    user_id_2 = str(uuid4())
    
    

    instances = [
        Extractor(
            description = "questions about a specific machine",
            extractor_id = user_id_1,
            schema = schema_1,
            instruction = "extract the name, part and feature of the machine from the given text" 
        ), 
        Extractor(
            description = "questions about the specificiations of the machine",
            extractor_id = user_id_2,
            schema = schema_2,
            instruction = "extract details about the machine, manufacturer, installation date, etc."
        )
    ]
    
   
    
    try :
        session.add(instances[0])
        session.commit()
        return instances, (user_id_1, user_id_2)
    
    except :
        raise HTTPException(status_code=500, detail="error adding mock data")
        
