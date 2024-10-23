from fastapi import APIRouter, Depends, HTTPException
from server.models.extractors_model import GenericResponse
from db.dbconfig import get_session
from db.models import ManualMapping
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
import json 
from server.models.keywords import ManualMappingRequest, ManualStatusRequest
from db.models import ManualStatus, KeywordMapping, UploadStatus
from typing import List
import os
# pinecone
from pinecone import Pinecone, PineconeException


pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))



router = APIRouter(
    prefix = "/manual",
    tags = ["Manual operations [CRUD] to postgresDB"],
)

@router.get("/get/{manual_name}", summary="Get keyword mappings for a specific manual", description="Get all keyword mappings associated with a specific manual")
async def getManualKeywordMappings(manual_name: str, session: Session = Depends(get_session)) -> GenericResponse:
    try:
        # Query for the ManualMapping with the given name, including its related KeywordMappings
        stmt = select(ManualMapping).options(joinedload(ManualMapping.keyword_mappings)).where(ManualMapping.manual_name == manual_name)
        result = session.execute(stmt)
        manual = result.scalars().first()

        if manual is None:
            raise HTTPException(
                status_code=404, detail=f"Manual '{manual_name}' not found"
            )

        # Extract the keyword mappings from the manual
        keyword_mappings = manual.keyword_mappings

        return GenericResponse(message=f"GET keyword mappings for manual '{manual_name}' success", data=keyword_mappings)

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )


@router.get("/", summary="Get all manuals", description="Get a list of all available manuals")
async def getAllManuals(session: Session = Depends(get_session)) -> GenericResponse:
    try:
        stmt = select(ManualMapping)
        result = session.execute(stmt)
        manuals = result.scalars().all()

        # Convert manuals to a list of dictionaries for easier serialization
        manual_list = [{"manual_id": manual.uuid, "manual_name": manual.manual_name, "keyword_mappings": [{"keyword_id": keyword.uuid, "keyword_namespace": keyword.namespace, "keyword_array": keyword.keywordArray} for keyword in manual.keyword_mappings]} for manual in manuals]

        return GenericResponse(message="GET all manuals success", data=manual_list)

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )

@router.post("/create", summary="Create a manual mapping", description="Create a manual mapping and associate it with existing keyword mappings")
def createManualMapping(
    manual_request: ManualMappingRequest,
    session: Session = Depends(get_session)
) -> GenericResponse:
    try:
        # Check if manual already exists
        existing_manual = session.query(ManualMapping).filter(ManualMapping.manual_name == manual_request.manual_name).first()
        if existing_manual:
            raise HTTPException(
                status_code=400, detail=f"Manual '{manual_request.manual_name}' already exists"
            )

        # Check if ManualStatus exists and is in the correct state
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_request.manual_name).first()
        if not manual_status:
            raise HTTPException(
                status_code=404, detail=f"ManualStatus for '{manual_request.manual_name}' not found"
            )
        if manual_status.status != UploadStatus.IN_PROGRESS:
            raise HTTPException(
                status_code=400, detail=f"Manual '{manual_request.manual_name}' is not in the correct state for mapping"
            )

        # Create new ManualMapping
        new_manual = ManualMapping(manual_name=manual_request.manual_name)

        # Associate existing KeywordMappings with the new ManualMapping
        for section, data in manual_request.manual_mappings.items():
            keyword_data = data['data']
            keyword_mapping = KeywordMapping(
                namespace=section,
                keywordArray=keyword_data.keywords,
                keywordEmbeddings=keyword_data.embeddings
            )
            new_manual.keyword_mappings.append(keyword_mapping)
          
        session.add(new_manual)

        # Update ManualStatus
        manual_status.status = UploadStatus.COMPLETED
        manual_status.manual_mapping = new_manual
        
        response = {
            "manual_name": new_manual.manual_name,
            "status": manual_status.status,
            "keyword_mappings": [{"keyword_id": keyword.uuid, "keyword_namespace": keyword.namespace, "keyword_array": keyword.keywordArray} for keyword in new_manual.keyword_mappings]
            
            
        }

        session.commit()
        return GenericResponse(message=f"Manual mapping '{manual_request.manual_name}' created successfully", data=response)

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )
        
@router.delete("/delete/{manual_name}", summary="Delete a manual", description="Delete a manual, its associated JSON file, and Pinecone vectors")
async def deleteManual(manual_name: str, session: Session = Depends(get_session)) -> GenericResponse:
    try:
        # Check database entries
        manual = session.query(ManualMapping).filter(ManualMapping.manual_name == manual_name).first()
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_name).first()

        # Check JSON file
        json_file_path = os.path.join('db', 'keywords', f"{manual_name}.json")
        file_exists = os.path.exists(json_file_path)

        # Check if Pinecone index exists
        
        print(pc.list_indexes().names(), "pc.list_indexes().names()")
        pinecone_index_exists = manual_name in pc.list_indexes().names()
        
        print(pinecone_index_exists, "pinecone_index_exists")
        
        print(manual, "manual")
        
        print(file_exists, "file_exists")
        
        

        if manual is None or not file_exists or not pinecone_index_exists:
            print(manual, file_exists, pinecone_index_exists )
            raise HTTPException(
                status_code=404, detail=f"Manual '{manual_name}' not found in database, file system, or Pinecone"
            )

        # Proceed with deletion if any of the entries exist
        db_deleted = False
        file_deleted = False
        pinecone_deleted = False
        
        if pinecone_index_exists:
            try:
                pc.delete_index(manual_name)
                pinecone_deleted = True
            except Exception as e:
                print(f"Error deleting vectors from Pinecone: {str(e)}")
                raise HTTPException(
                    status_code=500, detail=f"Error deleting vectors from Pinecone: {str(e)}"
                )
        if manual:
            # Delete associated ManualStatus if it exists
            if manual_status:
                session.delete(manual_status)
            
            # Delete the ManualMapping (this will also delete associated KeywordMappings due to cascade)
            session.delete(manual)
            session.commit()
            db_deleted = True

        if file_exists:
            os.remove(json_file_path)
            file_deleted = True





        if not all([db_deleted, file_deleted, pinecone_deleted]):
            raise HTTPException(
                status_code=500, detail=f"Failed to delete all resources for manual '{manual_name}'"
            )

        return GenericResponse(
            message=f"Manual '{manual_name}' deletion process completed",
            data={
                "manual_name": manual_name,
                "database_entries_deleted": db_deleted,
                "json_file_deleted": file_deleted,
                "pinecone_vectors_deleted": pinecone_deleted
            }
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )
    except OSError as e:
        # If database deletion was successful but file deletion failed
        raise HTTPException(
            status_code=500, detail=f"Error during file system operation: {str(e)}"
        )
        
    except PineconeException as pe:
        # This will catch any Pinecone errors that weren't caught in the inner try-except block
        raise HTTPException(
            status_code=500, detail=f"Pinecone error: {str(pe)}"
        )
################################# STASTUS #############################################################################################
@router.post("/status", summary="Create a manual status", description="Create a manual status to track the progress of the manual upload")
def createManualStatus(
    manual_status_request: ManualStatusRequest,
    session: Session = Depends(get_session)
) -> GenericResponse:
    
    
    
    try:
        # Check if a status for this manual already exists
        existing_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_status_request.manual_name).first()
        if existing_status:
            print("Status for manual already exists")
            raise HTTPException(
                status_code=400, detail=f"Status for manual '{manual_status_request.manual_name}' already exists"
            )

        # Create new ManualStatus
        new_status = ManualStatus(
            manual_name=manual_status_request.manual_name,
            status=manual_status_request.status
        )
        status_data = {
            "manual_name": new_status.manual_name,
            "status": new_status.status
        }
        session.add(new_status)
        session.commit()

        return GenericResponse(message=f"Manual status for '{manual_status_request.manual_name}' created successfully", data=status_data)

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )

@router.put("/status", summary="Update the status of a manual", description="Update the status of a manual")
def updateManualStatus(
    manual_status_request: ManualStatusRequest,
    session: Session = Depends(get_session)
) -> GenericResponse:
    try:
        # Check if the manual status exists
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_status_request.manual_name).first()
        if not manual_status:
            raise HTTPException(
                status_code=404, detail=f"Manual status for '{manual_status_request.manual_name}' not found"
            )

        # Update the status
        manual_status.status = manual_status_request.status
        session.commit()

        return GenericResponse(
            message=f"Manual status for '{manual_status_request.manual_name}' updated successfully",
            data={"manual_name": manual_status.manual_name, "status": manual_status.status}
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )
        
@router.get("/allstatus", summary="Get all manual statuses", description="Get all manual statuses")
def getAllManualStatuses(session: Session = Depends(get_session)) -> GenericResponse:
    try:
        # Query all manual statuses
        manual_statuses = session.query(ManualStatus).all()
        
        # Convert the results to a list of dictionaries
        status_list = [
            {
                "manual_name": status.manual_name,
                "status": status.status,
                "created_at": status.created_at,
                "updated_at": status.updated_at
            }
            for status in manual_statuses
        ]

        return GenericResponse(
            message="All manual statuses retrieved successfully",
            data=status_list
        )

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )

@router.get("/status/{manual_name}", summary="Get the status of a manual", description="Get the status of a manual")
def getManualStatus(
    manual_name: str,
    session: Session = Depends(get_session)
) -> GenericResponse:
    try:
        # Query for the manual status
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_name).first()
        
        if not manual_status:
            raise HTTPException(
                status_code=404, detail=f"Manual status for '{manual_name}' not found"
            )

        return GenericResponse(
            message=f"Manual status for '{manual_name}' retrieved successfully",
            data={"manual_name": manual_status.manual_name, "status": manual_status.status}
        )

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )



