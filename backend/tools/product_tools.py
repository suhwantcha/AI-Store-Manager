"""
Langchain tools for product, stock, and QnA queries.
These wrap the existing legacy database functions.
"""
from langchain_core.tools import tool
import json

from backend.database.legacy import (
    get_products_from_db,
    get_qnas_from_db,
    get_reviews_from_db,
)


@tool
def get_product_info(product_name: str = None, product_no: int = None) -> str:
    """
    상품명 또는 상품 번호를 기반으로 상품 상세 정보(가격, 재고, 옵션 등)를 조회합니다.
    """
    products = get_products_from_db()
    result = []
    for p in products:
        if product_no and p.get("originProductNo") == product_no:
            result.append(p)
            break
        elif product_name and product_name.lower() in p.get("name", "").lower():
            result.append(p)
            
    if not result:
         return json.dumps({"error": "상품 정보를 찾을 수 없습니다."}, ensure_ascii=False)
    return json.dumps(result, ensure_ascii=False)


@tool
def get_qna_by_product(product_no: int) -> str:
    """
    특정 상품(product_no)에 대한 과거 QnA 내역을 조회합니다.
    고객들이 자주 묻는 질문을 파악하는 데 유용합니다.
    """
    qnas = get_qnas_from_db()
    result = [q for q in qnas if q.get("productNo") == product_no]
    return json.dumps(result, ensure_ascii=False)


@tool
def get_reviews_by_product(product_no: int) -> str:
    """
    특정 상품(product_no)에 대한 리뷰 내역을 조회합니다.
    최근 고객 피드백이나 불만 사항을 확인할 때 사용합니다.
    """
    reviews = get_reviews_from_db()
    result = [r for r in reviews if r.get("productNo") == product_no]
    return json.dumps(result, ensure_ascii=False)
