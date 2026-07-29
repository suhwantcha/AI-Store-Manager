"""
Products Router.
Handles product management, editing, and AI product descriptions.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.database.legacy import get_products_from_db

router = APIRouter(prefix="/api/products", tags=["Products"])


class DescriptionAiRequest(BaseModel):
    product_name: str
    key_features: str


class SyncRequest(BaseModel):
    channel: str


@router.get("/")
async def get_all_products():
    """
    Get all products.
    """
    products = get_products_from_db()
    return products


@router.post("/ai-description")
async def generate_ai_description(req: DescriptionAiRequest):
    """
    AI Mockup: Generate product description based on name and key features.
    """
    draft = f"🌟 [AI 자동 생성] 새롭게 선보이는 '{req.product_name}'!\n\n주요 특징: {req.key_features}\n\n지금 바로 만나보세요!"
    return {"status": "success", "draft_description": draft}


@router.post("/sync")
async def sync_channels(req: SyncRequest):
    """
    Mockup: Sync products with external sales channels (e.g., SmartStore, Coupang).
    """
    return {"status": "success", "message": f"{req.channel} 채널과 상품 정보 동기화가 완료되었습니다."}
