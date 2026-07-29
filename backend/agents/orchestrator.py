"""
Agent Orchestrator.
Routes AI requests to the appropriate agent graph and handles caching.
"""
from langchain_core.messages import HumanMessage
from backend.workflows.cs_agent import cs_agent_graph
from backend.workflows.manager_agent import manager_agent_graph
from backend.core.cache import get_cached, set_cached


class AgentOrchestrator:
    """Routes AI requests to the appropriate agent graph."""

    def __init__(self, store_context: str):
        self.store_context = store_context
        # Registry of available graphs
        self.graphs = {
            "cs": cs_agent_graph,
            "manager": manager_agent_graph,
        }

    async def invoke(self, session_type: str, query: str, customer_id: str = None) -> dict:
        """
        Invoke the appropriate AI graph.
        Returns a dict with the text response and metadata.
        """
        # 1. Check Tier 1 runtime cache (diskcache)
        cached = get_cached(session_type, query)
        if cached:
            return {
                "text": cached,
                "cached": True,
                "model_used": "cache",
                "tool_calls": []
            }

        # 2. Verify session type
        if session_type not in self.graphs:
            raise ValueError(f"Unknown session type: {session_type}")
            
        graph = self.graphs[session_type]

        # 3. Build initial state
        state = {
            "messages": [HumanMessage(content=query)],
            "retrieved_context": "",
            "tool_calls_made": [],
            "store_context": self.store_context,
            "session_type": session_type,
            "customer_id": customer_id,
            "model_used": "",
        }

        # 4. Run the graph
        result = await graph.ainvoke(state)

        # 5. Extract results
        response_msg = result["messages"][-1]
        response_text = response_msg.content
        model_used = result.get("model_used", "unknown")
        tools_used = result.get("tool_calls_made", [])

        # 6. Cache the successful result
        set_cached(session_type, query, response_text)

        return {
            "text": response_text,
            "cached": False,
            "model_used": model_used,
            "tool_calls": tools_used
        }
