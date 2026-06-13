# EcoTrack - Carbon Footprint Tracker (Web Prototype)

EcoTrack is an application designed to help users track, understand, and reduce their carbon footprint. The repository contains a Python FastAPI backend and a React + Vite + Tailwind CSS web application frontend.

---

## Project Architecture & Structure

```text
EcoTrack/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # API endpoints, In-Memory DB & Mock Carbon Engine
│   ├── requirements.txt      # Python dependencies (FastAPI, Uvicorn, Pydantic)
│   ├── test_backend.py       # Automated endpoint verification suite
│   ├── test_gcp.py           # GCP Live verification test script
│   └── README.md             # Backend-specific instructions
├── frontend-web/             # React + Vite + Tailwind CSS Web Frontend
│   ├── package.json          # Node package dependency definitions
│   ├── tailwind.config.js    # Tailwind CSS classes content configuration
│   ├── postcss.config.js     # PostCSS loader settings
│   ├── index.html            # Main HTML entry & Google Fonts import
│   └── src/
│       ├── main.jsx          # React DOM render mounting point
│       ├── App.jsx           # App wrapper, onboarding flow & state manager
│       ├── index.css         # Global styles & Tailwind base directives
│       ├── api.js            # Axios REST API client mapping backend routes
│       └── components/
│           ├── Dashboard.jsx   # Circular tracking gauge & logged entries list
│           └── LogActivity.jsx # Dropdown category logger form
└── README.md                 # Project root documentation (this file)
```

---

## 🐍 Backend Setup & Run Guide

The backend calculates carbon footprint emissions via a mock engine and aggregates total footprints for monthly dashboards.

### Prerequisites
- Python 3.10 or higher.

### Installation & Run
1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the local API server:
   ```bash
   python -m uvicorn main:app --reload
   ```
The backend API will run locally at `http://127.0.0.1:8000`. You can inspect the docs at `http://127.0.0.1:8000/docs`.

---

## 💻 Web Frontend Setup & Run Guide

The frontend is a React SPA scaffolded with Vite and styled with Tailwind CSS.

### Tech Stack
- **Library**: React 18+ (functional components & hooks).
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (custom eco-dark color palette).
- **Networking**: Axios.

### Run Instructions
1. Navigate to the `frontend-web/` directory:
   ```bash
   cd frontend-web
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
The web app will start locally, typically at `http://localhost:5173/`. Open it in your web browser.

---

## ⚙️ Carbon Engine & Emission Factors

The mock engine calculates emissions in kilograms of $CO_2$ ($kg\ CO_2$) using the following factors:
- **Transport**: `0.4` $kg\ CO_2$ per mile driven.
- **Diet**: `1.2` $kg\ CO_2$ per meat-heavy meal serving.
- **Energy**: `0.8` $kg\ CO_2$ per kWh consumed.
- **Fallback**: `0.1` $kg\ CO_2$ per unit.
