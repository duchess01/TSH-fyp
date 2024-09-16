from tests.extractors.example_extractor_models import test_extractor_models_1, test_extractor_models_2


def test_create_extractor(client, 
                           set_up_db,
                           session) :
    
    db = set_up_db

    TestClient = client
    # add some test extractors
    reqBody = {
        "name": "test_extractor_models_3",
        "schema": test_extractor_models_1.schema(),
        "description": "test description",
        "instruction": "test instruction"
    }
    

    response = TestClient.post('/extractors', json=reqBody)
    
    print(response.json())
    
    # Assert statements to validate the response
    response = response.json()
    
    assert response['status_code'] == 200
    assert response['message'] == 'Extractor created successfully'

    assert 'data' in response
    assert isinstance(response['data'], dict)

    assert 'uuid' in response['data']

    assert 'extractor_data' in response['data']
    assert isinstance(response['data']['extractor_data'], dict)

    extractor_data = response['data']['extractor_data']
    assert extractor_data['name'] == 'test_extractor_models_3'
    assert extractor_data['description'] == 'test description'
    assert extractor_data['instruction'] == 'test instruction'

    assert 'schema' in extractor_data
    assert isinstance(extractor_data['schema'], dict)

    schema = extractor_data['schema']
    assert schema['title'] == 'test_extractor_models_1'
    assert schema['type'] == 'object'

    assert 'properties' in schema
    assert isinstance(schema['properties'], dict)

    properties = schema['properties']
    assert 'name' in properties
 


    
def test_create_extractor_invalid_schema(client, 
                           set_up_db,
                           session) :
    
    db = set_up_db

    TestClient = client
    # add some test extractors
    
    
    # due to storing in JSONB in postgres, the schema will be converted to a string
    invalidSchema = {3: "John Doe","age": 30.5}
    
    reqBody = {
        "name": "test_extractor_models_3",
        "schema": invalidSchema,
        "description": "test description",
        "instruction": "test instruction"
    }
    

    response = TestClient.post('/extractors', json=reqBody)
    
    print(response.json())
    
    # Assert statements to validate the response
    assert response.json()['status_code'] == 200
    assert response.json()['data']['extractor_data']['schema'] != invalidSchema