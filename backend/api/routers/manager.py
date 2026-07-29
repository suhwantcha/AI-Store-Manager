from fastapi import APIRouter, Depends
from pydantic import BaseModel
import uuid

from backend.agents.orchestrator import AgentOrchestrator
from backend.api.deps import get_ai_orchestrator
from backend.database.legacy import save_inquiry_log

router = APIRouter(prefix="/api/manager", tags=["AI Manager"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def manager_chat(
    req: ChatRequest,
    orchestrator: AgentOrchestrator = Depends(get_ai_orchestrator)
):
    """
    Unified chat endpoint for the AI Manager.
    Routes to LangGraph manager_agent_graph via Orchestrator.
    """
    try:
        result = await orchestrator.invoke(
            session_type="manager",
            query=req.message
        )
        
        # Log the interaction if it wasn't a cache hit
        log_id = None
        if not result["cached"]:
            log_id = str(uuid.uuid4())
            save_inquiry_log(
                log_id=log_id,
                customer_id="manager",
                input_text=req.message,
                ai_action_failed="False"
            )
            
        return {
            "response": result["text"],
            "log_id": log_id,
            "cached": result["cached"],
            "tools_used": result["tool_calls"]
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}
