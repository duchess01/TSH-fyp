# from server.main import app 
from fastapi.testclient import TestClient
import sys


    
def test_get_all_extractor(create_mock_postgres_db, tear_down):

    (client, session) = create_mock_postgres_db()
    # add some test extractors
    instances, userId = add_mock_data(session) 
    














    response = client.get('/extractors')
    
    assert response.status_code == 200
    assert response.json().message == "Extractor created successfully"
    assert type(response.json().data) == list
    assert len(response.json().data) == 2
    assert response.json().data[0].uuid == userId[0]
    assert response.json().data[1].uuid == userId[1]
    
    teardown(session)
    