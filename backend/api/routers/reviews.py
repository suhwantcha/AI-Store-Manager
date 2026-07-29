"""
Reviews Router.
"""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.database.legacy import get_recent_negative_reviews, get_reviews_from_db

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

class GenerateReplyRequest(BaseModel):
    review_text: str

@router.get("/")
async def get_all_reviews(rating: Optional[int] = None):
    """
    Get all reviews, optionally filtered by rating.
    Returns keywords summary (mock NLP) as well.
    """
    reviews = get_reviews_from_db()
    
    if rating:
        reviews = [r for r in reviews if r.get("rating") == rating]
        
    # Mock NLP Keyword summary
    summary_keywords = [
        {"word": "맛있어요", "count": 142, "sentiment": "positive"},
        {"word": "배송빠름", "count": 98, "sentiment": "positive"},
        {"word": "가성비", "count": 75, "sentiment": "positive"},
        {"word": "포장불량", "count": 12, "sentiment": "negative"},
        {"word": "유통기한", "count": 5, "sentiment": "negative"}
    ]
            
    return {
        "summary": summary_keywords,
        "reviews": reviews
    }

@router.get("/negative")
async def get_negative_reviews():
    return get_recent_negative_reviews()

@router.post("/{review_id}/generate-reply")
async def generate_reply(review_id: str, req: GenerateReplyRequest):
    """
    Generate an AI reply draft on-demand using OpenAI API.
    Uses a lightweight model (gpt-4o-mini).
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    # Fallback if API key is not provided
    if not api_key:
        fallback_msg = f"소중한 리뷰 감사합니다. 남겨주신 '{req.review_text[:15]}...' 내용 확인했습니다. (OpenAI API 키가 설정되지 않은 임시 응답입니다.)"
        return {"reply": fallback_msg}
        
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "당신은 쇼핑몰의 친절하고 센스있는 CS 담당자입니다. 긍정적인 리뷰에는 감사를 표하고 재방문을 유도하며, 부정적인 리뷰에는 정중히 사과하고 문제 해결 의지를 보여주세요. 따뜻하고 자연스러운 톤으로 2~3문장 이내의 짧은 답변을 작성하세요. 불필요한 인사말(안녕하세요 등)은 생략하고 바로 본론으로 답변을 작성하세요."
                },
                {"role": "user", "content": f"고객 리뷰: {req.review_text}"}
            ],
            max_tokens=150
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        print(f"OpenAI error: {e}")
        return {"reply": f"소중한 리뷰 감사합니다. 남겨주신 '{req.review_text[:15]}...' 내용 확인했습니다. (AI 응답 생성 실패)"}
