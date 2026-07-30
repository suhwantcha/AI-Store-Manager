import os
import json
import logging
import openai
from pydantic import BaseModel, Field
from backend.database.legacy import get_db_connection
from backend.services.rag_service import RAGConnector
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

class CSManualEntry(BaseModel):
    category: str = Field(description="The category of the policy, e.g., 'Delivery', 'Refund', 'VIP'")
    topic: str = Field(description="The specific topic or scenario")
    policy: str = Field(description="The detailed rule or policy to follow")
    script: str = Field(description="A sample script to say to the customer")


async def evolve_knowledge(log_id: str, final_resolution: str):
    """
    Analyzes the failure log and the correct final resolution provided by the human agent,
    generates a new CS manual entry, and updates both the JSON file and ChromaDB.
    """
    logger.info(f"진화 프로세스 시작: log_id={log_id}")
    
    conn = get_db_connection()
    if not conn:
        logger.error("DB 연결 실패")
        return
        
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT input_text, ai_action_failed FROM inquiry_logs WHERE log_id = %s",
                (log_id,)
            )
            row = cur.fetchone()
            if not row:
                logger.error(f"로그를 찾을 수 없습니다: log_id={log_id}")
                return
                
            input_text, ai_action_failed = row
            
            # 1. GPT를 사용해 새로운 지식(Manual Entry) 추출
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.error("OPENAI_API_KEY가 설정되지 않았습니다.")
                return
                
            client = openai.AsyncOpenAI(api_key=api_key)
            
            prompt = f"""당신은 AI 상담원의 실수를 교정하고 새로운 규칙을 만들어내는 '지식 진화 엔진'입니다.
다음은 고객의 문의, 기존 AI의 잘못된 답변, 그리고 상담원이 새로 제공한 올바른 가이드(정답)입니다.

- 고객 문의: {input_text}
- 기존 AI의 잘못된 답변: {ai_action_failed}
- 상담원이 제시한 올바른 정답: {final_resolution}

위 정보를 분석하여, 앞으로 AI가 동일한 실수를 반복하지 않도록 명확한 CS 매뉴얼 항목 하나를 도출하세요.
반드시 제공된 JSON 스키마에 맞게 결과를 반환하세요.
"""
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt}
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "cs_manual_entry",
                        "schema": CSManualEntry.model_json_schema(),
                        "strict": True
                    }
                }
            )
            
            new_entry_data = json.loads(response.choices[0].message.content)
            
            # 2. JSON 파일에 추가
            manuals_path = "data/cs_manuals.json"
            try:
                with open(manuals_path, 'r', encoding='utf-8') as f:
                    manuals = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                manuals = []
                
            manuals.append(new_entry_data)
            
            with open(manuals_path, 'w', encoding='utf-8') as f:
                json.dump(manuals, f, indent=4, ensure_ascii=False)
                
            logger.info("새로운 지식이 cs_manuals.json에 저장되었습니다.")
            
            # 3. ChromaDB에 임베딩 추가
            doc_content = f"Category: {new_entry_data['category']}\nTopic: {new_entry_data['topic']}\nPolicy: {new_entry_data['policy']}\nScript: {new_entry_data['script']}"
            document = Document(
                page_content=doc_content,
                metadata={"source": "self_evolution", "category": new_entry_data["category"]}
            )
            
            rag = RAGConnector()
            rag.add_documents([document])
            
            logger.info("새로운 지식이 ChromaDB(RAG)에 추가되었습니다.")
            
            # 4. DB 업데이트 (is_learned = TRUE)
            cur.execute(
                "UPDATE inquiry_logs SET is_learned = TRUE WHERE log_id = %s",
                (log_id,)
            )
        conn.commit()
        logger.info(f"자가진화 성공: {new_entry_data['topic']}")
        
    except Exception as e:
        logger.error(f"자가진화 중 오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()
