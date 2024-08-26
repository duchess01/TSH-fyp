from uuid import uuid4
from fastapi.testclient import TestClient
from tests.extractors.mock_data import add_mock_data
# import pytest

# IMPORTANT: THESE TESTS WILL ONLY WORK IF THE ENV VARIABLES ARE SET
# OPENAI_API_KEY, GROQ_API_KEY


# @pytest.mark.asyncio
def test_extract_with_extractor_success(client, 
                           set_up_db,
                           session
):
    # Test successful extraction
    
    db = set_up_db
    TestClient = client
    
    instances, userIds = add_mock_data(session) 
    
    print(userIds, 'userIds')
    
    response = TestClient.get('/extractors')
    
    print(response.json(), 'response')
    
    
    

    request_payload = {
        "text" : "Regarding the panasonic MH320's axis wheel, what is the tool length compensation feature for machines having multiple rotary axes?",
        "extractor_id" : userIds[0],
        "model_name" : "groq-llama3-8b-8192"
    }

    response = TestClient.post('/extract', json=request_payload)

    print(response.json())
    assert response.status_code == 200
    assert response.json()['message'] == "success"
    assert 'data' in response.json()

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
        "model_name": "groq-llama3-8b-8192"
    }

    response = TestClient.post('/extract', json=request_payload)

    print(response.json())
    assert response.status_code == 423
    assert response.json()['detail'] == "No text provided"

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
        "model_name": "groq-llama3-8b-8192"
    }

    response = TestClient.post('/extract', json=request_payload)

    print(response.json())
    assert response.status_code == 404
    assert response.json()['detail'] == "Extractor not found"

def test_extract_with_extractor_internal_server_error(client, 
                           set_up_db,
                           session
):
    # Test handling of internal server error

    async def mock_extract_using_extractor(text, extractor, model_name):
        raise Exception("Unexpected error")

    app.dependency_overrides[extractUsingExtractor] = mock_extract_using_extractor
    
    db = set_up_db
    TestClient = client

    request_payload = {
        "text": "Test text",
        "extractor_id": str(uuid),
        "model_name": "groq-llama3-8b-8192"
    }

    response = TestClient.post('/extract', json=request_payload)

    print(response.json())
    assert response.status_code == 500
    assert response.json()['detail'] == "Internal server error : Unexpected error"
    
