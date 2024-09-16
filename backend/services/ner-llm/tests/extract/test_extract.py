from uuid import uuid4
from fastapi.testclient import TestClient
from tests.extractors.mock_data import add_mock_data
# import pytest

# IMPORTANT: THESE TESTS WILL ONLY WORK IF THE ENV VARIABLES ARE SET
# OPENAI_API_KEY, GROQ_API_KEY


# @pytest.mark.asyncio

# REQUIRES GPT3.5
# def test_extract_with_extractor_success(client, 
#                            set_up_db,
#                            session
# ):
#     # Test successful extraction
    
#     db = set_up_db
#     TestClient = client
    
#     instances, userIds = add_mock_data(session) 
    
    
    
    
    
    

#     request_payload = {
#         "text" : "Regarding the panasonic MH320's axis wheel, what is the tool length compensation feature for machines having multiple rotary axes?",
#         "extractor_id" : userIds[0],
#         "model_name" : "gpt-3.5-turbo"
#     }

#     response = TestClient.post('/extract', json=request_payload)

#     assert response.status_code == 200
#     assert response.json()['message'] == "success"
#     assert 'data' in response.json()

def test_extract_with_extractor_missing_text(client, 
                           set_up_db,
                           session
):
    # Test missing text in the request

    db = set_up_db
    TestClient = client
    instances, userIds = add_mock_data(session) 

    request_payload = {
        "text": None,
        "extractor_id": str(userIds[0]),
        "model_name": "gpt-3.5-turbo"
    }

    response = TestClient.post('/extract', json=request_payload)

    assert response.status_code == 422
    assert "validation error" in response.json()['message'].lower()

def test_extract_with_extractor_not_found(client, 
                           set_up_db,
                           session
):
    # Test extractor not found

    db = set_up_db
    TestClient = client
    uuid = uuid4()  # Use a UUID that does not exist

    request_payload = {
        "text": "Test text",
        "extractor_id": str(uuid),
        "model_name": "gpt-3.5-turbo"
    }

    response = TestClient.post('/extract', json=request_payload)

    assert response.status_code == 404
    assert response.json()['message'] == "Extractor not found"


# NEED GPT3.5
# def test_extract_output_correctness(
#     client, set_up_db, session
# ) : 
#     db = set_up_db
#     TestClient = client
#     instances, userIds = add_mock_data(session)
    
#     requestPayload = {
#         "text" : "What is the maximum speed of the CNC Milling Machine when using the automatic tool changer feature to swap the spindle?",
#         "extractor_id" : userIds[0],
#         "model_name" : "gpt-3.5-turbo"
#     }
    
#     response = TestClient.post('/extract', json=requestPayload)
    
#     print(response.json(), 'response')
    
#     assert response.status_code == 200
#     assert response.json()['message'] == "success"
#     assert response.json()['data'][0]['properties']['feature'] == "automatic tool changer"
#     assert response.json()['data'][0]['properties']['name'] == "CNC Milling Machine"
#     assert response.json()['data'][0]['properties']['part'] == "spindle"
    