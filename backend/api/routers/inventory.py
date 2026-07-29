"""
Inventory Router.
Handles inventory tracking, warehouse logistics, and AI demand forecasting.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from backend.database.legacy import get_products_from_db

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


class ForecastAiRequest(BaseModel):
    product_id: str


@router.get("/")
async def get_inventory():
    """
    Get inventory status for all products.
    """
    products = get_products_from_db()
    # Mock warehouse data for UI demonstration
    for p in products:
        p["warehouses"] = {
            "본사 창고": p["stock_quantity"],
            "외부 물류센터": 0
        }
    return products


@router.post("/ai-forecast")
async def forecast_demand(req: ForecastAiRequest):
    """
    AI Mockup: Demand forecasting to recommend safety stock and reorder quantity.
    """
    return {
        "status": "success", 
        "forecast": {
            "recommended_reorder_qty": 50,
            "predicted_demand_next_30_days": 45,
            "reason": "최근 2주간 일평균 판매량이 20% 증가하는 추세입니다."
        }
    }
