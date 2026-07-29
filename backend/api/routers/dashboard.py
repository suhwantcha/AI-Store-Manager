"""
Dashboard Router.
Provides KPI metrics, alerts, and morning briefings.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from backend.database.legacy import (
    get_unanswered_qnas_count,
    get_pending_claims_count,
    get_low_stock_products_count,
    get_low_stock_products,
    get_settlement_data_from_db
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

class KPISummaryResponse(BaseModel):
    unansweredQnAs: int
    pendingClaims: int
    lowStockItems: int

@router.get("/kpis", response_model=KPISummaryResponse)
async def get_kpi_summary():
    """Get the high-level KPI counts for the dashboard header."""
    qna = get_unanswered_qnas_count()
    claims = get_pending_claims_count()
    stock = get_low_stock_products_count()
    
    return KPISummaryResponse(
        unansweredQnAs=qna,
        pendingClaims=claims,
        lowStockItems=stock
    )

@router.get("/warnings")
async def get_warnings():
    """Get actionable warnings (e.g., low stock products)."""
    # Currently just returns low stock products, but can be expanded
    low_stock = get_low_stock_products()
    return low_stock

@router.get("/sales-trend")
async def get_sales_trend():
    """Get recent settlement/sales data for charting."""
    data = get_settlement_data_from_db()
    # Ensure it's sorted by date for charts
    sorted_data = sorted(data, key=lambda x: x.get("date", ""))
    return sorted_data
