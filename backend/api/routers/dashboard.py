"""
Dashboard Router.
Provides KPI metrics, alerts, and morning briefings.
"""
import os
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
    sorted_data = sorted(data, key=lambda x: x.get("settle_date", ""))
    
    # Format for chart (match the analytics API style)
    formatted = []
    for s in sorted_data:
        formatted.append({
            "date": s["settle_date"].strftime("%m/%d"),
            "total_settlement_amount": s["total_settlement_amount"]
        })
    return formatted

@router.get("/insights")
async def get_insights():
    """Generate operational insights using OpenAI based on current store data."""
    # Gather mock stats to feed the AI
    qna = get_unanswered_qnas_count()
    claims = get_pending_claims_count()
    stock = get_low_stock_products_count()
    low_stock_items = get_low_stock_products()
    stock_names = ", ".join([p.get("product_name", "") for p in low_stock_items[:2]])
    
    system_prompt = f"""당신은 쇼핑몰 운영 데이터를 분석하여 간결하고 명확한 운영 인사이트를 제공하는 비서입니다.
현재 쇼핑몰 데이터:
- 미답변 QnA: {qna}건
- 미처리 클레임(취소/환불): {claims}건
- 품절 임박 상품 수: {stock}건
- 대표 품절 임박 상품: {stock_names}
- 지난주 대비 이번 주 매출 추이: 8% 증가 (예상치)
- 최근 부정 리뷰 증가율: 12% 증가 (예상치)
- 미출고 주문: 8건 (예상치)

위 데이터를 바탕으로 쇼핑몰 사장님을 위한 핵심 운영 인사이트 4가지를 불릿 포인트(•) 형태로 작성하세요.
절대 'AI가 분석한 내용입니다' 같은 불필요한 말은 붙이지 마세요. 사실만 명확하게 나열하세요.
각 문장은 '~건 있습니다.', '~예정입니다.', '~증가했습니다.'와 같이 '~다/요' 체로 간결하게 끝내세요.
"""
    
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return {
            "insights": [
                f"미출고 주문이 8건 있습니다.",
                f"{stock_names} 재고가 3일 내 품절될 예정입니다.",
                f"부정 리뷰가 어제보다 12% 증가했습니다.",
                f"이번 주 매출은 지난주보다 8% 증가했습니다."
            ]
        }
        
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt}
            ],
            max_tokens=200
        )
        content = response.choices[0].message.content.strip()
        # Parse bullet points
        lines = [line.strip() for line in content.split("\n") if line.strip().startswith("•") or line.strip().startswith("-")]
        if not lines:
            lines = [line.strip() for line in content.split("\n") if line.strip()]
            
        # Clean bullet characters
        lines = [line.lstrip("•- \t") for line in lines[:4]]
        return {"insights": lines}
    except Exception as e:
        print(f"OpenAI error: {e}")
        return {
            "insights": [
                "미출고 주문이 8건 있습니다.",
                "재고가 부족한 상품이 있습니다.",
                "부정 리뷰가 어제보다 12% 증가했습니다.",
                "이번 주 매출은 지난주보다 8% 증가했습니다."
            ]
        }
