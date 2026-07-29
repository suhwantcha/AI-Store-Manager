"""
RAG connector using LangChain's Chroma integration.
Uses standard LangChain Retriever and Embeddings for better scalability.
"""
import os
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

from backend.config.settings import settings

class RAGConnector:
    def __init__(self):
        # Initialize OpenAI Embeddings
        self.embeddings = OpenAIEmbeddings(
            api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small"
        )
        
        # Initialize LangChain Chroma VectorStore
        self.vector_store = Chroma(
            collection_name=settings.CHROMA_COLLECTION_NAME,
            embedding_function=self.embeddings,
            persist_directory=settings.CHROMA_DB_PATH
        )
        
        # Create a standard retriever
        self.retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )

    def retrieve_context(self, query: str, n_results: int = 3, filter_category: str = None) -> str:
        """
        Retrieve relevant context from ChromaDB based on the query.
        """
        try:
            # Check if empty
            if not self.vector_store._collection or self.vector_store._collection.count() == 0:
                return "검색된 참고 자료가 없습니다 (DB가 비어있음)."
                
            search_kwargs = {"k": n_results}
            if filter_category:
                search_kwargs["filter"] = {"category": filter_category}
                
            # Use retriever directly or similarity_search
            docs = self.vector_store.similarity_search(query, **search_kwargs)
            
            if not docs:
                return "검색된 관련 문서가 없습니다."
                
            # Combine the content of all retrieved documents
            context = "\n\n".join([doc.page_content for doc in docs])
            return context
            
        except Exception as e:
            print(f"RAG retrieval error: {e}")
            return "참고 자료 검색 중 오류가 발생했습니다."

# Singleton instance
rag_connector = RAGConnector()

def retrieve_cs_context(query: str) -> str:
    """Convenience function for CS Agent to retrieve context."""
    return rag_connector.retrieve_context(query, n_results=3)
