# JobFlow — Recruitment Platform

JobFlow is a web-based recruitment platform designed to connect candidates with companies. It aims to simplify the recruitment process by allowing candidates to discover job opportunities and companies to publish and manage job offers.

## 🚀 Project Overview

JobFlow is developed as a team project using a modern web technology stack.

### Main Objectives

- Allow candidates to create and manage their profiles.
- Enable companies to publish and manage job offers.
- Allow candidates to apply for available positions.
- Track application statuses throughout the recruitment process.
- Support recruitment tests and interview management.
- Provide notifications and job-offer reporting.
- Provide administration features for managing users and moderating job offers.

## 🛠️ Technologies

| Component | Technology |
|---|---|
| Frontend | React |
| Frontend tooling | Vite |
| Backend | Java, Spring Boot |
| Database | MySQL |
| Database management | MySQL Workbench |
| Version control | Git and GitHub |

## 📁 Project Structure

```text
scroll_master/
├── frontend/       # React frontend application
├── backend/        # Spring Boot backend application
├── database/       # MySQL database scripts
└── README.md       # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

Install the following tools:

- Git
- Node.js and npm
- Java Development Kit (JDK), compatible with the backend configuration
- MySQL Server
- MySQL Workbench

### 1. Clone the Repository

```bash
git clone https://github.com/batiha123/Scroll-master.git
cd Scroll-master
```

### 2. Set Up the Database

1. Open MySQL Workbench and connect to your MySQL server.
2. Open `database/scroll_master.sql`.
3. Execute the SQL script.
4. Confirm that the `scroll_master` database and its tables have been created.

**Note:** The database script recreates the tables when executed. Do not rerun it on a database containing data you want to preserve.

### 3. Run the Backend

Open a terminal in the backend directory:

```bash
cd backend
```

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

Configure your MySQL connection settings in the backend configuration before starting the application. Keep passwords and other secrets out of Git.

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local URL where you can open the frontend in your browser.

## 🗄️ Database Overview

The `scroll_master` database contains the following tables:

- `users` — shared account information and roles.
- `candidate_profiles` — candidate profile details.
- `company_profiles` — company information.
- `job_offers` — job advertisements.
- `applications` — candidate applications to job offers.
- `tests` — recruitment tests associated with job offers.
- `test_attempts` — candidate test attempts and scores.
- `interviews` — interview scheduling and status.
- `notifications` — notifications for users.
- `job_offer_reports` — reports submitted about job offers.

## 👥 Team Collaboration

This project is developed collaboratively using Git and GitHub.

- The frontend, backend, and database scripts are version-controlled in the repository.
- Team members can clone the repository and work on their own local environments.
- Database schema changes should be shared through updated SQL scripts or database migrations.
- Never commit passwords, API keys, or other sensitive credentials.

## 📌 Project Status

The project is under development. Features and implementation details may evolve as development progresses.

## 📄 License

No license has been specified yet.
