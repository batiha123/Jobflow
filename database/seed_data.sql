-- =========================================================
-- JOBFLOW - DONNÉES DE TEST & DÉMONSTRATION COMPLÈTES
-- Script SQL pour MySQL 8.0+
-- Compatible avec le backend Spring Boot et le frontend React
-- Mot de passe universel pour tous les comptes de test : Password123!
-- Hash BCrypt valide : $2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG
-- =========================================================

USE scroll_master;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. USERS (Comptes de test)
-- =========================================================
-- Mot de passe pour tous ces comptes : Password123!

INSERT INTO users (id, name, email, password_hash, phone, role, account_status, created_at)
VALUES 
-- Administrateur (ID: 10)
(10, 'Marc De La Tour', 'admin@jobflow.com', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 1 80 00 12 34', 'ADMIN', 'ACTIVE', '2026-01-01 08:00:00'),

-- Recruteurs / Entreprises (ID: 20, 21, 22)
(20, 'Sophie Mercier', 'sophie.mercier@novatech.io', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 1 42 68 90 00', 'COMPANY', 'ACTIVE', '2026-01-10 09:15:00'),
(21, 'Alexandre Roux', 'alexandre.roux@lumenlabs.fr', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 4 78 92 11 22', 'COMPANY', 'ACTIVE', '2026-01-20 14:00:00'),
(22, 'Sarah Bernard', 'sarah.bernard@greentech.org', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 2 40 12 34 56', 'COMPANY', 'ACTIVE', '2026-02-01 10:30:00'),

-- Candidats (ID: 30, 31, 32)
(30, 'Yasmine Benali', 'yasmine.benali@gmail.com', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 6 12 34 56 78', 'CANDIDATE', 'ACTIVE', '2026-02-15 10:30:00'),
(31, 'Thomas Dubois', 'thomas.dubois@gmail.com', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 6 98 76 54 32', 'CANDIDATE', 'ACTIVE', '2026-02-18 11:20:00'),
(32, 'Emma Leroy', 'emma.leroy@gmail.com', '$2a$10$6aXD6Az/kk55lR2aIP9vL.HZJ5YVwDxWBUO3TG16rQ4DmkcDXu2vG', '+33 6 45 67 89 01', 'CANDIDATE', 'ACTIVE', '2026-02-22 15:45:00')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    account_status = VALUES(account_status);

-- =========================================================
-- 2. COMPANY PROFILES
-- =========================================================

INSERT INTO company_profiles (id, user_id, company_name, description, address, website, logo_url, created_at)
VALUES 
(1, 20, 'NovaTech Solutions', 
 'Leader européen en solutions cloud et architectures logicielles Spring Boot pour entreprises en forte croissance. Plus de 350 ingénieurs répartis sur Paris, Lyon et en télétravail.',
 '15 Avenue des Champs-Élysées, 75008 Paris', 'https://novatech.io', 
 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80', '2026-01-10 09:20:00'),

(2, 21, 'Lumen Labs', 
 'Studio produit & design spécialisé dans les interfaces SaaS d’intelligence artificielle de nouvelle génération. Équipe agile axée sur l’expérience utilisateur.',
 '22 Quai Victor Augagneur, 69003 Lyon', 'https://lumenlabs.fr', 
 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=120&h=120&q=80', '2026-01-20 14:10:00'),

(3, 22, 'GreenTech Innovations', 
 'Entreprise pionnière dans la transition écologique numérique et l’IoT durable. Nous développons des capteurs intelligents et des dashboards d’optimisation carbone.',
 '8 Rue de la Paix, 44000 Nantes', 'https://greentech.org', 
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80', '2026-02-01 10:45:00')
ON DUPLICATE KEY UPDATE 
    company_name = VALUES(company_name),
    description = VALUES(description),
    address = VALUES(address),
    website = VALUES(website),
    logo_url = VALUES(logo_url);

-- =========================================================
-- 3. CANDIDATE PROFILES
-- =========================================================

INSERT INTO candidate_profiles (id, user_id, photo_url, headline, about_me, skills, education, experience, created_at)
VALUES 
(1, 30, 
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
 'Développeuse Fullstack React & Spring Boot · 3 ans d’expérience',
 'Passionnée par la conception de produits web performants et intuitifs. Expérience concrète sur des architectures micro-services, APIs RESTful et React moderne.',
 'React, JavaScript, Spring Boot, Java 21, MySQL, REST API, Git, Docker, CSS Modules',
 'Master Informatique & Systèmes d’Information — Université Paris-Saclay (2021-2023)',
 '2 ans Développeuse Web chez AlphaDev (2023-2025) · Conception de dashboards analytiques haute disponibilité.',
 '2026-02-15 10:45:00'),

(2, 31, 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&h=250&q=80',
 'Ingénieur DevOps & Architecte Cloud AWS / Kubernetes',
 'Ingénieur passionné par l’automatisation, la conteneurisation et l’observabilité des systèmes distribués.',
 'Docker, Kubernetes, AWS, Terraform, CI/CD GitHub Actions, Linux, Java, Prometheus',
 'Diplôme d’Ingénieur Télécom & Réseaux — INSA Lyon (2020-2023)',
 '3 ans DevOps chez CloudWave · Migration de 50+ micro-services vers Kubernetes avec zéro indisponibilité.',
 '2026-02-18 11:30:00'),

(3, 32, 
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&h=250&q=80',
 'Senior Product & UI/UX Designer · Design Systems & SaaS',
 'Conception d’expériences utilisateur fluides, d’architectures de l’information rigoureuses et de systèmes de design scalables.',
 'Figma, Design Systems, UX Research, Prototypage, Tests Utilisateurs, HTML/CSS',
 'Master Design d’Interactivité & UX — Gobelins Paris (2019-2021)',
 '4 ans Lead Product Designer chez Studio Pixel · Refonte globale de plateformes B2B et interfaces SaaS.',
 '2026-02-22 16:00:00')
ON DUPLICATE KEY UPDATE 
    headline = VALUES(headline),
    about_me = VALUES(about_me),
    skills = VALUES(skills),
    education = VALUES(education),
    experience = VALUES(experience);

-- =========================================================
-- 4. ADMIN PROFILES
-- =========================================================

INSERT INTO admin_profiles (id, user_id, position, department, bio, photo_url, created_at)
VALUES 
(1, 10, 'Responsable Plateforme & Modération', 'Direction Technique', 
 'Supervision de la qualité des annonces, modération des signalements et conformité de la plateforme JobFlow.', 
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&h=250&q=80', 
 '2026-01-01 08:30:00')
ON DUPLICATE KEY UPDATE 
    position = VALUES(position),
    department = VALUES(department);

-- =========================================================
-- 5. JOB OFFERS (Offres d'emploi réalistes)
-- =========================================================

INSERT INTO job_offers (id, company_id, title, description, location, contract_type, salary_min, salary_max, status, publication_date, created_at)
VALUES 
(1, 1, 'Développeur Fullstack React / Spring Boot', 
 'Nous recherchons un développeur Fullstack talentueux pour concevoir et faire évoluer notre plateforme SaaS utilisée par plus de 50 000 utilisateurs quotidiens. Vous travaillerez sur des architectures micro-services Spring Boot et des interfaces React dynamiques.',
 'Paris (Hybride)', 'FULL_TIME', 45000.00, 55000.00, 'PUBLISHED', '2026-03-01 10:00:00', '2026-03-01 10:00:00'),

(2, 1, 'Ingénieur Cloud & DevOps Kubernetes', 
 'Rejoignez notre équipe Infrastructure pour orchestrer nos clusters Kubernetes multi-régions sur AWS et optimiser nos pipelines d’intégration continue.',
 'Paris (France)', 'FULL_TIME', 55000.00, 68000.00, 'PUBLISHED', '2026-03-05 14:30:00', '2026-03-05 14:30:00'),

(3, 1, 'Lead Tech Java 21 & Microservices', 
 'Pilotage technique d’une équipe de 8 développeurs, définition des standards d’architecture et migration vers Spring Boot 4 et Java 21.',
 'Télétravail complet', 'FULL_TIME', 65000.00, 78000.00, 'PUBLISHED', '2026-03-08 09:00:00', '2026-03-08 09:00:00'),

(4, 2, 'Senior Product Designer (UI/UX)', 
 'Façonnez l’avenir de nos outils SaaS basés sur l’IA. Vous dirigerez la recherche utilisateur, les prototypes interactifs et l’enrichissement de notre Design System.',
 'Lyon (France)', 'FULL_TIME', 48000.00, 60000.00, 'PUBLISHED', '2026-03-02 11:15:00', '2026-03-02 11:15:00'),

(5, 2, 'Développeur Frontend React / TypeScript', 
 'Intégration d’interfaces fluides, accessibles et ultra-rapides. Maîtrise avancée de React, des hooks personnalisés et de l’optimisation de rendu.',
 'Lyon (Hybride)', 'FULL_TIME', 42000.00, 52000.00, 'PUBLISHED', '2026-03-06 16:20:00', '2026-03-06 16:20:00'),

(6, 2, 'Data Analyst & Ingénieur SQL', 
 'Modélisation et analyse des données d’usage produit. Construction de dashboards analytiques et requêtage SQL haute performance.',
 'Lyon / Paris', 'FULL_TIME', 40000.00, 50000.00, 'PUBLISHED', '2026-03-10 13:45:00', '2026-03-10 13:45:00'),

(7, 3, 'Stagiaire Développeur Mobile (Flutter / React Native)', 
 'Stage de 6 mois au sein de notre pôle mobile pour participer à la création d’une application de suivi d’empreinte carbone grand public.',
 'Nantes (France)', 'INTERNSHIP', 14000.00, 16000.00, 'PUBLISHED', '2026-03-12 10:00:00', '2026-03-12 10:00:00'),

(8, 3, 'Développeur Backend Java & IoT', 
 'Conception d’APIs d’ingestion temps réel pour capteurs environnementaux connectés. Traitement de flux de données massifs.',
 'Nantes (Hybride)', 'FULL_TIME', 44000.00, 54000.00, 'PUBLISHED', '2026-03-14 15:00:00', '2026-03-14 15:00:00')
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    location = VALUES(location),
    salary_min = VALUES(salary_min),
    salary_max = VALUES(salary_max),
    status = VALUES(status);

-- =========================================================
-- 6. TESTS TECHNIQUES (Évaluations en ligne)
-- =========================================================

INSERT INTO tests (id, job_offer_id, title, description, duration_minutes, passing_score, created_at)
VALUES 
(1, 1, 'Évaluation Backend Java 21 & Spring Boot', 
 'Validation des compétences clés : Injection de dépendances, Spring Data JPA, transactions ACID, gestion des exceptions et API REST.', 
 30, 70.00, '2026-02-01 09:00:00'),

(2, 5, 'Test Frontend React Moderne & JavaScript ES6+', 
 'Évaluation pratique : Hooks React (useState, useEffect, useMemo), gestion de l’état, cycle de vie et consommation d’APIs asynchrones.', 
 25, 75.00, '2026-02-01 09:30:00'),

(3, 6, 'Test SQL & Modélisation Relationnelle', 
 'Requêtes complexes (JOIN, GROUP BY, subqueries), indexation et principes d’intégrité référentielle.', 
 20, 65.00, '2026-02-01 10:00:00')
ON DUPLICATE KEY UPDATE 
    job_offer_id = VALUES(job_offer_id),
    title = VALUES(title),
    description = VALUES(description);

-- =========================================================
-- 7. APPLICATIONS (Candidatures soumises)
-- =========================================================

INSERT INTO applications (id, candidate_id, job_offer_id, cv_url, motivation_message, status, application_date)
VALUES 
(1, 1, 1, 
 'https://jobflow.com/resumes/yasmine-benali-cv.pdf', 
 'Passionnée par les architectures logicielles modernes, je serais ravie de mettre à profit mon expérience sur React et Spring Boot au sein de NovaTech.',
 'SHORTLISTED', '2026-03-02 11:20:00'),

(2, 2, 2, 
 'https://jobflow.com/resumes/thomas-dubois-cv.pdf', 
 'Avec 3 ans d’expérience sur Kubernetes et AWS, je souhaite contribuer à l’automatisation et la montée en charge de vos clusters cloud.',
 'UNDER_REVIEW', '2026-03-06 15:40:00'),

(3, 3, 4, 
 'https://jobflow.com/resumes/emma-leroy-portfolio.pdf', 
 'Le projet de Lumen Labs sur les interfaces d’IA résonne avec mes travaux de recherche UX. Je serais ravie d’échanger avec votre équipe.',
 'ACCEPTED', '2026-03-04 10:15:00')
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    motivation_message = VALUES(motivation_message);

-- =========================================================
-- 8. TEST ATTEMPTS (Résultats aux tests techniques)
-- =========================================================

INSERT INTO test_attempts (id, test_id, application_id, started_at, completed_at, score, status)
VALUES 
(1, 1, 1, '2026-03-03 14:00:00', '2026-03-03 14:26:00', 92.50, 'COMPLETED'),
(2, 3, 2, '2026-03-07 10:00:00', '2026-03-07 10:18:00', 85.00, 'COMPLETED')
ON DUPLICATE KEY UPDATE 
    score = VALUES(score),
    status = VALUES(status);

-- =========================================================
-- 9. INTERVIEWS (Entretiens visio programmés)
-- =========================================================

INSERT INTO interviews (id, application_id, scheduled_at, location, meeting_url, notes, status, created_at)
VALUES 
(1, 1, '2026-10-25 14:00:00', 'Google Meet', 
 'https://meet.google.com/jobflow-yasmine-novatech', 
 'Entretien technique et échange d’architecture avec Sophie Mercier et le Lead Développeur.', 
 'SCHEDULED', '2026-03-04 09:30:00')
ON DUPLICATE KEY UPDATE 
    scheduled_at = VALUES(scheduled_at),
    meeting_url = VALUES(meeting_url),
    status = VALUES(status);

-- =========================================================
-- 10. NOTIFICATIONS
-- =========================================================

INSERT INTO notifications (id, user_id, message, is_read, created_at)
VALUES 
(1, 30, 'Votre candidature pour Développeur Fullstack React / Spring Boot a été sélectionnée pour un entretien visio !', FALSE, '2026-03-04 09:35:00'),
(2, 20, 'Une nouvelle candidature a été reçue pour le poste Ingénieur Cloud & DevOps Kubernetes.', TRUE, '2026-03-06 15:42:00')
ON DUPLICATE KEY UPDATE 
    message = VALUES(message);

-- =========================================================
-- 11. JOB OFFER REPORTS (Modération Admin)
-- =========================================================

INSERT INTO job_offer_reports (id, user_id, job_offer_id, reason, description, status, report_date)
VALUES 
(1, 30, 6, 'Information salaire incomplète', 'La description mentionne une fourchette différente du titre de l’offre.', 'PENDING', '2026-03-11 14:10:00')
ON DUPLICATE KEY UPDATE 
    reason = VALUES(reason),
    status = VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- FIN DU SCRIPT DE DONNÉES DE TEST
-- =========================================================
