"""
SQLAlchemy ORM models for new tables.
Existing tables (customers, products, orders, etc.) remain managed by legacy code.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

from backend.database.session import Base


class StoreSettings(Base):
    """Store profile and policy configuration. Replaces seller_info.json."""
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_name = Column(String(255), nullable=False)
    ceo_name = Column(String(100))
    delivery_base_fee = Column(Integer)
    free_shipping_threshold = Column(Integer)
    same_day_cutoff = Column(String(10))  # "14:00"
    return_address = Column(Text)
    return_fee = Column(Integer)
    exchange_fee = Column(Integer)
    cs_phone = Column(String(20))
    cs_hours = Column(String(100))
    logistics_company = Column(String(100))
    outbound_location = Column(String(255))
    settings_json = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AICache(Base):
    """
    Persistent storage for expensive, pre-generated AI artifacts.
    Tier 2 cache — survives restarts, stores Morning Briefings, analytics digests, etc.

    NOT for ephemeral query caching (use diskcache for that).
    """
    __tablename__ = "ai_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artifact_type = Column(String(50), nullable=False, index=True)
    # Artifact types: "morning_briefing", "analytics_digest", "review_summary"
    entity_id = Column(String(100), index=True)
    # Optional: links artifact to a specific entity (e.g., product_id for a review summary)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)
    # NULL = never expires; set a datetime to auto-invalidate
