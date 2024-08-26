from server.main import app 
from fastapi.testclient import TestClient
from tests.extractors.test_extractor_models import test_extractor_models_1, test_extractor_models_2
import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from db.models import Base
from sqlalchemy.engine import URL
import os
from sqlalchemy.orm import sessionmaker, Session
from db.dbconfig import get_session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, Depends
from uuid import uuid4

from db.models import Extractor






    

@pytest.fixture(scope="module")
def engine():
    url = URL.create(
    drivername = "postgresql+psycopg2",
    username = os.environ.get("PG_USER", "langchain"),
    password = os.environ.get("PG_PASSWORD", "langchain"),
    host = os.environ.get("PG_HOST", "localhost"),
    database = os.environ.get("PG_DATABASE", "langchain_test"),
    port = 5432)
    
    return create_engine(url)
    
@pytest.fixture(scope="module")
def session(engine):
    TestingSessionLocal = sessionmaker(bind=engine)
    
    session = TestingSessionLocal()
    
    try :
        yield session
        
    finally : 
        session.close()
    
@pytest.fixture(scope="module")
def client(session) : 
    def override_get_db():
        try : 
            yield session
        finally : 
            session.close()
            
    app.dependency_overrides[get_session] = override_get_db
    
    try :
        yield TestClient(app)
    except SQLAlchemyError as e:
        session.close()
        raise HTTPException(status_code=500, detail=f"error setting up test client: {str(e)} ")
        
    


@pytest.fixture(scope="module")  
def set_up_db(engine, session) :
    Base.metadata.create_all(bind=engine)
    
    try :
        yield session
        
    finally : 
        Base.metadata.drop_all(bind=engine)
        session.close()
    
    

