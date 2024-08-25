# from server.main import app 
from fastapi.testclient import TestClient
import sys
from fastapi import Depends
from db.dbconfig import get_session
from sqlalchemy.orm import Session
from tests.extractors.mock_data import add_mock_data


    
def test_get_all_extractor(client, 
                           set_up_db,
                           session
                           ):
    
    db = set_up_db

    TestClient = client
    # add some test extractors
    instances, userId = add_mock_data(session) 
    
    
    














    response = TestClient.get('/extractors')
    
    assert response.status_code == 200
    # assert response.json().message == "Extractor created successfully"
    # assert type(response.json().data) == list
    # assert len(response.json().data) == 2
    # assert response.json().data[0].uuid == userId[0]
    # assert response.json().data[1].uuid == userId[1]
    
    