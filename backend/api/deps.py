"""
FastAPI Dependencies.
"""
from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends

from backend.database.session import SessionLocal
from backend.models.orm import StoreSettings
from backend.agents.orchestrator import AgentOrchestrator


def get_db() -> Generator[Session, None, None]:
    """Yields a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_store_context(db: Session = Depends(get_db)) -> str:
    """Retrieves the store profile from the database to inject into AI prompts."""
    settings = db.query(StoreSettings).first()
    if not settings:
        return "스토어 정보가 설정되지 않았습니다."
    
    # Format settings into a readable string
    return (
        f"스토어 이름: {settings.store_name}\n"
        f"대표: {settings.ceo_name}\n"
        f"기본 배송비: {settings.delivery_base_fee}원 "
        f"(무료배송 기준: {settings.free_shipping_threshold}원)\n"
        f"당일 발송 마감 시간: {settings.same_day_cutoff}\n"
        f"반품 배송지: {settings.return_address}\n"
        f"반품 배송비: {settings.return_fee}원 / 교환 배송비: {settings.exchange_fee}원\n"
        f"CS 전화번호: {settings.cs_phone}\n"
        f"CS 운영시간: {settings.cs_hours}\n"
        f"이용 택배사: {settings.logistics_company}"
    )


def get_ai_orchestrator(store_context: str = Depends(get_store_context)) -> AgentOrchestrator:
    """Returns an instance of the AgentOrchestrator injected with store context."""
    return AgentOrchestrator(store_context=store_context)
