from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import BudgetItem, Budget
from schemas import BudgetItemCreate, BudgetItemResponse

router = APIRouter()

@router.post("/{budget_id}/items", response_model=BudgetItemResponse)
def add_item_to_budget(budget_id: int, item: BudgetItemCreate, db: Session = Depends(get_db)):
    """Add an item to a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    # Get max order_index
    max_order = db.query(BudgetItem).filter(BudgetItem.budget_db_id == budget_id).count()
    
    db_item = BudgetItem(
        budget_db_id=budget_id,
        description=item.description,
        amount=item.amount,
        order_index=max_order
    )
    
    db.add(db_item)
    
    # Recalculate total if not manual
    if not budget.is_manual_total:
        items = db.query(BudgetItem).filter(BudgetItem.budget_db_id == budget_id).all()
        budget.total = sum(i.amount for i in items) + item.amount
    
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.get("/{budget_id}/items", response_model=List[BudgetItemResponse])
def get_budget_items(budget_id: int, db: Session = Depends(get_db)):
    """Get all items for a budget"""
    items = db.query(BudgetItem).filter(
        BudgetItem.budget_db_id == budget_id
    ).order_by(BudgetItem.order_index).all()
    
    return items

@router.delete("/items/{item_id}")
def delete_budget_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a budget item"""
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    budget = db.query(Budget).filter(Budget.id == item.budget_db_id).first()
    
    db.delete(item)
    
    # Recalculate total if not manual
    if budget and not budget.is_manual_total:
        remaining_items = db.query(BudgetItem).filter(
            BudgetItem.budget_db_id == budget.id
        ).all()
        budget.total = sum(i.amount for i in remaining_items)
    
    db.commit()
    
    return {"message": "Item eliminado exitosamente"}

