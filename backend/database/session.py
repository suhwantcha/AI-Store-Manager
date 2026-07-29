"""
SQLAlchemy engine, session factory, and connection pool.
Also provides a pooled connection for legacy psycopg2 code.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config.settings import settings


# SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections are alive before using them
    echo=False,
)

# Session factory for new SQLAlchemy-based code
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for ORM models
Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a SQLAlchemy session, auto-closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_legacy_connection():
    """
    Provides a raw DBAPI connection from the pool for legacy psycopg2 code.
    Use this as a drop-in replacement for the old get_db_connection().
    The connection is from the same pool, so we get connection reuse.

    Usage:
        conn = get_legacy_connection()
        try:
            # ... use conn with psycopg2 cursor ...
        finally:
            conn.close()  # returns to pool, doesn't actually close
    """
    return engine.raw_connection()
