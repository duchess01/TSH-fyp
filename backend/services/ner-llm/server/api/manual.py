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
        manual_list = [{"manual_id": manual.uuid, "manual_name": manual.manual_name, "machine_name": manual.machine_name, "keyword_mappings": [{"keyword_id": keyword.uuid, "keyword_namespace": keyword.namespace, "keyword_array": keyword.keywordArray} for keyword in manual.keyword_mappings]} for manual in manuals]

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
        print(f"[DEBUG] Starting manual mapping creation for: {manual_request.manual_name}")
        
        # Check if manual already exists
        existing_manual = session.query(ManualMapping).filter(ManualMapping.manual_name == manual_request.manual_name).first()
        print(f"[DEBUG] Existing manual check result: {existing_manual is not None}")
        
        if existing_manual:
            print(f"[DEBUG] Manual '{manual_request.manual_name}' already exists")
            raise HTTPException(
                status_code=400, detail=f"Manual '{manual_request.manual_name}' already exists"
            )

        # Check if ManualStatus exists and is in the correct state
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_request.manual_name).first()
        print(f"[DEBUG] Manual status found: {manual_status is not None}")
        
        if not manual_status:
            print(f"[DEBUG] ManualStatus not found for '{manual_request.manual_name}'")
            raise HTTPException(
                status_code=404, detail=f"ManualStatus for '{manual_request.manual_name}' not found"
            )
        print(f"[DEBUG] Current manual status: {manual_status.status}")
        
        if manual_status.status != UploadStatus.IN_PROGRESS:
            print(f"[DEBUG] Invalid status: {manual_status.status}")
            raise HTTPException(
                status_code=400, detail=f"Manual '{manual_request.manual_name}' is not in the correct state for mapping"
            )

        # Create new ManualMapping
        new_manual = ManualMapping(manual_name=manual_request.manual_name, machine_name = manual_request.machine_name )
        print(f"[DEBUG] Created new manual mapping object")

        # Associate existing KeywordMappings with the new ManualMapping
        print(f"[DEBUG] Processing {len(manual_request.manual_mappings)} sections")
        for section, data in manual_request.manual_mappings.items():
            print(f"[DEBUG] Processing section: {section}")
            keyword_data = data['data']
            keyword_mapping = KeywordMapping(
                namespace=section,
                keywordArray=keyword_data.keywords,
                keywordEmbeddings=keyword_data.embeddings
            )
            new_manual.keyword_mappings.append(keyword_mapping)
          
        session.add(new_manual)
        print(f"[DEBUG] Added new manual to session")

        # Update ManualStatus
        manual_status.status = UploadStatus.COMPLETED
        manual_status.manual_mapping = new_manual
        print(f"[DEBUG] Updated manual status to COMPLETED")
        
        response = {
            "manual_name": new_manual.manual_name,
            "machine_name": new_manual.machine_name,
            "status": manual_status.status,
            "keyword_mappings": [{"keyword_id": keyword.uuid, "keyword_namespace": keyword.namespace, "keyword_array": keyword.keywordArray} for keyword in new_manual.keyword_mappings]
            
            
        }
        print(f"[DEBUG] Prepared response data")

        session.commit()
        print(f"[DEBUG] Successfully committed changes to database")
        return GenericResponse(message=f"Manual mapping '{manual_request.manual_name}' created successfully", data=response)

    except SQLAlchemyError as e:
        session.rollback()
        print(f"[DEBUG] Database error occurred: {str(e)}")
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
        
        if manual_status:
            print(manual_status.status, "manual_status.status")
        
        # If manual status is FAILED, we should proceed with deletion of whatever resources exist
        if manual_status and manual_status.status == UploadStatus.FAILED:
            # No need to check for existence of all resources
            pass
        # If manual status is COMPLETED, check for consistency
        elif manual_status and manual_status.status == UploadStatus.COMPLETED:
            if manual is None or not file_exists or not pinecone_index_exists:
                raise HTTPException(
                    status_code=404, detail=f"Manual '{manual_name}' not found in database, file system, or Pinecone"
                )
        # If no manual status or it's in any other state, only raise 404 if nothing exists
        elif not manual and not file_exists and not pinecone_index_exists and not manual_status:
            raise HTTPException(
                status_code=404, detail=f"No resources found for manual '{manual_name}'"
            )

        # Proceed with deletion of whatever resources exist
        response_data = {
            "manual_name": manual_name,
            "resources": {
                "database": {"exists": bool(manual), "deleted": False},
                "json_file": {"exists": file_exists, "deleted": False},
                "pinecone": {"exists": pinecone_index_exists, "deleted": False}
            }
        }

        if pinecone_index_exists:
            try:
                pc.delete_index(manual_name)
                response_data["resources"]["pinecone"]["deleted"] = True
            except Exception as e:
                print(f"Error deleting vectors from Pinecone: {str(e)}")

        if manual:
            # Delete associated ManualStatus if it exists
            if manual_status:
                session.delete(manual_status)

            # Delete the ManualMapping (this will also delete associated KeywordMappings due to cascade)
            session.delete(manual)
            session.commit()
            response_data["resources"]["database"]["deleted"] = True

        if file_exists:
            os.remove(json_file_path)
            response_data["resources"]["json_file"]["deleted"] = True

        return GenericResponse(
            message=f"Manual '{manual_name}' deletion process completed",
            data=response_data
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

@router.put("/status", summary="Update or create the status of a manual", description="Update the status of a manual or create a new status if it doesn't exist")
def updateManualStatus(
    manual_status_request: ManualStatusRequest,
    session: Session = Depends(get_session)
) -> GenericResponse:
    try:
        # Check if the manual status exists
        manual_status = session.query(ManualStatus).filter(ManualStatus.manual_name == manual_status_request.manual_name).first()
        
        if not manual_status:
            # Create a new ManualStatus if it doesn't exist
            manual_status = ManualStatus(
                manual_name=manual_status_request.manual_name,
                status=manual_status_request.status
            )
            session.add(manual_status)
            message = f"Manual status for '{manual_status_request.manual_name}' created successfully"
        else:
            # Update the existing status
            manual_status.status = manual_status_request.status
            message = f"Manual status for '{manual_status_request.manual_name}' updated successfully"

        session.commit()

        return GenericResponse(
            message=message,
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

@router.delete("/status/{manual_name}", summary="Delete a manual status", description="Delete the status of a manual")
def deleteManualStatus(
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

        # Delete the manual status
        session.delete(manual_status)
        session.commit()

        return GenericResponse(
            message=f"Manual status for '{manual_name}' deleted successfully",
            data={"manual_name": manual_name}
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )

@router.get("/machine-mappings", summary="Get all manual to machine mappings", description="Get a list of all manual names and their corresponding machine names")
async def getAllManualMachineMappings(session: Session = Depends(get_session)) -> GenericResponse:
    try:
        # Query for all ManualMappings, selecting only manual_name and machine_name
        stmt = select(ManualMapping.manual_name, ManualMapping.machine_name)
        result = session.execute(stmt)
        mappings = result.all()

        # Group manuals by machine name
        machine_mappings = {}
        for mapping in mappings:
            if mapping.machine_name not in machine_mappings:
                machine_mappings[mapping.machine_name] = []
            machine_mappings[mapping.machine_name].append(mapping.manual_name)

        # Convert to list of dictionaries
        mapping_list = [
            {
                "machine_name": machine_name,
                "manual_names": manual_names
            }
            for machine_name, manual_names in machine_mappings.items()
        ]

        return GenericResponse(
            message="Successfully retrieved all manual to machine mappings",
            data=mapping_list
        )

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}"
        )



