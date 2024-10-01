from fastapi import APIRouter,UploadFile, File
from server.models.extractors_model import GenericResponse
from PyPDF2 import PdfReader




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
        reader = PdfReader(file.file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
            print("TEXT EXTRACTED: ", text)
        return GenericResponse(message = "File uploaded successfully", data = text)
            
    except Exception as e:
        return GenericResponse(status_code = 500, message = "Internal server error", data = str(e))
    
    
   
    
    
    
    

        
        
    