# AI-Store-Manager (WIP)

> **Note: This project is currently under active development (Work In Progress).** Features, architecture, and documentation are subject to change.

AI-Store-Manager is an **Agentic AI Operating System** tailored for solo e-commerce sellers and small business owners. Rather than just providing a dashboard, it seamlessly integrates AI (powered by LangGraph and OpenAI) into standard SaaS menus to act as a proactive business co-pilot and automated customer service agent.

---

## Core Philosophy
- **Subtle but Powerful AI**: AI is embedded naturally into the workflow (e.g., "Operational Insights", "Smart Briefings", "Review Auto-Replies") without overwhelming the user with overly flashy "AI" labels.
- **Agentic Workflows**: Utilizes LangGraph to orchestrate agents that can proactively fetch data, search manuals (RAG), and execute tasks.
- **Organic Data Simulation**: The platform runs on a deeply interconnected mock dataset where orders, customer segments (e.g., VIP vs. Churn Risk), shipping delays, and QnAs/Reviews organically affect one another.

---

## 🛠️ Features & Menus

### 1. Dashboard (`/`)
The central hub for store operations.
- **KPIs**: Live tracking of unanswered QnAs, pending claims, and low-stock items.
- **Operational Insights**: AI-generated bullet points summarizing urgent store issues based on real-time data analysis.
- **Sales Trend**: Visual charts displaying recent settlement and sales data.

### 2. CS Agent Hub (`/cs`)
A fully functional Customer Support workspace.
- **RAG-Powered AI Responses**: The AI searches through detailed `cs_manuals.json` (embedded in ChromaDB) to answer complex inquiries perfectly aligned with store policies.
- **Customer 360° View**: Displays the customer's total spend, past claims, recent orders, and automatically recommends the appropriate CS manual.

### 3. Orders Management (`/orders`)
- Comprehensive overview of all customer orders.
- Easily track order status, payment details, and shipping progress.
- Manage claims, cancellations, and returns directly from the grid.

### 4. Products Management (`/products`)
- Centralized database for managing your product catalog.
- Monitor pricing, cost, and active/inactive status across all items.

### 5. Inventory Management (`/inventory`)
- Real-time stock monitoring to prevent stockouts.
- Visual indicators for low-stock items requiring immediate attention.

### 6. Review & QnA Analysis (`/reviews`)
- **Sentiment Analysis**: Automatically categorizes reviews into positive, neutral, and negative.
- **AI Reply Drafting**: Generates polite, context-aware draft replies to negative reviews to help sellers manage their brand reputation effortlessly.

### 7. Customer CRM (`/crm`)
- **Customer Segmentation**: Automatically groups customers into tiers (VIP, Regular, New, Churn Risk) based on their RFM (Recency, Frequency, Monetary) data.
- Helps identify which customers need urgent care (e.g., a Churn Risk customer who experienced a delayed delivery).

### 8. Sales Analytics (`/analytics`)
- **Smart Briefing**: An AI-generated daily morning briefing summarizing yesterday's performance and today's action items.
- **Profit Margin Analysis**: Detailed charts and tables breaking down product costs, margins, and sales volume.

### 9. AI Manager (`/manager`)
Your top-level business orchestrator.
- An interactive chat interface where you can ask high-level questions like *"What's our most urgent inventory issue?"* or *"Analyze recent negative reviews."*
- The AI has access to internal tools (Tool Calling) to query the database for sales analytics, VIP customer lists, and inventory warnings, providing actionable business advice.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS & Material-UI (MUI)
- **Icons & Charts**: Lucide React, Recharts
- **Routing**: React Router DOM

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (via SQLAlchemy & Psycopg2)
- **Vector DB (RAG)**: ChromaDB

### AI & Agentic Components
- **Orchestration**: LangGraph, LangChain
- **LLM & Embeddings**: OpenAI (`gpt-4o-mini`, `text-embedding-3-small`)
- **Observability**: LangSmith (Tracing & Evaluation)

---

## 📂 Repository Structure

```text
AI-Store-Manager/
├── backend/
│   ├── agents/         # High-level orchestrators and routing
│   ├── api/            # FastAPI routers (dashboard, crm, reviews, etc.)
│   ├── config/         # Environment settings (Pydantic Settings)
│   ├── database/       # SQLAlchemy models, legacy connectors, session management
│   ├── prompts/        # Centralized LLM prompt templates
│   ├── scripts/        # Mock data generation and ChromaDB seeding scripts
│   ├── services/       # RAG services, LangChain Retriever integration
│   ├── tools/          # Agent tools (get_customer_info, check_store_kpis, etc.)
│   └── workflows/      # LangGraph state graphs (cs_agent.py, manager_agent.py)
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios client for backend communication
│   │   ├── components/ # Reusable UI components (Chat, Panels, DataGrids)
│   │   ├── layouts/    # Main application shell and Sidebar
│   │   ├── pages/      # Route-level components (Dashboard, CRM, CSAgentHub, etc.)
│   │   └── App.jsx     # Frontend entry point
├── data/               # Raw JSON files (seller_info.json, cs_manuals.json)
├── chroma_data/        # Persistent ChromaDB vector storage (ignored in git)
├── docker-compose.yml  # PostgreSQL DB container configuration
├── .env                # Environment variables (OpenAI, LangSmith, DB URL)
└── README.md           # You are here
```

---

## 🚀 Getting Started

### 1. Database Setup
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
# Navigate to project root, install dependencies via uv
uv pip install -r requirements.txt

# Run the data seeding scripts (Populate Postgres & ChromaDB)
uv run python backend/scripts/generate_mock_data.py
uv run python backend/scripts/seed.py
uv run python backend/scripts/populate_rag.py

# Start the FastAPI server
uv run uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY="your-openai-api-key"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/ai_store_manager"
CHROMA_DB_PATH="chroma_data"

# LangSmith Tracing
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="your-langsmith-api-key"
LANGSMITH_PROJECT="ai-store-manager"
```
