# JobFlow — Recruitment Platform

JobFlow is a web-based recruitment platform designed to connect candidates with companies. It aims to simplify the recruitment process by allowing candidates to discover job opportunities and companies to publish and manage job offers.

## 🚀 Project Overview

JobFlow is developed as a team project using a modern web technology stack.

### Main Objectives

- Allow candidates to create and manage their profiles and upload real CVs.
- Enable companies to publish and manage job offers and review candidates.
- Allow candidates to apply for available positions and pass interactive technical assessments.
- Track application statuses throughout the recruitment process with visual steppers and Google Meet interview scheduling.
- Support recruitment tests and interview management.
- Provide administration features for managing users, moderating job offers, and tracking platform metrics.

## 🛠️ Technologies

| Component | Technology |
|---|---|
| Frontend | React (Vite, Pure JSX, CSS Modules) |
| Backend | Java 21, Spring Boot 4.0.8 (REST API, Spring Data JPA) |
| Database | MySQL 8.0 (`scroll_master`) |
| API Docs | SpringDoc OpenAPI 2.8.5 (Swagger UI) |
| Version control | Git and GitHub |

## 📁 Project Structure

```text
scroll_master/
├── frontend/       # React frontend application
├── backend/        # Spring Boot backend application
├── database/       # MySQL database schema and seed data
└── README.md       # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

Install the following tools:

- Git
- Node.js and npm
- Java Development Kit (JDK 21)
- MySQL Server 8.0
- MySQL Workbench

### 1. Clone the Repository

```bash
git clone https://github.com/batiha123/Scroll-master.git
cd Scroll-master
```

### 2. Set Up the Database

1. Open MySQL Workbench and connect to your MySQL server.
2. Run `database/scroll_master.sql` or `database/sql.sql`.
3. (Optional) Run `database/seed_data.sql` to populate sample users (Admin, Companies, Candidates), job offers, tests, and applications.

### 3. Run the Backend

Open a terminal in the backend directory:

```bash
cd backend
```

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

Configure your MySQL connection settings in `backend/src/main/resources/application.properties` before starting the application:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/scroll_master
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173/`.

## 📖 API Documentation (Swagger UI)

Once the backend is running, you can explore, test, and interact with all REST API endpoints directly from your browser:

- **Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) (or [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html))
- **OpenAPI Specification (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

From this interactive interface, you can inspect schemas (DTOs), request bodies, headers, and test live calls for candidates, companies, job offers, applications, interviews, and technical tests.

## 🗄️ Database Overview

The `scroll_master` database contains the following tables:

- `users` — shared account information and roles (`ADMIN`, `COMPANY`, `CANDIDATE`).
- `candidate_profiles` — candidate profile details (headline, bio, skills, education, experience, CV URL).
- `company_profiles` — company information (company name, description, address, website, logo).
- `admin_profiles` — administrator details and platform moderation responsibilities.
- `job_offers` — job advertisements published by companies.
- `applications` — candidate applications to job offers.
- `tests` — recruitment tests associated with job offers.
- `test_attempts` — candidate test attempts and scores.
- `interviews` — interview scheduling, Google Meet links, and status.
- `notifications` — notifications for users.
- `job_offer_reports` — reports submitted about job offers for admin moderation.

## 👥 Team Collaboration

This project is developed collaboratively using Git and GitHub.

- The frontend, backend, and database scripts are version-controlled in the repository.
- Database schema changes should be shared through updated SQL scripts.
- Never commit passwords, API keys, or other sensitive credentials.

## 📄 License

Academic / Open Source Project.
