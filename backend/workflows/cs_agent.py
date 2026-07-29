"""
CS Agent Graph using LangGraph.
Implements a retrieval-augmented tool-calling agent.
"""
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage

from backend.config.settings import settings
from backend.workflows.state import AgentState
from backend.prompts.templates import CS_SYSTEM_PROMPT
from backend.services.rag_service import retrieve_cs_context
from backend.tools.customer_tools import get_customer_info, get_order_details
from backend.tools.product_tools import get_product_info, get_qna_by_product, get_reviews_by_product


# 1. Define tools and LLM
# We use the small model configured in settings for CS
llm = ChatOpenAI(model=settings.CS_AGENT_MODEL, temperature=0.1)

tools = [
    get_customer_info,
    get_order_details,
    get_product_info,
    get_qna_by_product,
    get_reviews_by_product
]

llm_with_tools = llm.bind_tools(tools)


# 2. Define graph nodes
def retrieve(state: AgentState) -> dict:
    """RAG retrieval node — fetches CS manual context based on the user's latest message."""
    last_message = state["messages"][-1].content
    context = retrieve_cs_context(last_message)
    return {"retrieved_context": context}


def generate(state: AgentState) -> dict:
    """LLM generation node — produces response (may include tool calls)."""
    # Inject context and store settings into the system prompt
    # TODO: Fetch actual failure logs if needed (hardcoding empty for now)
    system = CS_SYSTEM_PROMPT.format(
        context=state.get("retrieved_context", ""),
        store_context=state.get("store_context", ""),
        correction_prompt=""
    )
    
    # Construct the message list: System + all conversation history
    messages = [SystemMessage(content=system)] + list(state["messages"])
    
    # Invoke LLM
    response = llm_with_tools.invoke(messages)
    
    # Track tool calls if made
    tool_calls_made = list(state.get("tool_calls_made", []))
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tc in response.tool_calls:
            tool_calls_made.append(tc.get("name", "unknown_tool"))
            
    return {
        "messages": [response],
        "model_used": settings.CS_AGENT_MODEL,
        "tool_calls_made": tool_calls_made
    }


def should_use_tools(state: AgentState) -> str:
    """Conditional edge — check if the LLM wants to use a tool."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END


# 3. Build the graph
graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("retrieve", retrieve)
graph_builder.add_node("generate", generate)
graph_builder.add_node("tools", ToolNode(tools))

# Add edges
graph_builder.set_entry_point("retrieve")
graph_builder.add_edge("retrieve", "generate")
graph_builder.add_conditional_edges(
    "generate",
    should_use_tools,
    {
        "tools": "tools",
        END: END,
    }
)
graph_builder.add_edge("tools", "generate")

# Compile
cs_agent_graph = graph_builder.compile()
