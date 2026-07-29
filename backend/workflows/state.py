"""
Shared agent state schema for all LangGraph agent graphs.
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """
    Shared state schema for all agent graphs.
    Each graph reads/writes to these fields during execution.
    """
    # Conversation messages — auto-appended via add_messages reducer
    messages: Annotated[Sequence[BaseMessage], add_messages]
    # Context retrieved from RAG
    retrieved_context: str
    # Names of tools that were called (for logging/debugging)
    tool_calls_made: list[str]
    # Store policies and context (injected at graph start)
    store_context: str
    # Session metadata
    session_type: str   # "cs" | "copilot" | "review"
    customer_id: str | None
    # Which model was used (for cost tracking)
    model_used: str
