# NutriVision AI: Advanced Food Analysis & Freshness Tracking Platform

NutriVision AI is a production-grade, AI-powered food analysis website. The platform leverages state-of-the-art Computer Vision and Generative AI to automate diet tracking, estimate portion weights, evaluate food freshness, and provide personalized dietary suggestions.

---

## 🚀 Key Features

*   **AI Food Object Recognition**: Bounding box object detection powered by a fine-tuned **YOLOv8** model.
*   **Freshness Classification**: Custom CNN (EfficientNet transfer learning) classification detecting surface spoilage and assessing remaining shelf-life days.
*   **Decoupled Portion Scaling**: Mathematical portion weight estimation mapping identified box ratios directly to nutritional values.
*   **Nutritional Database Lookup**: Integration with the **USDA FoodData Central API** to retrieve exact caloric, macronutrient, and micronutrient breakdowns, cached locally in Supabase PostgreSQL.
*   **Gemini AI Advisor**: Contextual generative health suggestions explaining how to handle moderately ripe ingredients, recipe ideas to prevent waste, and overall goal tracking tips.
*   **Analytical Dashboards & PDF Exporting**: Comprehensive tracking statistics displaying user daily budgets, and custom **ReportLab** PDF generation.
*   **Secure Authentication**: Row Level Security (RLS) data isolation powered by **Supabase Auth & Storage**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend Core** | Python FastAPI, Uvicorn, Pydantic, HTTPX |
| **AI / Vision** | YOLOv8 (Ultralytics), OpenCV, EfficientNet, ONNX Runtime |
| **Database & Auth**| Supabase PostgreSQL, Supabase Auth, Supabase Storage |
| **Integrations** | USDA FoodData Central REST API, Google Gemini API |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📂 Project Directory Structure

```
NutriVision-AI/
├── .github/workflows/          # CI/CD test and schema verification workflows
├── backend/                    # Python FastAPI service layers, CV pipelines, and tests
├── database/                   # PostgreSQL table schemas, triggers, and seed scripts
├── frontend/                   # Next.js UI layouts, hooks, contexts, and assets
├── ml/                         # YOLO/EfficientNet training setups and model configurations
└── scripts/                    # Platform automation and database seeding scripts
```

---

## ⚙️ Development Workspace Setup

### Prerequisites
*   **Node.js** (v18.0.0 or higher)
*   **Python** (v3.10 or higher)
*   **Git** (for version control)

### 1. Database Configuration
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Start the local database migration pipeline:
   ```bash
   cd database
   supabase init
   supabase start
   ```
3. Initialize the seed database tables (e.g., profiles, scans, food dictionary):
   ```bash
   supabase db reset
   ```

### 2. Backend FastAPI Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```
4. Create your local backend environment configuration:
   *   Copy key credentials from the root `.env.example` file to `backend/.env`.
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   Access API documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Next.js Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create your local frontend environment variables:
   *   Copy connection parameters from root `.env.example` to `frontend/.env.local`.
4. Spin up the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the website.

---

## 🧪 Testing Suite

To run backend pytest test cases checking endpoint routers:
```bash
cd backend
.venv\Scripts\activate # On Windows
pytest
```

---

## 🌿 Git Branch Strategy

To ensure clean teamwork and code integration:
*   `main`: Represents the production branch. Deployments are triggered from here.
*   `develop`: Integration branch. Merges from developer branches are tested here.
*   **Developer Workspaces**:
    *   `aakif/works-space`: Interactive UI features, authentication states, and custom hooks.
    *   `hannan/work-space`: FastAPI endpoints, ReportLab compilers, and external API requests.
    *   `saad/work-space`: CV pipelines, YOLO model loading, ONNX metrics, and OpenCV normalizations.
