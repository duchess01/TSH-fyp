
from jsonschema.validators import Draft202012Validator
from jsonschema import ValidationError
from typing import Any, Dict

def validate_json_schema(schema : Dict[str, Any]) -> None:
    
    try:
        Draft202012Validator.check_schema(schema)
        
    except ValidationError as e :
        
    # FastAPI with pydantic model, errors will appear in logs and not in client response
        raise HTTPException(
            status_code = 410, detail = f"Invalid JSON schema : {e.message}"
        )        