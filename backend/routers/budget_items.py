from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, cast
from database import get_db
from auth import get_current_user
from models import Budget, BudgetItem, User
from schemas import BudgetItemCreate, BudgetItemResponse

router = APIRouter()


def _get_owned_budget_or_404(db: Session, budget_id: int, user_id: int) -> Budget:
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == user_id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return budget


def _get_owned_item_or_404(db: Session, item_id: int, user_id: int) -> BudgetItem:
    item = (
        db.query(BudgetItem)
        .join(Budget, BudgetItem.budget_db_id == Budget.id)
        .filter(BudgetItem.id == item_id, Budget.user_id == user_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item


@router.post("/{budget_id}/items", response_model=BudgetItemResponse)
def add_item_to_budget(
    budget_id: int,
    item: BudgetItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add an item to a budget"""
    current_user_id = cast(int, current_user.id)
    budget = _get_owned_budget_or_404(db, budget_id, current_user_id)

    # Get max order_index
    max_order = (
        db.query(BudgetItem).filter(BudgetItem.budget_db_id == budget_id).count()
    )

    db_item = BudgetItem(
        budget_db_id=budget_id,
        description=item.description,
        amount=item.amount,
        order_index=max_order,
        quantity=getattr(item, "quantity", None),
        unit_price=getattr(item, "unit_price", None),
        is_excluded=getattr(item, "is_excluded", False),
    )

    db.add(db_item)

    # Recalculate total if not manual (exclude excluded items)
    is_manual_total = cast(int, budget.is_manual_total)
    if is_manual_total == 0:
        existing_items = (
            db.query(BudgetItem)
            .filter(
                BudgetItem.budget_db_id == budget_id,
                BudgetItem.is_excluded == False,
            )
            .all()
        )
        existing_total = sum(i.amount for i in existing_items)
        new_amount = item.amount if not item.is_excluded else 0
        setattr(budget, "total", float(existing_total + new_amount))

    db.commit()
    db.refresh(db_item)

    return db_item


@router.get("/{budget_id}/items", response_model=List[BudgetItemResponse])
def get_budget_items(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all items for a budget"""
    _get_owned_budget_or_404(db, budget_id, cast(int, current_user.id))

    items = (
        db.query(BudgetItem)
        .filter(BudgetItem.budget_db_id == budget_id)
        .order_by(BudgetItem.order_index)
        .all()
    )

    return items


@router.delete("/items/{item_id}")
def delete_budget_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a budget item"""
    current_user_id = cast(int, current_user.id)
    item = _get_owned_item_or_404(db, item_id, current_user_id)
    budget = _get_owned_budget_or_404(db, item.budget_db_id, current_user_id)

    remaining_items = []
    is_manual_total = cast(int, budget.is_manual_total)
    if is_manual_total == 0:
        remaining_items = (
            db.query(BudgetItem)
            .filter(
                BudgetItem.budget_db_id == budget.id,
                BudgetItem.id != item.id,
                BudgetItem.is_excluded == False,
            )
            .all()
        )

    db.delete(item)

    # Recalculate total if not manual (only non-excluded items)
    if is_manual_total == 0:
        setattr(budget, "total", float(sum(i.amount for i in remaining_items)))

    db.commit()

    return {"message": "Item eliminado exitosamente"}
