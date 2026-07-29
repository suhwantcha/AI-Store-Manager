# 🚀 AI-Store Manager (AI-Powered CRM Manager for Small Business Owners)

> ⚠️ **WORK IN PROGRESS**: This project is currently undergoing a massive structural refactoring and UI/UX redesign (Evolving into AI Store Manager OS). The codebase is transitioning to a scalable LangGraph multi-agent architecture and premium glassmorphic React UI. Some documentation below may be outdated.

> **Note:** This project is an AI-powered manager solution designed to help sole proprietors and small business owners automate and enhance customer service (CS), review management, customer relationship management (CRM), and business data analysis, allowing them to focus on growing their business.

## 👥 Two User Roles

This system provides role-specific features for two types of internal users—**Admin/CEO** and **Agent**—to support efficient task distribution.

1. **Admin/CEO**

   * **Role:** Business owner or general manager
   * **Key Features:** Through a dedicated admin dashboard, users can monitor all key business metrics, including KPIs, sales trends, and customer segmentation, enabling **data-driven strategic decision-making**. The CRM features also support targeted marketing and proactive business risk management.

2. **Agent**

   * **Role:** Customer support representative
   * **Key Features:** Handles **complex customer service inquiries** that the AI cannot resolve automatically or when customers request to speak with a human agent. Agents also review, edit, and approve AI-generated draft responses for negative reviews, focusing on **maintaining customer service quality**. In addition, they provide feedback on AI responses to continuously improve the system's accuracy.

---

## ✨ Key Features for Admins (Admin Dashboard)

* **AI Admin Dashboard**

  * **KPI Monitoring:** Track key business metrics in real time, including unanswered Q&A, ongoing customer claims, low-stock products, and the latest settlement amounts.
  * **Risk Alerts:** Receive early warnings about potential business risks, such as inventory shortages or sudden increases in negative reviews for specific products.
  * **Data Visualization:** View important business data, such as daily sales trends, through intuitive charts for easier analysis.
* **CRM Features**

  * **Customer Segmentation:** Automatically categorize customers into groups such as "Loyal Customers" and "At-Risk Customers" to support targeted marketing campaigns.
  * **Action Recommendations:** Suggest and execute personalized actions, such as sending coupons to at-risk customers.

## 💬 Key Features for Agents (Agent Tools)

* **Efficient Three-Column Customer Support Workspace:** Designed with a three-column layout similar to Slack or Intercom, allowing agents to communicate with customers while accessing all necessary information at a glance.

  * **[Left Column] Inquiry Queue:** View and select new, ongoing, and completed customer inquiries in real time.
  * **[Center Column] Live Chat Window:** Communicate with customers while receiving AI-generated response suggestions. Agents can use AI responses, provide direct replies, submit feedback, and attach files.
  * **[Right Column] Customer Profile:** Instantly access the selected customer's basic information, recent order history, previous claims, past reviews, and AI-recommended customer service manuals.
* **AI-Powered Review Management:** Automatically detect negative customer reviews and allow agents to review, approve, and publish AI-generated response drafts.
* **Intelligent Customer Service Chatbot with Self-Improvement:** Generates accurate responses using a RAG-based architecture while continuously improving answer quality through agent feedback.

## 🛠️ Tech Stack

* **Backend:** FastAPI, Python
* **Frontend:** React, Vite, Recharts, Axios
* **Database:** PostgreSQL (Integrated with Google Cloud SQL)
* **Vector Database:** ChromaDB
* **LLM:** OpenAI GPT-4o, GPT-3.5-turbo
* **Embedding Model:** OpenAI `text-embedding-3-small`

## 🚀 Getting Started

### 📋 Prerequisites

* Python 3.9+
* Node.js 18+
* Google Cloud Platform (GCP) account and a Cloud SQL for PostgreSQL instance
* OpenAI API Key

### ⚙️ Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/suhwantcha/CS-Agent.git
   cd your-repo
   ```

2. **Backend Setup:**

   ```bash
   # Create and activate a virtual environment
   python -m venv venv
   # Windows: .\venv\Scripts\activate | macOS/Linux: source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Variables:**
   Create a `.env` file in the project root and enter your GCP and OpenAI credentials.

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=5433 # Local Cloud SQL Auth Proxy port
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=YOUR_DB_PASSWORD
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   ```

5. **Run the Application (Requires 3–4 Terminal Windows):**

   * **Terminal 1: Start the Cloud SQL Auth Proxy**
     Connect your local machine to GCP using the Google Cloud SDK.

     ```bash
     # cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5433
     ```

   * **Terminal 2: Seed the Database (Run Once Only)**
     Insert the initial dataset into the database.

     ```bash
     python seed_cloud_sql.py
     ```

   * **Terminal 3: Start the Backend Server**

     ```bash
     uvicorn api:app --host 127.0.0.1 --port 8000 --reload
     ```

   * **Terminal 4: Start the Frontend Server**

     ```bash
     cd frontend
     npm run dev
     ```

6. **Access the Application:**
   Open your browser and visit `http://localhost:5173` to access the Admin Dashboard.

### 📸 Application Screenshots

<img width="350" height="180" alt="1" src="https://github.com/user-attachments/assets/b5337714-6af9-41ff-8874-929c59e882a4" />
<img width="350" height="180" alt="2" src="https://github.com/user-attachments/assets/9cab787e-d7c2-42e0-bd97-f97216f1ecbc" /><br>
<img width="300" height="300" alt="3" src="https://github.com/user-attachments/assets/aa8c0528-6f82-4e0d-8e0c-0eaefdf778ce" />
<img width="300" height="300" alt="4" src="https://github.com/user-attachments/assets/e469479d-0b94-4cc4-b1a1-92ca9e89f464" /><br>

## 📁 Project Structure

```text
.
├── frontend/                 # React frontend (Admin Dashboard, Chatbot UI)
│   ├── src/
│   │   ├── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── Chat.jsx
│   │   ├── CSAgentHub.jsx
│   │   ├── CustomerInfoPanel.jsx   # Customer information panel
│   │   └── WorklistPanel.jsx       # Inquiry queue panel
├── data/                     # Initial dataset (JSON format)
├── chroma_data/              # ChromaDB vector database storage
│
├── api.py                    # FastAPI main application (API endpoints)
├── llm_agent.py              # LLM interactions (response generation, self-improvement)
├── review_analyzer.py        # Negative review analysis and response draft generation
├── db_connector.py           # Database connection and CRUD logic
├── rag_connector.py          # RAG (ChromaDB) connection logic
├── seed_cloud_sql.py         # Database table creation and data seeding
│
├── AI_CRM_Manager_Project_Report.pdf   # Detailed project documentation
├── requirements.txt          # Python dependency list
└── README.md                 # Project documentation
```
