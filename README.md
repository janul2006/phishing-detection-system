# Phishing Detection System

A web-based phishing detection system built with:

- **Backend Web/API:** Laravel (PHP) + Blade templates  
- **AI/ML Service:** FastAPI (Python) microservice (URL prediction endpoint)

> This repository is organized as a multi-service project. The Laravel app provides the main application UI/API, and the FastAPI service exposes a `/predict` endpoint that can be called to classify URLs.

---

## Repository Structure

- `backend/api/` — Laravel application (PHP + Blade)
- `ai_service/` — FastAPI service for URL prediction
- `frontend/` — React (Vite) frontend
- `docs/` — Project documentation (if/when added)

---

## Tech Stack (Languages & Libraries)

### Languages

GitHub detected the following languages in this repository:

- Blade
- PHP
- Python
- JavaScript
- CSS
- HTML

### Backend (Laravel) — `backend/api/`

**Language:** PHP (with Blade templates)

**Key libraries / tools (Composer + NPM):**

- Laravel Framework
- Predis (Redis client)
- Vite
- Tailwind CSS
- Axios
- Laravel Vite Plugin
- Concurrently (dev script helper)

### AI/ML Service (FastAPI) — `ai_service/`

**Language:** Python

**Libraries used in code:**

- FastAPI
- pandas
- joblib

> Note: A dedicated Python dependency file (like `requirements.txt` / `pyproject.toml`) is not currently in `ai_service/`. Consider adding one so dependencies are reproducible.

### Frontend (React + Vite) — `frontend/`

**Languages:** JavaScript

**Key libraries / tools (package.json):**

- React
- React DOM
- Vite
- Axios
- ESLint
- @vitejs/plugin-react

---

## Features (current)

- FastAPI service health check: `GET /` returns `"ML Service Running"`
- URL prediction endpoint: `POST /predict` accepts a URL and returns a result + confidence

> Note: The current `ai_service` implementation returns a static response (e.g., `"safe"` with `90` confidence). You can later replace this with a real ML model.

---

## Getting Started

### Prerequisites

- PHP (for Laravel)
- Composer
- Node.js + npm (for Laravel frontend tooling if used)
- Python 3.10+ (recommended)
- pip

---

## 1) Run the AI Service (FastAPI)

### Install dependencies

```bash
cd ai_service
pip install fastapi uvicorn
```

### Start the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test endpoints

Health:
```bash
curl http://127.0.0.1:8000/
```

Predict:
```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## 2) Run the Laravel Backend (backend/api)

### Install PHP dependencies

```bash
cd backend/api
composer install
```

### Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials and any service URLs you need (for example, the FastAPI base URL if your Laravel app calls it).

### Run migrations (optional, if configured)

```bash
php artisan migrate
```

### Start the Laravel dev server

```bash
php artisan serve
```

Laravel will usually start at:
- `http://127.0.0.1:8000` (unless that port is taken)

> If both Laravel and FastAPI default to port 8000, run one of them on a different port (e.g., FastAPI on 8001).

---

## Configuration Notes

### AI Service URL
If the Laravel app needs to call the AI service, a common approach is to set something like:

- `AI_SERVICE_URL=http://127.0.0.1:8001`

…in Laravel’s `.env`, then use Laravel’s HTTP client to call `POST {AI_SERVICE_URL}/predict`.

---

## API Summary (FastAPI)

- `GET /`  
  Returns service status.

- `POST /predict`  
  **Body**  
  ```json  
  { "url": "https://..." }
  ```  
  **Response (example)**  
  ```json  
  { "result": "safe", "confidence": 90 }
  ```

---

## Development Tips

- Keep Laravel and FastAPI running in separate terminals.
- Consider adding Docker Compose later to run services together easily.
- Add tests for:
  - URL validation
  - AI service connectivity and error handling
  - Model performance (once implemented)

---

## License

Add a license file if you plan to open-source this project (e.g., MIT, Apache-2.0).