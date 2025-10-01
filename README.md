

# Job Management Web App – **samBoat**

## 📌 Overview

**samBoat** is a simple yet powerful job management system designed for anyone frustrated with juggling job applications in spreadsheets. Track, organize, and stay on top of your career — all in one place.

**Job Management Web Application** allows users to:

* **Manually add job details** such as job title, company, location, skills, and experience (future update will support auto-parsing from job descriptions or URLs).
* Track job application status (applied, interview scheduled, offer received, etc.).
* Upload and store resumes and cover letters for each job.
* Log interview experiences for future reference.

---

The backend is built using **Django REST Framework (DRF)** and is API-driven, allowing integration with any frontend (React, Vue, Angular, etc.).

---

## 🚀 Features

- **User Authentication**

  - JWT-based authentication
  - User registration, login, and logout
  - Integrated **frontend auth pages** (login, register, forgot/reset password)
  - UI/UX improvements with **form validation, password toggle, toast notifications**

- **Job Posting Management**

  - Add, update, and delete job entries
  - Manually fill in job details (automation planned)

- **Resume & Cover Letter Upload**

  - Upload and store files per job
  - **AWS S3 integration** for scalable file storage

- **Application Tracking**

  - Track application progress with status updates

- **Interview Experience Logging**

  - Store interview notes for future use

- **Background Task Handling**

  - **Celery integration** for async file uploads (prevents broken pipe errors)

- **Role-based Access Control**

  - Jobs are linked to the logged-in user

---

## 🛠 Tech Stack

- **Backend:** Python, Django, Django REST Framework
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS; future upgrade to React planned)
- **Database:** SQLite (development), PostgreSQL (production-ready)
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** AWS S3 with Django's `FileField`
- **Background Processing:** Celery + Redis
- **UX Enhancements:** Custom toast notifications, validation utilities
- **Health Monitoring:** Custom health check endpoints, Docker healthchecks

---
## 📂 Project Structure (Backend + Frontend)
```
sameboat/
│── sameboat/              # Django project
│   ├── __init__.py
│   ├── celery.py
│   ├── settings.py
│   ├── urls.py
│── users/api/
│   ├── auth_views.py
│   ├── serializers.py
│   ├── viewsets.py
│   ├── urls.py
│── users/tasks.py
│── media/
│
frontend/
│── public/                # Static + HTML + JS
│   ├── login.html
│   ├── register.html
│   ├── forgot_password.html
│   ├── reset_password.html
│   ├── add_job.html
│   ├── job_sheet.html
│   ├── index.html
│   ├── css/
│   │   ├── styles.css
│   ├── components/        # Toast, flash
│   ├── js/
│   │   ├── main.js
│   │   ├── api/
│   │   ├── pages/
│   │   ├── utils/
│
.venv/
README.md
requirements.txt
```

---

## 🔑 Recent Milestones

✅ **Auth Integration Complete**

- Backend JWT auth APIs connected with frontend auth pages (login, register, forgot/reset password).
- Functional end-to-end authentication flow ready; UX improvements added (toast, validation, password toggle).

✅ **File Storage with AWS S3**

- Resume and cover letter uploads now stored securely on S3.

✅ **Celery for Async Tasks**

- Offloaded file upload tasks to Celery to prevent blocking and fix broken pipe errors.

---

## 🔄 API Flow (GenericAPIView Example)

1. **User sends request** → API receives it via DRF view.
2. **View passes data** → Serializer validates & processes it.
3. **Serializer saves data** → Database updates accordingly.
4. **Custom Response** → Message + data returned to the client.
5. **Background Tasks (if needed)** → Celery handles async operations like S3 uploads.

---

## 📌 Installation & Setup (Step-by-Step Guide)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/mohitk21103/sameBoat.git
cd sameBoat
```

### 2️⃣ Create virtual environment & install dependencies

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3️⃣ Set up environment variables

Create a `.env.local` file in the backend directory:

```bash
# Create .env.local file
cd backend
echo SECRET_KEY=your_secret_key > .env.local
echo DEBUG=True >> .env.local
echo DATABASE_URL=sqlite:///db.sqlite3 >> .env.local
echo AWS_ACCESS_KEY_ID=your_aws_key >> .env.local
echo AWS_SECRET_ACCESS_KEY=your_aws_secret >> .env.local
echo AWS_STORAGE_BUCKET_NAME=your_bucket_name >> .env.local
echo REDIS_URL=redis://localhost:6379/0 >> .env.local
cd ..
```

### 4️⃣ Set up the database

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
# Follow the prompts to create an admin user
cd ..
```

### 5️⃣ Install frontend dependencies

```bash
cd frontend
npm install
npm run build:css
cd ..
```

### 6️⃣ Start the backend server

```bash
cd backend
python manage.py runserver
```

### 7️⃣ Start Celery worker (in a new terminal)

```bash
cd backend
# For Windows:
celery -A sameboat worker -l info --pool=solo
# For Linux/macOS:
# celery -A sameboat worker -l info
```

### 8️⃣ Access the application

- Backend API: http://127.0.0.1:8000/api/v1/
- Admin interface: http://127.0.0.1:8000/admin/
- Frontend: Open the HTML files in the `frontend/public/` directory in your browser

### 🔍 Health Checks

The application includes comprehensive health check endpoints:

| Endpoint        | Description                                                        | Usage                                     |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `/health/`      | Main health check - verifies database, Redis, and system resources | `curl http://127.0.0.1:8000/health/`      |
| `/health/ready` | Readiness probe - checks if the application is ready for traffic   | `curl http://127.0.0.1:8000/health/ready` |
| `/health/alive` | Liveness probe - checks if the application is running              | `curl http://127.0.0.1:8000/health/alive` |

Example health check response:

```json
{
  "status": "healthy",
  "service": "sameboat-backend",
  "timestamp": 1695394521.3456,
  "checks": {
    "database": "ok",
    "redis": "ok"
  },
  "system": {
    "memory": {
      "total": 8589934592,
      "available": 4294967296,
      "percent": 50.0
    },
    "cpu": {
      "percent": 12.5,
      "count": 4
    },
    "disk": {
      "total": 107374182400,
      "free": 53687091200,
      "percent": 50.0
    }
  },
  "response_time_ms": 125.45
}
```
---

## 🔌 API Endpoints

The API follows RESTful conventions and is versioned. All endpoints are prefixed with `/api/v1/`.

### 🔐 Authentication Endpoints

| Method | Endpoint           | Description                                   | Example Request |
| ------ | ------------------ | --------------------------------------------- | --------------- |
| POST   | `/register/`  | Register a new user                           | `{"username": "user1", "email": "user@example.com", "password": "securepass", "first_name": "John", "last_name": "Doe"}` |
| POST   | `/login/`     | Login and receive JWT tokens                  | `{"email": "user@example.com", "password": "securepass"}` |
| POST   | `/refresh/`   | Refresh access token using refresh token      | `{"refresh": "your-refresh-token"}` |
| POST   | `/verify/`    | Verify token validity                         | `{"token": "your-access-token"}` |
| POST   | `/logout/`    | Logout (blacklist token)                      | `{"refresh": "your-refresh-token"}` |
| GET    | `/user/`      | Get current user profile                      | Requires Authorization header |
| PUT    | `/user/`      | Update user profile                           | `{"first_name": "Updated", "last_name": "Name"}` |
| PUT    | `/password/`  | Change password                               | `{"old_password": "current", "new_password": "updated"}` |
| POST   | `/password/reset/` | Request password reset email             | `{"email": "user@example.com"}` |
| POST   | `/password/reset/confirm/` | Confirm password reset with token | `{"token": "reset-token", "password": "new-password"}` |

### 📝 Jobs Management

| Method | Endpoint                  | Description                                | Required Role |
| ------ | ------------------------- | ------------------------------------------ | ------------ |
| GET    | `/jobs/`                  | List all jobs (with filtering)             | Any |
| POST   | `/jobs/`                  | Create a new job                           | Employer |
| GET    | `/jobs/{id}/`             | Retrieve job details                       | Any |
| PUT    | `/jobs/{id}/`             | Update job                                 | Job Owner |
| DELETE | `/jobs/{id}/`             | Delete job                                 | Job Owner |
| GET    | `/jobs/{id}/applications/` | List applications for a job               | Job Owner |
| POST   | `/jobs/{id}/apply/`       | Apply to a job                             | Job Seeker |

## 📋 Future Enhancements

- Implement email notifications for application status changes
- Add support for multiple file uploads per application
- Create a recommendation engine for job matches
- Implement social login (Google, LinkedIn)
- Add support for job post templates
- Create a mobile app version

---

## 📌 To-Do (Next Steps)

-  Automate job entry by pasting a job URL (time-saving feature)
-  Enhance frontend UX/UI for auth pages and job pages
-  Build complete React-based frontend integration
-  Add analytics dashboard for applications
-  Enable email notifications (via Celery)

---
