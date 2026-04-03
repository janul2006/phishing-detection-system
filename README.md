# SentryURL – AI-Powered Phishing Detection System

SentryURL is a full-stack, cloud-deployed phishing detection system that analyzes URLs in real time using a machine learning model. Users submit a URL through the React frontend, which calls a Laravel REST API. The API forwards the request to a FastAPI microservice that runs the ML classifier, returning a prediction label and confidence score. Results are stored in a MySQL database and are accessible through a paginated scan history endpoint.

- **Live Website:** https://www.sentryurl.dev/
- **API Endpoint:** https://api.sentryurl.dev/

---

## Features

- Real-time phishing URL detection via a machine learning classifier
- Confidence score returned with every prediction
- Paginated scan history stored in MySQL
- Microservice architecture: Laravel backend communicates with FastAPI over a local interface
- Secure HTTPS deployment with Let's Encrypt
- Hosted on DigitalOcean VPS with Nginx as the reverse proxy

---

## System Architecture

```
User (Browser)
      |
      v
React Frontend (Vite)
      |
      v
Laravel Backend API (PHP-FPM / Nginx)
      |
      v
FastAPI ML Service (Python / Uvicorn)   <-->   Machine Learning Model (joblib)
      |
      v
MySQL Database
```

Internal service communication (Laravel to FastAPI) is handled over `127.0.0.1` on the same VPS.

---

## Project Structure

```
phishing-detection-system/
├── backend/api/       # Laravel application – REST API and database layer
├── ai_service/        # FastAPI microservice – ML model and prediction endpoint
├── frontend/          # React (Vite) single-page application
└── docs/              # Project documentation (optional)
```

---

## Tech Stack

### Frontend
- React.js
- Vite
- Axios

### Backend
- Laravel (PHP)
- PHP-FPM
- REST API design

### AI / ML
- FastAPI (Python)
- Uvicorn
- pandas
- joblib

### Infrastructure
- DigitalOcean VPS
- Nginx (reverse proxy)
- MySQL
- Let's Encrypt (SSL/TLS)
- Namecheap (domain)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/janul2006/phishing-detection-system.git
cd phishing-detection-system
```

---

### 2. Backend Setup (Laravel)

```bash
cd backend/api
composer install
cp .env.example .env
php artisan key:generate
```

Update `.env` with your local database credentials and the FastAPI service URL:

```dotenv
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

FASTAPI_URL=http://127.0.0.1:8001
```

Run database migrations:

```bash
php artisan migrate
```

Start the development server:

```bash
php artisan serve
```

---

### 3. AI Service Setup (FastAPI)

```bash
cd ai_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirement.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

### Laravel Backend

#### POST /api/check

Submit a URL for phishing analysis.

**Request body:**
```json
{
  "url": "http://example.com"
}
```

**Response:**
```json
{
  "result": "safe",
  "confidence": 90
}
```

#### GET /api/history

Returns a paginated list of previously scanned URLs and their results.

---

### FastAPI ML Service

#### POST /predict

Runs the URL through the machine learning classifier.

**Request body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "result": "safe",
  "confidence": 90
}
```

---

## Production Deployment

The project is deployed on a DigitalOcean VPS with the following configuration:

| Component       | Technology                        |
|-----------------|-----------------------------------|
| Cloud provider  | DigitalOcean VPS                  |
| Web server      | Nginx (reverse proxy)             |
| PHP runtime     | Laravel via PHP-FPM               |
| ML service      | FastAPI managed by systemd        |
| Database        | MySQL                             |
| Domain          | Namecheap                         |
| SSL/TLS         | Let's Encrypt                     |

**Key deployment notes:**

- The FastAPI service runs as a systemd background service.
- Laravel performance is optimized using:
  ```bash
  php artisan config:cache
  php artisan route:cache
  ```
- Internal communication between Laravel and FastAPI uses `127.0.0.1` (no external network exposure). Ensure the server firewall (e.g., UFW) is configured to block external access to port 8001 so the FastAPI service remains accessible only from the local machine.
- Caching uses the file driver for stability.

---

## Development Tips

- Run Laravel and FastAPI in separate terminal sessions.
- Use Postman or a similar tool for manual API testing.
- View Laravel application logs:
  ```bash
  tail -f backend/api/storage/logs/laravel.log
  ```

---

## Roadmap

- JWT-based authentication
- Analytics dashboard for scan statistics
- Redis caching layer
- Docker Compose setup for local multi-service orchestration
- Public API with rate limiting and monetization

---

## Author

**Janul Induwara**

- GitHub: https://github.com/janul2006
- Project: https://www.sentryurl.dev/

---

## License

No license file is currently present in this repository. License terms are to be determined.
