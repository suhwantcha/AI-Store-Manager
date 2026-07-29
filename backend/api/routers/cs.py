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
    Generate an AI reply draft on-demand using OpenAI API.
    Uses a lightweight model (gpt-4o-mini).
    """
    import os
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    # Fallback if API key is not provided
    if not api_key:
        return {"suggestion": f"고객님, 문의하신 '{req.question[:15]}...' 건에 대해 확인 중입니다. 잠시만 기다려주세요. (OpenAI API 키가 설정되지 않았습니다.)"}
        
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "당신은 쇼핑몰의 전문적인 CS 상담원입니다. 고객의 문의 내용에 대해 문제 해결, 사과, 또는 안내를 친절하게 제공하는 답변 초안을 2~3문장으로 짧게 작성하세요. 불필요한 인사말은 생략하고 바로 본론으로 답변하세요."
                },
                {"role": "user", "content": f"고객 문의: {req.question}"}
            ],
            max_tokens=150
        )
        reply = response.choices[0].message.content.strip()
        return {"suggestion": reply}
    except Exception as e:
        print(f"OpenAI error: {e}")
        return {"suggestion": f"고객님, 문의하신 '{req.question[:15]}...' 건에 대해 신속히 확인하여 안내해 드리겠습니다. (AI 응답 생성 실패)"}


@router.get("/inquiries")
async def get_inquiries():
    """Get unresolved inquiries."""
    data = get_inquiries_by_status(False)
    return data


@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    """Submit success/failure feedback for an AI response."""
    update_inquiry_log_feedback(req.log_id, req.is_success, req.feedback_text)
    return {"status": "success"}
