from fastapi import APIRouter,UploadFile, File
from fastapi.responses import JSONResponse
from server.models.responses import GenericResponse
from PyPDF2 import PdfReader
from utils.process_pdf import run_process
import tempfile
import os
import shutil
import traceback



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
   
    text = ""
    
    try : 
        # reader = PdfReader()
        # for page in reader.pages:
        #     text += page.extract_text() + "\n"
        #     print("TEXT EXTRACTED: ", text)
        
        
        # PROCESS UPLOADED FILE AS A TMP FILE
        tmp_dir = tempfile.mkdtemp()
        tmp_file_path = os.path.join(tmp_dir, file.filename)
        
        with open(tmp_file_path, 'wb') as f :
            shutil.copyfileobj(file.file, f)
            
        relative_url = os.path.relpath(tmp_file_path)
        
        # process text
        extracted_content, store_dictionary = run_process(relative_url)
        
        
        # run NER to extract pages 
            
            
            # convert 
        return GenericResponse(message = "File uploaded successfully", data = {
            'extracted_content' : extracted_content, 
            
            'store_dictionary' : store_dictionary
        })
            
    except Exception as e:
        
        
        stack_trace = traceback.format_exc()
        return JSONResponse(
            status_code = 500, 
            content = {
                "status_code" :500,
                "message" : "Internal Server Error",
                "error": {
                "type": type(e).__name__,
                "message": str(e),
                "stack_trace": stack_trace
            }
                
            }
        )
    
    
   
    
    
    
    

        
        
    