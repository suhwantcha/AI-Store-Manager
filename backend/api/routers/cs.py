"""
CS Router.
Handles chat, AI suggestions, and inquiry management.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import uuid

from backend.agents.orchestrator import AgentOrchestrator
from backend.api.deps import get_ai_orchestrator
from backend.database.legacy import (
    get_inquiries_by_status,
    save_inquiry_log,
    update_inquiry_log_feedback
)


router = APIRouter(prefix="/api/cs", tags=["Customer Support"])


class ChatRequest(BaseModel):
    message: str
    customerId: str = None


class SuggestionRequest(BaseModel):
    question: str


class FeedbackRequest(BaseModel):
    log_id: str
    is_success: bool
    feedback_text: str = ""


@router.post("/chat")
async def chat_with_agent(
    req: ChatRequest,
    orchestrator: AgentOrchestrator = Depends(get_ai_orchestrator)
):
    """
    Main chat endpoint for the CS Agent.
    Routes to LangGraph CSAgentGraph via Orchestrator.
    """
    try:
        result = await orchestrator.invoke(
            session_type="cs",
            query=req.message,
            customer_id=req.customerId
        )
        
        # Log the interaction if it wasn't a cache hit
        log_id = None
        if not result["cached"]:
            log_id = str(uuid.uuid4())
            save_inquiry_log({
                "log_id": log_id,
                "customer_id": req.customerId or "unknown",
                "query": req.message,
                "response": result["text"],
                "tools_used": result["tool_calls"],
                "model": result["model_used"]
            })
            
        return {
            "response": result["text"],
            "log_id": log_id,
            "cached": result["cached"]
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/suggest")
async def get_ai_suggestion(
    req: SuggestionRequest,
    orchestrator: AgentOrchestrator = Depends(get_ai_orchestrator)
):
    """
    Quick RAG-based suggestion (no tools).
    Currently routes through the same CS graph, but we can optimize this later.
    """
    try:
        result = await orchestrator.invoke(
            session_type="cs", 
            query=req.question
        )
        return {"suggestion": result["text"]}
    except Exception as e:
        return {"error": str(e)}


@router.get("/inquiries")
async def get_inquiries():
    """Get unresolved inquiries."""
    data = get_inquiries_by_status("unresolved")
    return data


@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    """Submit success/failure feedback for an AI response."""
    update_inquiry_log_feedback(req.log_id, req.is_success, req.feedback_text)
    return {"status": "success"}
