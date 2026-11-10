# JobFlow — Plateforme Intelligente de Recrutement & IA

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.8-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **JobFlow** est une plateforme moderne de recrutement web qui connecte candidats et entreprises, enrichie par un système de modération d'offres, une gestion complète des entretiens et tests techniques, et un **moteur d'analyse de CV propulsé par l'IA Google Gemini**.

---

## 👥 Architecture & Répartition de l'Équipe (4 Personas)

Le projet intègre de manière unifiée le travail des 4 membres de l'équipe :

| Persona | Rôle & Responsabilité | Composants Backend | Composants Frontend |
| :--- | :--- | :--- | :--- |
| **Persona 1** | **Authentification, Utilisateurs & Profils Candidats** | `AuthController`, `UserController`, `CandidateProfileController`, Spring Security, JWT (HMAC-SHA512) | `AuthModal`, `CandidateProfileForm`, `AuthContext` |
| **Persona 2** | **Entreprises & Annonces d'Emploi** | `CompanyProfileController`, `JobOfferController`, `LogoStorageService`, Spécifications JPA | `CompaniesPage`, `JobsPage`, `JobOfferForm`, gestion logos |
| **Persona 3** | **Candidatures, Tests & Recrutement** | `ApplicationController`, `TestController`, `TestAttemptController`, `InterviewController` | `ApplicationsView`, `JobDetailModal`, `TestModal` |
| **Persona 4** | **Administration, Modération, Notifications & IA Gemini** | `AdminController`, `JobOfferReportController`, `NotificationController`, `AiAnalysisService` | Dashboard modération, stats live, logs d'audit, cloche notifications, IA Gemini CV Matcher |

---

## ⚡ Démarrage Rapide

### Prérequis
* **JDK 21**
* **Node.js** (v18+) & **npm**
* **MySQL 8.0**

### 1. Base de données
1. Créez la base de données `scroll_master` dans MySQL.
2. Exécutez le script d'initialisation et de données de test :
   ```sql
   source database/seed_data.sql;
   ```

### 2. Démarrer le Backend (Spring Boot)
Configurez vos identifiants dans `backend/src/main/resources/application.properties` (voir `application.properties.example`), puis lancez :
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
* API REST : `http://localhost:8080/api`
* Documentation Swagger / OpenAPI : **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

### 3. Démarrer le Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
* Application Web : **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Comptes de Démonstration (Prêts à l'emploi)

Tous les comptes de test partagent le mot de passe universel : **`Password123!`**

| Rôle | Email | Mot de passe | Ce que vous pouvez tester |
| :--- | :--- | :--- | :--- |
| **👑 Administrateur** | `admin@jobflow.com` | `Password123!` | Métriques de la plateforme en temps réel, modération des annonces soumises et signalements, journal d'audit de sécurité, **Analyseur de CV par Google Gemini**. |
| **🏢 Entreprise / Recruteur** | `sophie.mercier@novatech.io` | `Password123!` | Création/édition d'annonces, téléversement de logo, consultation des candidatures reçues, programmation d'entretiens vidéo Google Meet. |
| **👤 Candidat** | `yasmine.benali@gmail.com` | `Password123!` | Recherche d'offres avec filtres, soumission de candidature avec CV et motivation, passage des tests techniques, suivi du statut en direct. |

---

## 🌟 Fonctionnalités Clés

### 1. Recherche & Filtrage Avancé des Offres
* Filtrage combiné par titre, mots-clés, localisation et type de contrat (CDI, CDD, Stage, Freelance, Temps partiel).
* Pagination dynamique gérée côté serveur via Spring Data JPA Specifications.

### 2. Workflow de Recrutement Complet
* **Cycle de vie de l'annonce** : `DRAFT` ➜ `PENDING` ➜ `PUBLISHED` (après validation admin) ➜ `CLOSED`.
* **Cycle de candidature** : `SUBMITTED` ➜ `UNDER_REVIEW` ➜ `SHORTLISTED` (entretien fixé) ➜ `ACCEPTED` / `REJECTED`.
* Téléversement et stockage sécurisé des CV (PDF/DOC) et logos d'entreprise.

### 3. IA Google Gemini 1.5 Flash intégrée
* Analyse sémantique en direct comparant les compétences d'un candidat aux exigences d'une offre.
* Calcul d'un score d'adéquation en pourcentage, classification (`STRONG`, `MODERATE`, `WEAK`), compétences validées, compétences manquantes et synthèse rédigée par l'IA.

### 4. Sécurité & Audit
* Authentification JWT stateless (jetons signés HMAC-512 avec expiration).
* Mots de passe chiffrés par hachage BCrypt.
* Contrôle d'accès basé sur les rôles (`hasAnyRole('ADMIN', 'COMPANY', 'CANDIDATE')`).
* Traçabilité intégrale de toutes les actions d'administration dans la table `admin_audit_logs`.

---

## 🗄️ Schéma de la Base de Données

La base de données `scroll_master` comprend 12 tables relationnelles synchronisées :
* `users` — Comptes utilisateurs, rôles et statuts d'activation.
* `candidate_profiles` — Détails de profil, compétences, formations et expériences.
* `company_profiles` — Raison sociale, site web, adresse et URL du logo.
* `admin_profiles` — Profils des gestionnaires de la plateforme.
* `job_offers` — Annonces d'emploi, salaires, contrats et statuts de modération.
* `applications` — Dossiers de candidature, messages de motivation et liens CV.
* `tests` — Évaluations techniques rattachées aux offres.
* `test_attempts` — Résultats et scores obtenus par les candidats.
* `interviews` — Entretiens planifiés avec liens visioconférence (Google Meet).
* `notifications` — Alertes temps réel pour les utilisateurs.
* `job_offer_reports` — Signalements d'annonces inappropriées soumis par les utilisateurs.
* `admin_audit_logs` — Journalisation des interventions administrateur.

---

## 📄 Licence

Projet développé dans le cadre d'un projet académique d'intégration Web Fullstack (2026).
