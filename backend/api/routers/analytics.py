from fastapi import APIRouter
from backend.database.legacy import get_orders_from_db, calculate_product_margins

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary():
    """
    Get mock data for the Analytics dashboard.
    """
    orders = get_orders_from_db()
    
    # Get settlement data for charts
    from backend.database.legacy import get_settlement_data_from_db
    settlement_data = get_settlement_data_from_db()
    
    # Format for chart (Map settle_date to day/date format and total_settlement_amount to sales)
    weekly_sales = []
    for s in settlement_data:
        weekly_sales.append({
            "day": s["settle_date"].strftime("%m/%d"), # e.g. 11/10
            "sales": s["total_settlement_amount"],
            "date": s["settle_date"].strftime("%Y-%m-%d")
        })
    
    # Get margins
    margins = calculate_product_margins(30)
    # Sort by total_margin descending to get top products
    top_products = sorted(margins, key=lambda x: x.get("total_margin", 0), reverse=True)[:5]
    
    # Format for frontend
    top_selling = []
    for p in top_products:
        top_selling.append({
            "name": p.get("product_name"),
            "revenue": p.get("total_sales_amount", 0),
            "margin": p.get("total_margin", 0),
            "marginRate": round(p.get("margin_percentage", 0), 1)
        })
        
    # Generate Natural AI Briefing
    import os
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    top_item = top_selling[0]["name"] if top_selling else "인기 상품"
    top_margin = top_selling[0]["marginRate"] if top_selling else 0
    fallback_briefing = f"이번 주말 매출이 주중 대비 상승했습니다. 특히 '{top_item}'의 판매가 전체 마진의 큰 부분을 차지하고 있습니다. 마진율이 {top_margin}%로 우수하므로 해당 상품의 마케팅을 강화하는 것을 추천합니다."
    
    briefing = fallback_briefing
    if api_key and top_selling:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=api_key)
            
            prompt = f"쇼핑몰 사장님을 위한 3문장 이내의 짧은 매출 분석 브리핑을 작성해주세요.\n최고 마진 상품: {top_item} (마진율 {top_margin}%)\n이 데이터를 바탕으로 칭찬과 함께 가벼운 마케팅 액션을 제안해주세요."
            
            # Since get_analytics_summary is async, we can await
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            briefing = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI error in analytics: {e}")

    return {
        "weekly_sales": weekly_sales,
        "top_products": top_selling,
        "briefing": briefing,
        "metrics": {
            "total_revenue": sum([s["sales"] for s in weekly_sales]),
            "avg_margin_rate": 32.5,
            "refund_rate": 2.1
        }
    }
