import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta
import backend.database.legacy_connector as db_connector # 데이터베이스 커넥터 임포트

# 환경 변수 및 OpenAI 클라이언트 초기화
load_dotenv()
client = OpenAI()

def summarize_recent_negative_reviews(days: int = 7):
    """
    지정된 기간 동안의 부정적인 리뷰(평점 2점 이하)를 요약합니다.
    :param days: 요약할 기간(일 수)
    :return: 부정적인 리뷰에 대한 요약 문자열
    """
    print(f"-> 🔍 최근 {days}일간의 부정적인 리뷰 요약을 시작합니다.")
    
    # 1. DB에서 모든 리뷰 가져오기
    all_reviews = db_connector.get_reviews_from_db()
    if not all_reviews:
        return "분석할 리뷰 데이터가 없습니다."

    # 2. 최근 'days' 동안의 부정적인 리뷰 필터링
    cutoff_date = datetime.now() - timedelta(days=days)
    negative_reviews = [
        review for review in all_reviews
        if review['created_at'] >= cutoff_date and review['rating'] <= 2
    ]

    if not negative_reviews:
        return f"최근 {days}일 동안 평점 2점 이하의 부정적인 리뷰가 없습니다."

    # 3. LLM을 사용하여 요약 생성
    review_texts = "\n".join([f"- {r['review_text']} (평점: {r['rating']})" for r in negative_reviews])
    
    system_prompt = f"""
    당신은 판매 데이터를 분석하는 전문 애널리스트입니다.
    아래에 제공된 최근 부정적인 고객 리뷰 목록을 분석하여, 주요 불만 사항과 반복되는 패턴을 요약해주세요.
    결과는 판매자가 쉽게 이해할 수 있도록 명확하고 간결한 보고서 형식으로 작성해야 합니다.
    """
    
    user_prompt = f"""
    [최근 부정 리뷰 목록]
    {review_texts}

    [분석 및 요약 요청]
    위 리뷰들을 바탕으로 다음 항목에 대해 요약 보고서를 작성해주세요:
    1. 주요 불만 카테고리 (예: 제품 품질, 배송, 포장 등)
    2. 가장 자주 언급되는 문제점
    3. 판매자가 즉시 조치해야 할 사항 (있을 경우)
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # 요약에는 저비용 모델 사용
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2
        )
        summary = response.choices[0].message.content
        print(f"-> ✅ 리뷰 요약 생성 완료.")
        return summary
    except Exception as e:
        print(f"⚠️ 리뷰 요약 중 LLM 호출 오류 발생: {e}")
        return "리뷰 요약 중 오류가 발생했습니다."

if __name__ == '__main__':
    # 모듈 테스트
    print("--- 리뷰 분석 모듈 테스트 ---")
    summary_report = summarize_recent_negative_reviews(days=30) # 테스트를 위해 30일로 설정
    print("\n[요약 보고서]\n", summary_report)
    print("--- 테스트 완료 ---")
