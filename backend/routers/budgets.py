from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Budget, BudgetItem, BudgetStatus
from schemas import BudgetCreate, BudgetResponse, BudgetUpdate, BudgetListResponse
from datetime import datetime
from services.pdf_generator import create_budget_pdf

router = APIRouter()

def generate_budget_id(db: Session) -> str:
    """Generate next budget ID (PR-001, PR-002, etc.)"""
    last_budget = db.query(Budget).order_by(Budget.id.desc()).first()
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
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Create a new budget with items"""
    
    # Generate budget ID
    budget_id = generate_budget_id(db)
    
    # Calculate total if not manual
    calculated_total = sum(item.amount for item in budget.items)
    final_total = budget.total if budget.is_manual_total else calculated_total
    
    # Create budget
    db_budget = Budget(
        budget_id=budget_id,
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
    db: Session = Depends(get_db)
):
    """List all budgets with optional filtering"""
    query = db.query(Budget)
    
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
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    """Get a specific budget by ID"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_update: BudgetUpdate, db: Session = Depends(get_db)):
    """Update a budget"""
    db_budget = db.query(Budget).filter(Budget.id == budget_id).first()
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
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """Delete a budget"""
    db_budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    db.delete(db_budget)
    db.commit()
    
    return {"message": "Presupuesto eliminado exitosamente"}

@router.get("/{budget_id}/pdf")
def generate_budget_pdf(budget_id: int, db: Session = Depends(get_db)):
    """Generate and download PDF for a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    pdf_buffer = create_budget_pdf(budget)
    
    filename = f"Presupuesto_{budget.budget_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
