# 🚀 JobFlow (Scroll_master) — Guide de Répartition Backend (4 Développeurs)

Ce document détaille la répartition du travail pour l'équipe de 4 développeurs afin de développer le backend Spring Boot sans conflits Git.

---

## 🏗️ Architecture Commune

Chaque développeur implémente son module selon l'architecture en 4 couches :
```text
entity/ (Déjà créé) ➔ repository/ ➔ service/ ➔ controller/
```

La configuration globale CORS est activée dans `com.team.backend.config.WebConfig`. Tout endpoint sous `/api/**` est accessible depuis le frontend React (`http://localhost:5173`).

---

## 👥 Répartition des 4 Rôles

### 👤 DÉVELOPPEUR 1 : Authentification & Utilisateurs (Fondation & Sécurité)
* **Entités associées :** `User`, `AdminProfile`, `AdminAuditLog`
* **Fichiers à créer :**
  * `repository/UserRepository.java`
  * `service/UserService.java`
  * `controller/AuthController.java`
* **Endpoints à fournir :**
  * `POST /api/auth/register` — Inscription (Candidat ou Entreprise)
  * `POST /api/auth/login` — Connexion et vérification mot de passe
  * `GET /api/users/me` — Récupérer l'utilisateur connecté
  * `GET /api/admin/users` — Liste des utilisateurs pour l'administration

---

### 👤 DÉVELOPPEUR 2 : Entreprises & Offres d'Emploi (Côté Recruteur & Catalogue)
* **Entités associées :** `CompanyProfile`, `JobOffer`
* **Fichiers à créer :**
  * `repository/CompanyProfileRepository.java`
  * `repository/JobOfferRepository.java`
  * `service/JobOfferService.java`
  * `service/CompanyProfileService.java`
  * `controller/JobOfferController.java`
  * `controller/CompanyController.java`
* **Endpoints à fournir :**
  * `GET /api/jobs` — Liste des offres avec filtres (keyword, location, contractType)
  * `GET /api/jobs/{id}` — Détail d'une offre
  * `POST /api/jobs` — Publication d'une nouvelle offre
  * `PUT /api/jobs/{id}` — Modification d'une offre
  * `DELETE /api/jobs/{id}` — Clôture / suppression d'une offre
  * `GET /api/companies` & `PUT /api/companies/{id}` — Profil entreprise

---

### 👤 DÉVELOPPEUR 3 : Candidats & Candidatures (Côté Candidat & Postulation)
* **Entités associées :** `CandidateProfile`, `Application`
* **Fichiers à créer :**
  * `repository/CandidateProfileRepository.java`
  * `repository/ApplicationRepository.java`
  * `service/CandidateProfileService.java`
  * `service/ApplicationService.java`
  * `controller/CandidateController.java`
  * `controller/ApplicationController.java`
* **Endpoints à fournir :**
  * `GET /api/candidates/{id}` & `PUT /api/candidates/{id}` — Profil candidat (bio, compétences, diplômes)
  * `POST /api/applications` — Postuler à une offre (CV, motivation)
  * `GET /api/applications/candidate/{id}` — Liste des candidatures envoyées
  * `GET /api/applications/job/{jobId}` — Candidats ayant postulé pour un recruteur
  * `PATCH /api/applications/{id}/status` — Mise à jour statut (`UNDER_REVIEW`, `ACCEPTED`, `REJECTED`)

---

### 👤 DÉVELOPPEUR 4 : Entretiens Visio, Tests Techniques & Notifications
* **Entités associées :** `Interview`, `Test`, `TestAttempt`, `Notification`, `JobOfferReport`
* **Fichiers à créer :**
  * `repository/InterviewRepository.java`
  * `repository/TestRepository.java`
  * `repository/NotificationRepository.java`
  * `repository/JobOfferReportRepository.java`
  * `service/InterviewService.java`
  * `service/NotificationService.java`
  * `controller/InterviewController.java`
  * `controller/NotificationController.java`
* **Endpoints à fournir :**
  * `POST /api/interviews` — Planifier un entretien Google Meet
  * `GET /api/interviews/application/{appId}` — Récupérer l'entretien lié à une candidature
  * `GET /api/notifications/user/{userId}` — Notifications en temps réel
  * `POST /api/reports` — Signalement d'une annonce abusive

---

## 🛠️ Commandes Utiles

Pour compiler et vérifier que tout le projet compile sans erreur :
```powershell
.\mvnw.cmd compile
```

Pour lancer le serveur Spring Boot (sur le port 8080) :
```powershell
.\mvnw.cmd spring-boot:run
```
