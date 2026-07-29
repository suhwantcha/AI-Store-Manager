"""
Main FastAPI Application Entrypoint.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.session import engine
from backend.models.orm import Base
# Import all routers
from backend.api.routers import dashboard, cs, reviews, crm, orders, products, inventory, analytics, manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan handler replacing deprecated @app.on_event("startup").
    """
    print("AI Store Manager Backend starting...")
    # Ensure all tables are created (useful during initial dev before Alembic is fully set up)
    Base.metadata.create_all(bind=engine)
    
    yield
    
    print("AI Store Manager Backend shutting down...")
    engine.dispose()


app = FastAPI(
    title="AI Store Manager OS",
    description="Backend API for AI Store Manager",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(cs.router)
app.include_router(reviews.router)
app.include_router(crm.router)
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(analytics.router)
app.include_router(manager.router)


@app.get("/")
async def root():
    return {"message": "AI Store Manager API (Phase 4)"}
