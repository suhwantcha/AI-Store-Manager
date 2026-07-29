"""
Reviews Router.
"""
from fastapi import APIRouter

from backend.database.legacy import get_recent_negative_reviews

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("/negative")
async def get_negative_reviews():
    """
    Get recent negative reviews.
    Currently, we just return the data without on-demand AI generation.
    AI reply generation should be moved to a BackgroundTask in a later phase.
    """
    reviews = get_recent_negative_reviews()
    # Provide a placeholder draft reply if none exists (Phase 3 will add DB columns)
    for r in reviews:
        if "ai_draft_reply" not in r:
            r["ai_draft_reply"] = "AI 답변 초안 생성은 Phase 3에 구현될 예정입니다."
            
    return reviews
