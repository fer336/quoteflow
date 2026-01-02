from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import User
from services import storage
import uuid

router = APIRouter()

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload company logo to MinIO"""
    try:
        ext = file.filename.split('.')[-1]
        filename = f"logo_{current_user.id}.{ext}" # Overwrite user's logo file
        
        file_data = await file.read()
        
        # Upload to MinIO
        # We store just the filename relative to bucket basically, or full URL
        # For simplicity, let's store the filename in DB or just reconstruct it if predictable.
        # But storing full URL or filename is safer.
        
        # Let's store just the filename in DB to easily fetch it back from MinIO
        
        storage.upload_file(file_data, filename, file.content_type)
        
        current_user.logo_url = filename # Storing filename instead of full URL
        db.commit()
        
        return {"message": "Logo actualizado exitosamente"}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logo")
async def get_logo(current_user: User = Depends(get_current_user)):
    """Get current logo content"""
    if current_user.logo_url:
        content = storage.get_file_content(current_user.logo_url)
        if content:
            return Response(content, media_type="image/png") # Adjust type if possible or generic
    
    raise HTTPException(status_code=404, detail="No logo found")
