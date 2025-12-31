from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Client
from schemas import ClientCreate, ClientResponse, ClientUpdate

router = APIRouter()

@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    db_client = Client(
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        tax_id=client.tax_id
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/", response_model=List[ClientResponse])
def list_clients(skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)):
    """List all clients"""
    query = db.query(Client)
    
    if search:
        query = query.filter(Client.name.ilike(f"%{search}%"))
    
    return query.order_by(Client.name).offset(skip).limit(limit).all()

@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    db.delete(client)
    db.commit()
    return {"message": "Cliente eliminado exitosamente"}

