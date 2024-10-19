from fastapi import APIRouter, Depends, HTTPException
from server.models.extractors_model import GenericResponse
from server.models.keywords import KeywordMappingRequest
from db.dbconfig import get_session
from db.models import KeywordMapping, ManualMapping
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError


router = APIRouter(
    prefix = "/uploadProgress",
    tags = ["CRUD for upload progress"],
)

