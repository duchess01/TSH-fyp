
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import Extractor
from db.dbconfig import get_session
from tests.extractors.example_extractor_models import test_extractor_models_1, test_extractor_models_2
from sqlalchemy.exc import SQLAlchemyError


def add_mock_data(session) :
    schema_1 = test_extractor_models_1.schema()
    schema_2 = test_extractor_models_2.schema()
    
    user_id_1 = uuid4()
    user_id_2 = uuid4()
    
    

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
        session.add_all(instances)
        session.commit()
        return instances, [str(user_id_1), str(user_id_2)]
    
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"error adding mock data: {str(e)}")
        
