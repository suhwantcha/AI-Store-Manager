"""
RAG connector using ChromaDB for context retrieval.
Ports functionality from the original rag_connector.py.
"""
import chromadb
from chromadb.config import Settings
import openai

from backend.config.settings import settings


class RAGConnector:
    def __init__(self):
        # Initialize ChromaDB client using config paths
        self.chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
            settings=Settings(allow_reset=True, anonymized_telemetry=False)
        )
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        
        try:
            self.collection = self.chroma_client.get_collection(name=self.collection_name)
        except Exception:
            # Create if it doesn't exist
            self.collection = self.chroma_client.create_collection(name=self.collection_name)

    def _get_embedding(self, text: str) -> list[float]:
        """Generate embedding using OpenAI's embedding model."""
        response = openai.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    def retrieve_context(self, query: str, n_results: int = 3, filter_category: str = None) -> str:
        """
        Retrieve relevant context from ChromaDB based on the query.
        """
        if self.collection.count() == 0:
            return "검색된 참고 자료가 없습니다 (DB가 비어있음)."

        try:
            query_embedding = self.get_embedding(query)
            
            where_clause = None
            if filter_category:
                where_clause = {"category": filter_category}
                
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_clause
            )
            
            if not results['documents'] or not results['documents'][0]:
                return "검색된 관련 문서가 없습니다."
                
            context = "\n\n".join(results['documents'][0])
            return context
            
        except Exception as e:
            print(f"RAG retrieval error: {e}")
            return "참고 자료 검색 중 오류가 발생했습니다."
            
    def get_embedding(self, text: str) -> list[float]:
        return self._get_embedding(text)

# Singleton instance
rag_connector = RAGConnector()

def retrieve_cs_context(query: str) -> str:
    """Convenience function for CS Agent to retrieve context."""
    return rag_connector.retrieve_context(query, n_results=3)
