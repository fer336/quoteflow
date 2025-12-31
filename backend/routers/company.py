from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import shutil
import os

router = APIRouter()

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
LOGO_PATH = os.path.join(STATIC_DIR, "logo.png")

@router.post("/logo")
async def upload_logo(file: UploadFile = File(...)):
    """Upload company logo"""
    try:
        os.makedirs(STATIC_DIR, exist_ok=True)
        with open(LOGO_PATH, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"message": "Logo actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logo")
async def get_logo():
    """Get current logo"""
    if os.path.exists(LOGO_PATH):
        return FileResponse(LOGO_PATH)
    else:
        raise HTTPException(status_code=404, detail="No logo found")

