import json
import random
from datetime import datetime, timedelta
import os
import uuid

DATA_DIR = "data"

def generate_customers(n=100):
    customers = []
    categories = ["한식/탕류", "간식/디저트", "농산물/과일", "수산물/건어물"]
    
    first_names = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"]
    last_names = ["서강", "길동", "철수", "영희", "알바트로스", "민수", "지훈", "서연", "민지", "지민", "현우", "건우", "도윤", "예은", "하은", "지안", "수아", "지우", "민서", "우진", "준호"]
    
    for i in range(1, n+1):
        c_id = f"customer_{i:03d}"
        name = random.choice(first_names) + random.choice(last_names)
        
        rand = random.random()
        if rand < 0.10: # 10% VIP
            segment = "VIP"
            total_orders = random.randint(15, 60)
            total_spend = random.randint(500000, 3000000)
            days_ago = random.randint(0, 20)
        elif rand < 0.25: # 15% CHURN_RISK
            segment = "CHURN_RISK"
            total_orders = random.randint(5, 20)
            total_spend = random.randint(50000, 400000)
            days_ago = random.randint(61, 150)
        elif rand < 0.45: # 20% NEW
            segment = "NEW"
            total_orders = random.randint(1, 3)
            total_spend = random.randint(10000, 50000)
            days_ago = random.randint(0, 14)
        else: # REGULAR
            segment = "REGULAR"
            total_orders = random.randint(4, 14)
            total_spend = random.randint(30000, 400000)
            days_ago = random.randint(15, 60)
            
        customers.append({
            "customerId": c_id,
            "name": name,
            "segment": segment,
            "totalSpend": total_spend,
            "totalOrders": total_orders,
            "lastOrderDate": (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d"),
            "mainCategory": random.choice(categories),
            "avgRating": round(random.uniform(3.5, 5.0), 2) if segment != "CHURN_RISK" else round(random.uniform(1.0, 3.0), 2),
            "totalClaims": random.randint(0, 1) if segment != "CHURN_RISK" else random.randint(1, 5)
        })
    return customers

def generate_products(n=50):
    products = []
    categories = [
        {"categoryId": "10001", "categoryName": "한식/탕류"},
        {"categoryId": "10002", "categoryName": "간식/야식"},
        {"categoryId": "10003", "categoryName": "신선육류"},
        {"categoryId": "10004", "categoryName": "수산물"},
        {"categoryId": "10005", "categoryName": "과일/채소"}
    ]
    
    product_templates = [
        "얼큰 소고기 뭇국 500g 밀키트",
        "순살 왕갈비탕 밀키트 650g",
        "치즈 듬뿍 수제 돈까스 2장 세트",
        "부산 어묵 꼬치 세트 10꼬치",
        "무항생제 1등급 삼겹살 500g 구이용",
        "속초식 닭강정 순살 1박스",
        "프리미엄 한우 채끝 스테이크 200g",
        "제주 고당도 감귤 3kg 박스",
        "통통한 바지락살 500g 찌개용",
        "매콤 제육볶음 밀키트 2인분",
        "부대찌개 밀키트 햄 듬뿍 3인분",
        "마라탕 밀키트 푸주 당면 포함 2~3인분",
        "춘천식 철판 닭갈비 1kg",
        "영광 굴비 10미 가정용",
        "샤인머스켓 2kg 프리미엄 과일"
    ]
    
    for i in range(1, n+1):
        origin_no = 1000000 + i
        cost = random.randint(3000, 30000)
        sale = int(cost * random.uniform(1.2, 1.8))
        
        base_name = product_templates[i % len(product_templates)]
        if i >= len(product_templates):
            base_name += f" (옵션 {i})"
            
        products.append({
            "originProductNo": origin_no,
            "channelProductNo": f"C001-P{origin_no}",
            "productName": base_name,
            "category": random.choice(categories),
            "brand": "서강몰",
            "manufacturer": "서강제조",
            "productAttributes": [],
            "productImages": [{"url": "https://image.example.com/placeholder.jpg"}],
            "price": {"costPrice": cost, "salePrice": sale, "originalPrice": int(sale * 1.3), "discountRate": 20},
            "stockQuantity": random.randint(10, 300) if random.random() > 0.1 else random.randint(0, 20),
            "delivery": {"deliveryCompany": "CJ대한통운", "deliveryFee": 3000},
            "tags": ["베스트셀러"] if random.random() > 0.8 else [],
            "status": random.choice(["ON_SALE", "ON_SALE", "ON_SALE", "OUT_OF_STOCK"])
        })
    return products

def generate_orders_reviews_qnas(customers, products, n_orders=500):
    orders = []
    reviews = []
    qnas = []
    
    statuses = ["결제완료", "배송준비중", "배송중", "배송완료", "배송완료", "배송완료", "배송완료", "배송지연", "취소", "환불"]
    
    for i in range(1, n_orders+1):
        c = random.choice(customers)
        p = random.choice(products)
        qty = random.randint(1, 5)
        
        payment_date = datetime.now() - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
        
        # CHURN_RISK might have more claims/delays
        if c["segment"] == "CHURN_RISK" and random.random() < 0.4:
            status = random.choice(["환불", "취소", "배송지연"])
        else:
            status = random.choice(statuses)
            
        delivery_date = None
        if status == "배송완료":
            delivery_date = (payment_date + timedelta(days=random.randint(1,4))).strftime("%Y-%m-%dT%H:%M:%SZ")
            
        claim_type = None
        claim_reason = None
        if status == "환불" or status == "취소":
            claim_type = "REFUND"
            claim_reason = random.choice(["단순변심", "상품변질", "배송지연"])
        elif status == "배송지연":
            claim_reason = "물류센터 파업"
            
        order_dict = {
            "productOrderId": f"PO-{payment_date.strftime('%Y%m%d')}-{i:04d}",
            "orderId": f"ORD-{payment_date.strftime('%Y%m%d')}-{i}",
            "productInfo": {
                "originProductNo": p["originProductNo"],
                "productName": p["productName"],
                "quantity": qty,
                "totalAmount": p["price"]["salePrice"] * qty
            },
            "orderer": { "id": c["customerId"], "name": c["name"] },
            "shippingAddress": { "receiver": c["name"], "address": "서울시 마포구" },
            "orderStatus": status,
            "paymentDate": payment_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "deliveryCompleteDate": delivery_date,
            "claimData": {"claimType": claim_type, "reason": claim_reason} if claim_reason else None
        }
        orders.append(order_dict)
        
        # Generate Review if delivered
        if status == "배송완료" and random.random() < 0.4:
            rating = 5
            review_text = "정말 맛있어요! 또 시킬게요."
            
            if c["segment"] == "CHURN_RISK":
                rating = random.randint(1, 3)
                review_text = random.choice(["맛이 예전같지 않아요.", "배송이 너무 느렸습니다.", "포장이 터져서 왔네요.", "별로예요."])
            elif random.random() < 0.1:
                rating = random.randint(1, 3)
                review_text = "생각보다 별로네요. 다음엔 안 살듯요."
                
            reviews.append({
                "review_id": f"REV-{str(uuid.uuid4())[:8]}",
                "customer_id": c["customerId"],
                "product_id": p["originProductNo"],
                "rating": rating,
                "review_text": review_text,
                "created_at": (datetime.strptime(delivery_date, "%Y-%m-%dT%H:%M:%SZ") + timedelta(days=random.randint(0, 5))).strftime("%Y-%m-%dT%H:%M:%SZ")
            })
            
        # Generate QnA occasionally
        if random.random() < 0.15:
            q_types = ["PRODUCT", "DELIVERY", "CLAIM"]
            q_type = random.choice(q_types)
            q_text = "문의드립니다."
            
            if status == "배송지연":
                q_type = "DELIVERY"
                q_text = "배송 언제 되나요? 너무 느려요."
            elif status == "환불":
                q_type = "CLAIM"
                q_text = "환불 처리 언제 되나요?"
            elif q_type == "PRODUCT":
                q_text = "이거 조리 어떻게 해야 제일 맛있나요?"
                
            is_answered = random.random() > 0.2 # 20% unanswered
            
            qnas.append({
                "questionId": f"QNA-{str(uuid.uuid4())[:8]}",
                "originProductNo": p["originProductNo"],
                "productName": p["productName"],
                "customerId": c["customerId"],
                "questionType": q_type,
                "questionText": q_text,
                "isAnswered": is_answered,
                "questionDate": payment_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "answer": {
                    "answerContentId": f"ANS-{str(uuid.uuid4())[:8]}",
                    "answerText": "네 고객님, 문의하신 내용 확인했습니다. 감사합니다." if is_answered else "",
                    "answerDate": (payment_date + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
                } if is_answered else None
            })

    return orders, reviews, qnas

def generate_settlements(days=14):
    settlements = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        current_date = base_date + timedelta(days=i)
        multiplier = 1.5 if current_date.weekday() >= 5 else 1.0
        trend = 1.0 + (i * 0.05)
        
        base_sales = random.randint(1500000, 3000000)
        total_payment = int(base_sales * multiplier * trend)
        commission = int(total_payment * 0.05)
        total_settlement = total_payment - commission
        
        settlements.append({
            "settleDate": current_date.strftime("%Y-%m-%d"),
            "totalPaymentAmount": total_payment,
            "totalCommission": commission,
            "totalSettlementAmount": total_settlement
        })
    return settlements

def main():
    customers = generate_customers(200) # Increased volume
    products = generate_products(100) # Increased volume
    orders, reviews, qnas = generate_orders_reviews_qnas(customers, products, 1500) # Increased volume
    settlements = generate_settlements(30) # 30 days
    
    with open(os.path.join(DATA_DIR, "customers.json"), "w", encoding="utf-8") as f:
        json.dump(customers, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_DIR, "products.json"), "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_DIR, "orders.json"), "w", encoding="utf-8") as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_DIR, "reviews.json"), "w", encoding="utf-8") as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_DIR, "qnas.json"), "w", encoding="utf-8") as f:
        json.dump(qnas, f, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA_DIR, "settlement.json"), "w", encoding="utf-8") as f:
        json.dump(settlements, f, ensure_ascii=False, indent=2)
        
    print(f"Mock data generated! (Customers: {len(customers)}, Products: {len(products)}, Orders: {len(orders)}, Reviews: {len(reviews)}, QnAs: {len(qnas)})")

if __name__ == "__main__":
    main()
