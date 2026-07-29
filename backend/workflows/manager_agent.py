"""
AI Manager Graph using LangGraph.
Implements a top-level orchestrator agent with access to multiple store tools.
"""
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool

from backend.config.settings import settings
from backend.workflows.state import AgentState
from backend.database.legacy import (
    get_unanswered_qnas_count,
    get_pending_claims_count,
    get_low_stock_products_count,
    get_low_stock_products,
    get_customers_by_segment,
    calculate_product_margins,
    get_recent_negative_reviews
)

# 1. Define Tools
@tool
def check_store_kpis() -> dict:
    """Returns general store KPIs: unanswered QnAs, pending claims, and low stock count."""
    return {
        "unanswered_qnas": get_unanswered_qnas_count(),
        "pending_claims": get_pending_claims_count(),
        "low_stock_items": get_low_stock_products_count()
    }

@tool
def get_inventory_warnings() -> list:
    """Returns a list of products that are low in stock or out of stock."""
    return get_low_stock_products()

@tool
def get_customer_segment(segment: str) -> list:
    """
    Returns a list of customers in a specific segment.
    Valid segments: 'VIP', '일반', '신규', '이탈 위험 고객'
    """
    return get_customers_by_segment(segment)

@tool
def get_product_sales_analytics(period_days: int = 7) -> list:
    """Returns sales amount, cost, margin, and margin percentage for products over the last N days."""
    return calculate_product_margins(period_days)

@tool
def get_negative_reviews() -> list:
    """Returns recent negative reviews (3 stars or below)."""
    return get_recent_negative_reviews()

tools = [
    check_store_kpis,
    get_inventory_warnings,
    get_customer_segment,
    get_product_sales_analytics,
    get_negative_reviews
]

# We use the primary model (gpt-4o or gpt-4o-mini)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# 2. Define nodes
MANAGER_PROMPT = """당신은 StoreManager OS의 최고 AI 비즈니스 매니저입니다.
당신은 스토어의 재고, 고객, 리뷰, 매출 데이터를 조회할 수 있는 도구들을 가지고 있습니다.
사용자(사장님)의 질문을 분석하고, 필요한 도구를 호출하여 정확한 데이터를 바탕으로 답변하세요.
답변은 전문적이면서도 간결하고 친절해야 합니다. 필요하다면 데이터에 기반한 마케팅이나 운영 조언도 덧붙이세요.
답변 포맷은 보기 좋게 불릿 포인트나 짧은 문단으로 구성하세요. 'AI가 분석한 결과입니다' 같은 불필요한 말은 피하세요.
"""

def generate(state: AgentState) -> dict:
    """LLM generation node"""
    system = MANAGER_PROMPT
    messages = [SystemMessage(content=system)] + list(state["messages"])
    
    response = llm_with_tools.invoke(messages)
    
    tool_calls_made = list(state.get("tool_calls_made", []))
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tc in response.tool_calls:
            tool_calls_made.append(tc.get("name", "unknown_tool"))
            
    return {
        "messages": [response],
        "model_used": "gpt-4o-mini",
        "tool_calls_made": tool_calls_made
    }

def should_use_tools(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

# 3. Build the graph
graph_builder = StateGraph(AgentState)
graph_builder.add_node("generate", generate)
graph_builder.add_node("tools", ToolNode(tools))

graph_builder.set_entry_point("generate")
graph_builder.add_conditional_edges(
    "generate",
    should_use_tools,
    {
        "tools": "tools",
        END: END,
    }
)
graph_builder.add_edge("tools", "generate")

manager_agent_graph = graph_builder.compile()
