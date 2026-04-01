import os
import unittest
from pathlib import Path


TEST_DB_PATH = Path(__file__).resolve().parent / "test_budget_items_security.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH}")
os.environ.setdefault("SECRET_KEY", "test-secret-key-with-32-characters!!")

from fastapi.testclient import TestClient

from auth import create_access_token
from database import Base, SessionLocal, engine
from main import app
from models import Budget, BudgetItem, BudgetStatus, User


class BudgetItemsSecurityTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.db = SessionLocal()
        self.owner = User(email="owner@example.com", is_active=True, name="Owner")
        self.other_user = User(
            email="other@example.com", is_active=True, name="Other User"
        )
        self.db.add_all([self.owner, self.other_user])
        self.db.commit()
        self.db.refresh(self.owner)
        self.db.refresh(self.other_user)

        self.owner_budget = Budget(
            user_id=self.owner.id,
            budget_id="PR-001",
            client="Cliente owner",
            status=BudgetStatus.PENDIENTE,
            total=120.0,
            is_manual_total=0,
        )
        self.other_budget = Budget(
            user_id=self.other_user.id,
            budget_id="PR-001",
            client="Cliente other",
            status=BudgetStatus.PENDIENTE,
            total=200.0,
            is_manual_total=0,
        )
        self.db.add_all([self.owner_budget, self.other_budget])
        self.db.commit()
        self.db.refresh(self.owner_budget)
        self.db.refresh(self.other_budget)

        self.owner_item = BudgetItem(
            budget_db_id=self.owner_budget.id,
            description="Item owner",
            amount=120.0,
            order_index=0,
        )
        self.other_item = BudgetItem(
            budget_db_id=self.other_budget.id,
            description="Item other",
            amount=200.0,
            order_index=0,
        )
        self.db.add_all([self.owner_item, self.other_item])
        self.db.commit()
        self.db.refresh(self.owner_item)
        self.db.refresh(self.other_item)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()

    def _auth_headers(self, email: str):
        token = create_access_token({"sub": email})
        return {"Authorization": f"Bearer {token}"}

    def test_budget_items_endpoints_require_authentication(self):
        list_response = self.client.get(
            f"/api/budget-items/{self.owner_budget.id}/items"
        )
        add_response = self.client.post(
            f"/api/budget-items/{self.owner_budget.id}/items",
            json={"description": "Nuevo item", "amount": 10, "order_index": 0},
        )
        delete_response = self.client.delete(
            f"/api/budget-items/items/{self.owner_item.id}"
        )

        self.assertEqual(list_response.status_code, 401)
        self.assertEqual(add_response.status_code, 401)
        self.assertEqual(delete_response.status_code, 401)

    def test_cannot_access_or_mutate_other_user_budget_items(self):
        headers = self._auth_headers(self.owner.email)

        list_response = self.client.get(
            f"/api/budget-items/{self.other_budget.id}/items", headers=headers
        )
        add_response = self.client.post(
            f"/api/budget-items/{self.other_budget.id}/items",
            headers=headers,
            json={"description": "Intruso", "amount": 55, "order_index": 0},
        )
        delete_response = self.client.delete(
            f"/api/budget-items/items/{self.other_item.id}", headers=headers
        )

        self.assertEqual(list_response.status_code, 404)
        self.assertEqual(add_response.status_code, 404)
        self.assertEqual(delete_response.status_code, 404)

    def test_owner_can_manage_own_budget_items(self):
        headers = self._auth_headers(self.owner.email)

        add_response = self.client.post(
            f"/api/budget-items/{self.owner_budget.id}/items",
            headers=headers,
            json={"description": "Nuevo item", "amount": 30, "order_index": 0},
        )
        self.assertEqual(add_response.status_code, 200)
        created_item = add_response.json()
        self.assertEqual(created_item["description"], "Nuevo item")

        list_response = self.client.get(
            f"/api/budget-items/{self.owner_budget.id}/items", headers=headers
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 2)

        delete_response = self.client.delete(
            f"/api/budget-items/items/{self.owner_item.id}", headers=headers
        )
        self.assertEqual(delete_response.status_code, 200)

        self.db.expire_all()
        updated_budget = (
            self.db.query(Budget).filter(Budget.id == self.owner_budget.id).first()
        )
        self.assertEqual(updated_budget.total, 30.0)


if __name__ == "__main__":
    unittest.main()
