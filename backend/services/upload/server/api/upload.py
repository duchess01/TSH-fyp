from fastapi import APIRouter,UploadFile, File
from fastapi.responses import JSONResponse
from server.models.responses import GenericResponse
from PyPDF2 import PdfReader
from utils.process_pdf import run_process
import tempfile
import os
import shutil
import traceback
import requests
from fastapi import HTTPException

from utils.rollback import rollback_all

from utils.process_manuals import process_headings, save_output_to_file

router = APIRouter(
    prefix = "/upload",
    tags = ["Upload PDF for processing"],
)

@router.post("", summary = "upload a pdf file", description="endpoint to upload a pdf file, file will be processed.")
async def uploadPdf(
    file : UploadFile = File(...),

):
    if not file.filename.endswith(".pdf"):
       return GenericResponse(status_code = 400, message = "Bad Request", data = "File must be a pdf file")
   
    tmp_dir = None
    try:
        # PROCESS UPLOADED FILE AS A TMP FILE
        tmp_dir = tempfile.mkdtemp()
        tmp_file_path = os.path.join(tmp_dir, file.filename)
        
        with open(tmp_file_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
            
        relative_url = os.path.relpath(tmp_file_path)
        
        # create a manual record in the database
        pdf_file = relative_url.split("\\")[-1].split(".")[0].lower().replace("_", "-")
        print("pdf_file:", pdf_file, "create a manual")
        url = "http://localhost:8000/manual/status" 
        data = {
            "manual_name": pdf_file,
            "status": "in_progress"
        }
        response = requests.put(url, json=data)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, 
                detail=f"Failed to update status in the database. Status Code: {response.status_code}, Response: {response.json()}")
        
        
        
        # process text
        extracted_content = await run_process(relative_url)

        print(extracted_content, "extracted_content")
        
        # run NER to extract keywords + embed keywords
        processed_output = process_headings(extracted_content)
        
        file_name = file.filename.split("\\")[-1].split(".")[0].lower().replace("_", "-")
        
        file_name = f"{file_name}.json"
        # Upsert to file 
        save_output_to_file(processed_output, file_name)

        # update database to status = success
        print("pdf_file:", pdf_file, "create manual in db")
        url = "http://localhost:8000/manual/create" 
        data = {
            "manual_name": pdf_file,
            "manual_mappings": processed_output
        }
        
        headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            # roll back db
            rollback_all(pdf_file)
            raise HTTPException(status_code=response.status_code, 
                detail=f"Failed to update status in the database. Status Code: {response.status_code}")
        
        return GenericResponse(message="File uploaded successfully", data={
            'extracted_content': extracted_content, 
            'processed_output': processed_output
        })
            
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        stack_trace = traceback.format_exc()
        return JSONResponse(
            status_code=500, 
            content={
                "status_code": 500,
                "message": "Internal Server Error",
                "error": {
                    "type": type(e).__name__,
                    "message": str(e),
                    "stack_trace": stack_trace
                }
            }
        )
    finally:
        # Clean up temporary directory
        if tmp_dir and os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)