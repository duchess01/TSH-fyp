from sqlalchemy.engine import URL
import os
from sqlalchemy import (
    create_engine, 

)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError


# create connection URL for postgresql
def get_postgres_url() -> URL:
    # TODO : define for other OS
    
    
    # this is for windows
    url = URL.create(
        drivername="postgresql+psycopg2",
        username=os.environ.get("PG_USER", "langchain"),
        password=os.environ.get("PG_PASSWORD", "langchain"),
        
        # if docker-compose is used, then the host is the name of the service, else localhost
        host=os.environ.get("PG_HOST", "localhost"),
        database=os.environ.get("PG_DATABASE", "langchain"),
        port=5432,
    )
    return url 



ENGINE = create_engine(get_postgres_url())

SessionClass = sessionmaker(bind=ENGINE)



def get_session():
    """Create a new session."""
        # request continues and uses the db , it'll only close the session when the request is done or an exception is raised
    session = SessionClass()

    try:
        yield session
    except SQLAlchemyError as e:
        # handles SQLAlchemy errors
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Postgresql error : {str(e)}")
    
    finally:
        session.close()