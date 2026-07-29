import json
import os
import sys
import shutil
from pathlib import Path
from langchain_core.documents import Document

# Add backend directory to sys path so we can import from backend.
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.services.rag_service import rag_connector
from backend.config.settings import settings

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

DATA_DIR = "data"
CS_MANUAL_FILE = os.path.join(DATA_DIR, "cs_manuals.json")

def load_manuals():
    if not os.path.exists(CS_MANUAL_FILE):
        print(f"Error: {CS_MANUAL_FILE} does not exist.")
        return []
    with open(CS_MANUAL_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def populate_rag():
    manuals = load_manuals()
    if not manuals:
        print("No manuals found to populate.")
        return

    print(f"Found {len(manuals)} manuals. Refactoring ChromaDB using LangChain...")
    
    # We clear the existing collection to avoid duplicates
    # LangChain Chroma doesn't expose delete_collection directly easily, so we can just delete the directory or use reset()
    # In langchain-chroma, you can call reset_collection() if configured properly, or just delete the data folder.
    try:
        rag_connector.vector_store.reset_collection()
        print("Collection reset.")
    except Exception as e:
        print("Could not reset collection directly, continuing...", e)
    
    documents = []
    
    for manual in manuals:
        text_for_embedding = manual.get("content_for_rag", "")
        if not text_for_embedding:
            continue
            
        doc_id = manual["manual_id"]
        meta = {
            "domain": manual.get("domain", ""),
            "sub_category": manual.get("sub_category", ""),
            "difficulty": manual.get("difficulty", ""),
            "urgency": manual.get("urgency", ""),
            "ai_action_rules": json.dumps(manual.get("ai_action_rules", {}), ensure_ascii=False)
        }
        
        doc = Document(page_content=text_for_embedding, metadata=meta, id=doc_id)
        documents.append(doc)
        
    if not documents:
        print("No content to embed.")
        return
        
    print(f"Embedding and adding {len(documents)} documents to ChromaDB via LangChain...")
    
    rag_connector.vector_store.add_documents(documents=documents, ids=[doc.id for doc in documents])
    
    print(f"✅ Successfully added {len(documents)} documents to ChromaDB.")

if __name__ == "__main__":
    populate_rag()
