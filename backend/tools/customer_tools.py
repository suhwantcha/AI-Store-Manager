"""
Langchain tools for customer and order queries.
These wrap the existing legacy database functions.
"""
from langchain_core.tools import tool
import json

from backend.database.legacy import (
    get_customers_from_db,
    get_orders_from_db,
)


@tool
def get_customer_info(customer_id: str) -> str:
    """
    고객 ID를 기반으로 고객의 기본 정보(이름, 세그먼트, 총 구매액 등)를 조회합니다.
    """
    customers = get_customers_from_db()
    for c in customers:
        if c.get("customerId") == customer_id:
            return json.dumps(c, ensure_ascii=False)
    return json.dumps({"error": f"고객 ID {customer_id}를 찾을 수 없습니다."}, ensure_ascii=False)


@tool
def get_order_details(customer_id: str = None, order_id: str = None) -> str:
    """
    고객 ID 또는 주문 ID를 기반으로 주문 상세 정보를 조회합니다.
    주문 상태, 구매한 상품, 결제 금액 등을 확인할 수 있습니다.
    """
    orders = get_orders_from_db()
    result = []
    for o in orders:
        if customer_id and o.get("customerId") == customer_id:
            result.append(o)
        elif order_id and o.get("orderId") == order_id:
            result.append(o)
            break
            
    if not result:
         return json.dumps({"error": "주문 정보를 찾을 수 없습니다."}, ensure_ascii=False)
    return json.dumps(result, ensure_ascii=False)
