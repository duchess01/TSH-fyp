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
    instances, userIds = add_mock_data(session) 

    response = TestClient.get('/extractors')
    
    print(response.json())
    
    assert response.status_code == 200
    assert response.json()['message'] == "GET Extractor success"
    assert type(response.json()['data']) == list
    assert len(response.json()['data']) == 2
    assert response.json()['data'][0]['extractor_id'] in userIds
    assert response.json()['data'][1]['extractor_id'] in userIds
    assert response.json()['data'][0]['description'] == "questions about a specific machine"
    assert response.json()['data'][1]['description'] == "questions about the specificiations of the machine"
    assert response.json()['data'][0]['instruction'] == "extract the name, part and feature of the machine from the given text"
    assert response.json()['data'][1]['instruction'] == "extract details about the machine, manufacturer, installation date, etc."
    
    data = response.json()['data']
    
    # Assertions for the first data dictionary
    assert data[0]['name'] == '', "Name should be an empty string"
    assert data[0]['schema']['type'] == 'object', "Schema type should be 'object'"
    assert data[0]['schema']['title'] == 'test_extractor_models_1', "Schema title mismatch"
    assert data[0]['schema']['properties']['name']['type'] == 'string', "Property 'name' should be of type 'string'"
    assert data[0]['schema']['properties']['name']['title'] == 'Name', "Property 'name' title mismatch"
    assert data[0]['instruction'] == 'extract the name, part and feature of the machine from the given text', "Instruction mismatch"
    
    # Assertions for the second data dictionary
    # Assertions for the second dictionary
    assert data[1]['name'] == '', "Name should be an empty string"
    assert data[1]['schema']['type'] == 'object', "Schema type should be 'object'"
    assert data[1]['schema']['title'] == 'test_extractor_models_2', "Schema title mismatch"
    assert data[1]['schema']['required'] == [
        'model_id', 'manufacturer', 'installation_date',
        'operational_status', 'serial_number', 'location'
    ], "Required fields mismatch in schema"
    assert data[1]['schema']['properties']['model_id']['type'] == 'integer', "Property 'model_id' should be of type 'integer'"
    assert data[1]['schema']['properties']['manufacturer']['type'] == 'string', "Property 'manufacturer' should be of type 'string'"
    assert data[1]['schema']['properties']['installation_date']['type'] == 'string', "Property 'installation_date' should be of type 'string'"
    assert data[1]['instruction'] == 'extract details about the machine, manufacturer, installation date, etc.', "Instruction mismatch"
    assert data[1]['description'] == 'questions about the specificiations of the machine', "Description mismatch"
    
    
def test_get_all_extractor_empty(
    client,
    set_up_db,
    session
):
    
    # empty should still return 200 status code
    
    db = set_up_db

    TestClient = client
    
    response = TestClient.get('/extractors')
    
    print(response.json())
    assert response.status_code == 200
    assert response.json()['message'] == "GET Extractor success"
    assert response.json()['data'] == []
    
