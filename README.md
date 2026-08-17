# 🎓 NEC AI Voice Assistant

An AI-powered voice assistant for **Narasaraopeta Engineering College (NEC)**, built to help prospective students and parents get instant answers about admissions, courses, fees, and more — via a natural, conversational interface.

---

## 🏗️ Architecture

```
NEC_AI/
├── nec-frontend/          # Angular 18 — Chat UI + Voice Interface
├── nec-backend-spring/    # Spring Boot 3 — Auth, FAQ CRUD, Sessions
└── nec-backend-ai/        # FastAPI (Python) — AI Chat (FAQ Matching + Gemini)
```

The system uses a **three-tier microservice architecture**:

```
[Angular Frontend]
       │
       ├──► [Spring Boot :8081]  →  Auth (JWT), FAQ CRUD, Session History
       │
       └──► [FastAPI :8000]      →  Chat AI (Local FAQ Matcher + Gemini 2.0 Flash)
                                          │
                                   [PostgreSQL DB]
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18, TypeScript |
| Auth & FAQ Backend | Spring Boot 3.3, Java 17, JWT (JJWT), Flyway, JPA |
| AI Chat Backend | FastAPI, Python, Google Gemini 2.0 Flash |
| Database | PostgreSQL (shared between Spring & FastAPI) |
| Containerization | Docker (multi-stage build) |

---

## ✨ Features

- 🤖 **AI Chat** — Local FAQ matching first, falls back to **Google Gemini 2.0 Flash** for unknown questions
- 🎙️ **Voice Input** — Web Speech API for hands-free interaction
- 🔐 **JWT Authentication** — Secure admin login via Spring Boot
- 📋 **FAQ Management** — Admin CRUD panel to add/edit/delete FAQ entries
- 💬 **Session History** — Chat history persisted per session
- 🛡️ **NAAC A+ Context** — Gemini is prompted with NEC-specific knowledge for accurate, natural responses

---

## ⚙️ Local Setup

### Prerequisites

- **Java 17+**, **Maven 3.9+**
- **Python 3.11+**
- **Node.js 18+**, **Angular CLI 18**
- **PostgreSQL** (create database `nec_ai_db`)

---

### 1️⃣ Database

```sql
CREATE DATABASE nec_ai_db;
```

> Spring Boot will auto-run Flyway migrations on startup.

---

### 2️⃣ Spring Boot Backend (Auth + FAQ + Sessions)

```bash
cd nec-backend-spring
```

Set your `src/main/resources/application.properties` or environment variables:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nec_ai_db
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=your_jwt_secret_here
```

Run:

```bash
mvn spring-boot:run
# Runs on http://localhost:8081
```

---

### 3️⃣ FastAPI AI Backend (Chat + Gemini)

```bash
cd nec-backend-ai
cp .env.example .env
# Fill in your GEMINI_API_KEY in .env
```

`.env` contents:

```env
DB_URL=postgresql://postgres:postgres@localhost:5432/nec_ai_db
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:4200
```

Install & run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

> Get your Gemini API key from [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

### 4️⃣ Angular Frontend

```bash
cd nec-frontend
npm install
ng serve
# Runs on http://localhost:4200
```

The frontend connects to:
- Spring Boot → `http://localhost:8081`
- FastAPI → `http://localhost:8000`

(Configured in `src/environments/environment.ts`)

---

## 🐳 Docker (Spring Boot)

```bash
cd nec-backend-spring
docker build -t nec-backend-spring .
docker run -p 8081:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/nec_ai_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  nec-backend-spring
```

---

## 📁 Project Structure

```
nec-backend-ai/
├── main.py               # FastAPI app entry point
├── routers/
│   ├── chat.py           # /api/chat endpoint
│   └── health.py         # /api/health endpoint
├── services/
│   ├── faq_matcher.py    # Local FAQ fuzzy matching
│   └── gemini_service.py # Google Gemini 2.0 Flash integration
├── models.py             # SQLAlchemy models
├── database.py           # DB connection
└── requirements.txt

nec-backend-spring/
└── src/main/java/com/nec/
    ├── auth/             # JWT login/register
    ├── faq/              # FAQ CRUD API
    ├── session/          # Chat session management
    ├── user/             # User entity & repo
    ├── config/           # Security config, CORS
    └── init/             # Data initializer

nec-frontend/
└── src/
    ├── app/              # Angular components & services
    └── environments/     # API URL config
```

---

## 🔑 API Overview

### FastAPI (`:8000`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message, get AI response |
| `GET` | `/api/health` | Health check |

### Spring Boot (`:8081`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, receive JWT |
| `GET` | `/api/faq` | List all FAQ entries |
| `POST` | `/api/faq` | Create FAQ entry (admin) |
| `PUT` | `/api/faq/{id}` | Update FAQ entry (admin) |
| `DELETE` | `/api/faq/{id}` | Delete FAQ entry (admin) |
| `GET` | `/api/sessions` | Get chat sessions |

---

## 🌐 About NEC

**Narasaraopeta Engineering College**, Andhra Pradesh
- ✅ AICTE Approved
- ✅ Permanently affiliated with JNTUK Kakinada
- ✅ Autonomous & NAAC Accredited (**A+ Grade**)
- 📞 Admissions: 915-468-6203 / 810-630-6313
- 📧 admissions@nrtec.in
- 🌐 [admissions.nrtec.in](https://admissions.nrtec.in)

---

## 📄 License

This project is proprietary software developed for Narasaraopeta Engineering College.
