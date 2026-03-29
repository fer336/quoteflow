from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Client, User
from schemas import ClientCreate, ClientResponse, ClientUpdate
from auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new client for current user"""
    db_client = Client(
        user_id=current_user.id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        tipo_inmueble=client.tipo_inmueble,
        address=client.address,
        tax_id=client.tax_id,
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all clients for current user"""
    query = db.query(Client).filter(Client.user_id == current_user.id)

    if search:
        query = query.filter(Client.name.ilike(f"%{search}%"))

    return query.order_by(Client.name).offset(skip).limit(limit).all()


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a client"""
    db_client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.user_id == current_user.id)
        .first()
    )
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    for key, value in client_update.dict(exclude_unset=True).items():
        setattr(db_client, key, value)

    db.commit()
    db.refresh(db_client)
    return db_client


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a client"""
    client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.user_id == current_user.id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(client)
    db.commit()
    return {"message": "Cliente eliminado exitosamente"}
