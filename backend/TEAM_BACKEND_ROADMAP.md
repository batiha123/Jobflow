# 🚀 JobFlow — Guide d'Équipe Backend (4 Développeurs)

Ce document est le guide de référence pour l'équipe des 4 développeurs. Il définit la répartition exacte, les conventions, les règles Git et les endpoints de chacun pour avancer en parallèle sans conflit.

---

## 🏗️ 1. Architecture Commune & Conventions

Chaque développeur suit la séparation en couches standard :
```text
entity/ (Prêt) ➔ repository/ ➔ service/ ➔ controller/ ➔ dto/
```

- **Base de données** : MySQL `scroll_master`. Données de test prêtes dans `database/seed_data.sql` (mot de passe universel de test : `Password123!`).
- **Swagger UI (Documentation interactive)** : accessible sur `http://localhost:8080/swagger-ui.html`.
- **CORS** : préconfiguré pour `http://localhost:5173` (React Vite).
- **Format de réponse unifié** : utiliser `ApiResponse.ok(data)` ou `ApiResponse.error(message)`.
- **Gestion des erreurs** : gérée globalement par `GlobalExceptionHandler`.

---

## 👥 2. Répartition Précise des 4 Rôles

### 👤 Personne 1 — Authentification, Sécurité & Profils Utilisateurs (Fondation)
* **Entités** : `User`, `CandidateProfile`, `AdminProfile`
* **Fichiers à créer** :
  * `repository/UserRepository.java`
  * `repository/CandidateProfileRepository.java`
  * `repository/AdminProfileRepository.java`
  * `service/AuthService.java` & `service/UserService.java`
  * `controller/AuthController.java`
  * `controller/UserController.java`
  * `controller/CandidateProfileController.java`
  * `controller/AdminProfileController.java`
* **Endpoints à fournir** :
  * `POST /api/auth/register` — Inscription (Candidat ou Entreprise)
  * `POST /api/auth/login` — Connexion, vérification mot de passe avec BCrypt et retour du JWT (`JwtUtils.java` est déjà disponible dans `config/`)
  * `GET /api/users/me` — Récupérer l'utilisateur connecté
  * `PATCH /api/users/{id}/status` — Activer ou suspendre un compte
  * `GET /api/candidate-profiles/{userId}` & `PUT /api/candidate-profiles/{userId}` — Consultation et mise à jour du profil candidat
  * `GET /api/admin-profiles/{userId}` & `PUT /api/admin-profiles/{userId}` — Profil admin

---

### 👤 Personne 2 — Entreprises & Offres d'Emploi (Côté Recruteur & Catalogue)
* **Entités** : `CompanyProfile`, `JobOffer`
* **Fichiers à créer** :
  * `repository/CompanyProfileRepository.java`
  * `repository/JobOfferRepository.java`
  * `service/CompanyService.java`
  * `service/JobOfferService.java`
  * `controller/CompanyController.java`
  * `controller/JobOfferController.java`
* **Endpoints à fournir** :
  * `GET /api/jobs` — Liste des offres avec filtres (recherche keyword, location, contractType, status)
  * `GET /api/jobs/{id}` — Détail complet d'une offre
  * `POST /api/jobs` — Création d'une nouvelle offre
  * `PUT /api/jobs/{id}` — Modification d'une offre existante
  * `DELETE /api/jobs/{id}` — Clôture ou suppression d'une offre
  * `GET /api/companies` — Annuaire des entreprises
  * `GET /api/companies/{id}` & `PUT /api/companies/{id}` — Profil entreprise

---

### 👤 Personne 3 — Candidatures, Tests & Entretiens (Recrutement)
* **Entités** : `Application`, `Test`, `TestAttempt`, `Interview`
* **Fichiers à créer** :
  * `repository/ApplicationRepository.java`
  * `repository/TestRepository.java`
  * `repository/TestAttemptRepository.java`
  * `repository/InterviewRepository.java`
  * `service/ApplicationService.java`
  * `service/TestService.java`
  * `service/InterviewService.java`
  * `controller/ApplicationController.java`
  * `controller/TestController.java`
  * `controller/TestAttemptController.java`
  * `controller/InterviewController.java`
* **Endpoints à fournir** :
  * `POST /api/applications` — Postuler à une offre (avec CV et lettre de motivation)
  * `POST /api/applications/upload-cv` — Upload du fichier CV PDF (stockage dans `./uploads/cv/`)
  * `GET /api/applications/candidate/{candidateId}` — Liste des candidatures du candidat
  * `GET /api/applications/job/{jobOfferId}` — Candidatures reçues pour un recruteur
  * `PATCH /api/applications/{id}/status` — Mise à jour statut (`SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`)
  * `GET /api/tests/job/{jobOfferId}` & `POST /api/tests` — Gestion des tests techniques
  * `POST /api/test-attempts/submit` — Soumission d'un test candidat et calcul du score
  * `POST /api/interviews` — Planification d'un entretien (Google Meet, date, statut)
  * `GET /api/interviews/application/{appId}` — Entretien lié à une candidature

---

### 👤 Personne 4 — Administration, Notifications & IA
* **Entités** : `Notification`, `JobOfferReport`, `AdminAuditLog`
* **Fichiers à créer** :
  * `repository/NotificationRepository.java`
  * `repository/JobOfferReportRepository.java`
  * `repository/AdminAuditLogRepository.java`
  * `service/AdminService.java`
  * `service/NotificationService.java`
  * `service/JobOfferReportService.java`
  * `service/AIAnalysisService.java` (Interface + implémentation simulée ou réelle)
  * `controller/AdminController.java`
  * `controller/NotificationController.java`
  * `controller/JobOfferReportController.java`
* **Endpoints à fournir** :
  * `GET /api/admin/stats` — Statistiques globales (nb utilisateurs, offres actives, nb candidatures)
  * `GET /api/admin/audit-logs` — Historique des actions d'administration
  * `POST /api/reports` — Signaler une annonce frauduleuse
  * `GET /api/reports` & `PATCH /api/reports/{id}/status` — Modération des signalements
  * `GET /api/notifications/user/{userId}` — Récupérer les notifications d'un utilisateur
  * `PATCH /api/notifications/{id}/read` — Marquer une notification comme lue
  * `POST /api/ai/analyze-cv` — Analyse IA du CV (matching compétences vs offre)

---

## 🌿 3. Règles Git pour travailler à 4 sans conflits

1. **Ne JAMAIS pousser directement sur `main`** :
   Chaque développeur crée sa propre branche :
   ```bash
   git checkout -b feature/auth-person1
   git checkout -b feature/jobs-person2
   git checkout -b feature/recruitment-person3
   git checkout -b feature/admin-ai-person4
   ```

2. **Synchronisation quotidienne** :
   Avant de commencer à coder chaque matin :
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/votre-branche
   git merge main
   ```

3. **Ne pas écraser les mots de passe locaux** :
   Le fichier `application.properties` contient la configuration MySQL. Évitez de modifier les identifiants ou utilisez des variables d'environnement si les mots de passe diffèrent entre vos PC.

---

## 🛠️ 4. Commandes Utiles

Pour compiler et vérifier le projet :
```powershell
cd backend
.\mvnw.cmd compile
```

Pour lancer le serveur Spring Boot :
```powershell
.\mvnw.cmd spring-boot:run
```
