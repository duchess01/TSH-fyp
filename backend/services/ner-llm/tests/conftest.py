from server.main import app 
from fastapi.testclient import TestClient
from tests.extractors.test_extractor_models import test_extractor_models_1, test_extractor_models_2
import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from db.models import Base
from sqlalchemy.engine import URL
import os
from sqlalchemy.orm import sessionmaker
from db.dbconfig import get_session


@pytest.fixture(scope = "module") 
def add_mock_data(db) :
    print(sys.path, 'syspath')
    schema_1 = test_extractor_models_1.schema()
    schema_2 = test_extractor_models_2.schema()
    
    user_id_1 = str(uuid4())
    user_id_2 = str(uuid4())
    
    instances = [
        {
            "user_id" : user_id_1,
            "description" : "questions about a specific machine",
            "schema" : schema_1,
            "instruction" : 
                "extract the name, part and feature of the machine from the given text"
        },
        {
            "user_id" : user_id_2, 
            "description" : "questions about the specificiations of the machine",
            "schema" : schema_2,
            "instruction" : 
                "extract details about the machine, manufacturer, installation date, etc. "
                
        }
    ]
    
    return instances, (user_id_1, user_id_2)
    


@pytest.fixture(scope='module')
def set_up_db(create_mock_postgres_db):
    # sets up db and adds some test data
    
    ENGINE = create_mock_postgres_db
    
    
    # create mock data 
    
    
    
    
    
    session = SessionClass()
  
    
    
    
    
    
    
    client = TestClient(session)
    
    try:
        yield client, session
    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"test client setup error : {str(e)}")
    finally:
        session.rollback()
        session.close()
        
        
@pytest.fixture(scope='module')
def roll_back(db):
    db.rollback()
    
    
@pytest.fixture(scope='module')
def tear_down(session):
    session.remove()
    session.drop_all()
    
    
@pytest.fixture(scope='module')
def create_mock_postgres_db() :

    url = URL.create(
        drivername = "postgresql+psycopg2",
        username = os.environ.get("PG_USER", "langchain"),
        password = os.environ.get("PG_PASSWORD", "langchain"),
        host = os.environ.get("PG_HOST", "localhost"),
        database = os.environ.get("PG_DATABASE", "langchain_test"),
        port = 5432, 
    )
    
    ENGINE = create_engine(url)
    
    TestingSessionLocal = sessionmaker(bind=ENGINE)
    
    
    Base.metadata.create_all(bind=ENGINE)
    
    
    def override_get_db():
        try : 
            db = TestingSessionLocal()
            yield db
        finally : 
            db.close()
            
    app.dependency_overrides[get_session] = override_get_db
    
    client = TestClient(app)
    
    
    
    

    
    try :
        yield client, db
        
        
    except SQLALchemyError as e :
        raise HTTPException(status_code=500, detail=f"error setting up test Postgresql db : {str(e)}")
        
    

    
