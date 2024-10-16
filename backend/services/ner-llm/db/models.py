from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Float, Column, String, DateTime, Text, alias, ARRAY
from sqlalchemy.exc import SQLAlchemyError

import datetime
from uuid import uuid4

from sqlalchemy.dialects.postgresql import JSONB, UUID



class Base(DeclarativeBase):
    pass

class TimestampedModel(Base):
    
    # an abstract base model, cannot be instantiated alone
    
    __abstract__ = True
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment = "Time at which the record was created (UTC)")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, comment = "Time at which the record was updated (UTC)")
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True, 
        # lambda instantiates a new uuid4 object only when a new record is created
        default= lambda: uuid4(),
        comment = "UUID of the record",
    )
    
    
class Extractor(TimestampedModel) :
    __tablename__ = "extractors"
    
    name = Column(String(255), nullable=False, server_default="", comment = "Name of the extractor")
    extractor_id = Column(
        UUID(as_uuid=True),
        nullable = False, 
        comment = "UUID of the extractor",
    )
    schema = Column(
        JSONB,
        nullable=False,
        comment = "JSON schema for the extractor that describes the content extracted from the text or document",
    )
    description = Column(
        String(255), nullable=False, server_default="", comment = "Description of the extractor"
        )
    instruction = Column(
        # text to store large strings, no predefined length
        Text, nullable=False, comment = "Instructions for the extractor, or prompt for the llm"
    )
    
class KeywordMapping(TimestampedModel) :
    __tablename__ = "keyword_mapping"
    keyword_id = Column(UUID(as_uuid=True), primary_key=True, default = lambda: uuid4(), comment = "UUID of the keyword map")
    namespace = Column(String(255), nullable=False, comment = "Namespace of the keyword")
    keywordArray = Column(ARRAY(String(255)), nullable=False, comment = "Array of keywords that belongs to the namespace")
    keywordEmbeddings = Column(ARRAY(Float(precision=16)), nullable=True, comment = "Array of embeddings for the keywords")
    
    
    
class ManualMapping(TimestampedModel) :
    __tablename__ = "manual_mapping"
    manual_id = Column(UUID(as_uuid=True), primary_key=True, default = lambda: uuid4(), comment = "UUID of the manual map")
    manual_name = Column(String(255), nullable=False, comment = "Name of the manual map")
    #array of keywordMapping
    manual_mapping = Column()
    
    