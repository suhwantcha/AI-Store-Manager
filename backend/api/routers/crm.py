"""
CRM Router.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from backend.database.legacy import (
    get_customers_by_segment,
    get_orders_from_db,
    get_claims_by_customer,
    get_reviews_by_customer
)

router = APIRouter(prefix="/api/crm", tags=["CRM"])

class CouponRequest(BaseModel):
    customerId: str
    couponType: str

@router.get("/segments/{segment}")
async def get_customers(segment: str):
    """Get customers by segment (e.g., 'VIP', 'at-risk')."""
    if segment.lower() == "all":
        from backend.database.legacy import get_customers_from_db
        return get_customers_from_db()

    mapping = {
        "vip": "VIP",
        "at-risk": "CHURN_RISK"
    }
    db_segment = mapping.get(segment.lower())
    if not db_segment:
        return {"error": "Invalid segment"}
        
    return get_customers_by_segment(db_segment)

@router.post("/coupons/send")
async def send_coupon(req: CouponRequest):
    """Simulate sending a coupon."""
    print(f"[COUPON SENT] To: {req.customerId}, Type: {req.couponType}")
    return {"status": "success", "message": f"{req.couponType} 쿠폰이 발송되었습니다."}

@router.get("/customers/{customer_id}/orders")
async def get_customer_orders(customer_id: str):
    orders = get_orders_from_db()
    return [o for o in orders if o.get("customerId") == customer_id]

@router.get("/customers/{customer_id}/claims")
async def get_customer_claims(customer_id: str):
    return get_claims_by_customer(customer_id)

@router.get("/customers/{customer_id}/reviews")
async def get_customer_reviews(customer_id: str):
    return get_reviews_by_customer(customer_id)
