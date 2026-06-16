# AI Customer Greeting Personalizer
## Manivtha Tours & Travels - CRM Automation Platform

---

### Project Overview
The **AI Customer Greeting Personalizer** is an enterprise-grade SaaS web portal built for **Manivtha Tours & Travels** to automate and personalize customer greetings before travel. It leverages Google Gemini AI models to translate and customize greetings in multiple languages (English, Telugu, Hindi, Tamil) matching specific travel contexts, client histories, and loyalty levels.

---

### Folder Directory Map
* **`database/`**: PostgreSQL SQL table schemas, constraint checks, optimized index scripts, and sample seeds.
* **`backend/`**: Node.js + Express API server, rate limits, XSS cleaners, routes controllers, and Gemini SDK adapters.
* **`frontend/`**: Vite + React client, styling sheets, state contexts, dashboards, and generator workspace panel.
* **`docs/`**: Academic and analytical artifacts compiled for university submission:
  - [Business Analysis](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/business_analysis.md)
  - [System Design](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/system_design.md)
  - [Testing Matrix](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/testing.md)
  - [Standards and open Source Guides](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/standards.md)
  - [Internship Deliverables logbook](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/internship_deliverables.md)
  - [Viva Q&A Preparation](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/viva_preparation.md)
  - [Final Academic Report](file:///c:/Users/Shanmukh/OneDrive/Desktop/TERM_4/docs/final_project_report.md)

---

### Installation & Startup Guide

#### Prerequisites
* Node.js (v18.x or later)
* npm (v9.x or later)

#### 1. Backend Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   PORT=5000
   JWT_SECRET=manivtha_travels_secret_jwt_key_2026
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```
   *(Note: If no API key is specified, the server runs a simulated offline AI greeting compiler automatically)*
4. Run the Express server in dev mode:
   ```bash
   npm run dev
   ```

#### 2. Frontend Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` to access the application.

---

### Test Accounts
* **Staff Access**: Username: `agent` | Password: `password123`
* **Admin Access**: Username: `admin` | Password: `password123`

---

### Core API Specification

| Endpoint | Method | Security | Payload / Query | Description |
| --- | --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Public | `{username, password}` | Retrieves JWT token |
| `/api/generate` | `POST` | JWT Required | Customer details payload | Creates AI greeting |
| `/api/history` | `GET` | JWT Required | `?search=<string>` | Fetches greeting logs list |
| `/api/feedback` | `POST` | JWT Required | `{greeting_id, rating, comments}`| Saves feedback ratings |
| `/api/analytics` | `GET` | JWT Required | None | Fetches metrics summaries |
| `/api/templates` | `GET` | JWT Required | None | Lists greeting templates |
| `/api/templates` | `POST` | JWT + Admin | New template payload | Creates template |
