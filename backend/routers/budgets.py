from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Budget, BudgetItem, BudgetStatus, Client, User
from schemas import BudgetCreate, BudgetResponse, BudgetUpdate, BudgetListResponse
from datetime import datetime
from services.pdf_generator import create_budget_pdf
from auth import get_current_user

router = APIRouter()

def generate_budget_id(db: Session, user_id: int) -> str:
    """Generate next budget ID (PR-001, PR-002, etc.) for a specific user"""
    last_budget = db.query(Budget).filter(Budget.user_id == user_id).order_by(Budget.id.desc()).first()
    if last_budget and last_budget.budget_id:
        try:
            last_number = int(last_budget.budget_id.split('-')[1])
            new_number = last_number + 1
        except:
            new_number = 1
    else:
        new_number = 1
    return f"PR-{new_number:03d}"

@router.post("/", response_model=BudgetResponse)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new budget with items"""
    
    # Generate budget ID unique for this user
    budget_id = generate_budget_id(db, current_user.id)
    
    # Calculate total if not manual
    calculated_total = sum(item.amount for item in budget.items)
    final_total = budget.total if budget.is_manual_total else calculated_total
    
    # Create budget
    db_budget = Budget(
        budget_id=budget_id,
        user_id=current_user.id, # Assign to current user
        client=budget.client,
        date=budget.date or datetime.utcnow(),
        validity=budget.validity,
        status=BudgetStatus.PENDIENTE,
        total=final_total,
        is_manual_total=budget.is_manual_total
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    # Create items
    for index, item in enumerate(budget.items):
        db_item = BudgetItem(
            budget_db_id=db_budget.id,
            description=item.description,
            amount=item.amount,
            order_index=index
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_budget)
    
    return db_budget

@router.get("/", response_model=List[BudgetListResponse])
def list_budgets(
    skip: int = 0, 
    limit: int = 100, 
    search: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all budgets for current user"""
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    
    # Filter by search term
    if search:
        query = query.filter(
            (Budget.client.ilike(f"%{search}%")) | 
            (Budget.budget_id.ilike(f"%{search}%"))
        )
    
    # Filter by status
    if status:
        try:
            status_enum = BudgetStatus[status.upper()]
            query = query.filter(Budget.status == status_enum)
        except KeyError:
            pass
    
    # Order by date descending
    budgets = query.order_by(Budget.date.desc()).offset(skip).limit(limit).all()
    
    return budgets

@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific budget by ID"""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_update: BudgetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a budget"""
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    # Update fields
    update_data = budget_update.dict(exclude_unset=True)
    
    # Handle status conversion
    if 'status' in update_data:
        try:
            update_data['status'] = BudgetStatus[update_data['status'].upper()]
        except KeyError:
            pass
    
    for field, value in update_data.items():
        setattr(db_budget, field, value)
    
    db_budget.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_budget)
    
    return db_budget

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a budget"""
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    db.delete(db_budget)
    db.commit()
    
    return {"message": "Presupuesto eliminado exitosamente"}

@router.get("/{budget_id}/pdf")
def generate_budget_pdf_endpoint(budget_id: int, download: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate PDF for a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    # Fetch client details belonging to this user or generic match
    client_data = db.query(Client).filter(Client.name == budget.client, Client.user_id == current_user.id).first()
    
    pdf_buffer = create_budget_pdf(budget, client_data)
    
    filename = f"Presupuesto_{budget.budget_id}.pdf"
    disposition = "attachment" if download else "inline"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"{disposition}; filename={filename}"}
    )
