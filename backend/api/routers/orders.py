"""
Orders Router.
Handles order management and AI batch recommendations.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from backend.database.legacy import get_orders_from_db

router = APIRouter(prefix="/api/orders", tags=["Orders"])


class OrderAiRequest(BaseModel):
    order_ids: List[str]


@router.get("/")
async def get_all_orders(status: Optional[str] = None):
    """
    Get all orders, optionally filtered by status.
    """
    orders = get_orders_from_db()
    if status:
        orders = [o for o in orders if o.get("order_status") == status]
    return orders


@router.post("/ai-batch")
async def analyze_delayed_orders(req: OrderAiRequest):
    """
    AI Mockup: Analyze delayed orders and recommend actions (apology message, refund, etc.).
    Returns recommendations. The user must manually approve them.
    """
    recommendations = []
    for order_id in req.order_ids:
        # Mock logic
        recommendations.append({
            "order_id": order_id,
            "recommended_action": "send_apology_message",
            "draft_message": f"[AI 초안] 고객님, {order_id} 주문의 배송이 지연되어 죄송합니다. 내일 출발 예정입니다.",
            "reason": "물류 지연"
        })
    return {"status": "success", "recommendations": recommendations}
