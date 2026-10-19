-- =========================================================
-- JobFlow database
-- Database name: scroll_master
-- MySQL 8.0+ / MySQL Workbench
-- =========================================================

CREATE DATABASE IF NOT EXISTS scroll_master
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE scroll_master;

-- Drop tables in dependency order so this script can be rerun.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS job_offer_reports;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS test_attempts;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_offers;
DROP TABLE IF EXISTS company_profiles;
DROP TABLE IF EXISTS candidate_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Shared account information for candidates, companies, and admins.
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    role ENUM('CANDIDATE', 'COMPANY', 'ADMIN') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- 2. Candidate-specific profile information.
CREATE TABLE candidate_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    photo_url VARCHAR(500) NULL,
    headline VARCHAR(150) NULL,
    about_me TEXT NULL,
    skills TEXT NULL,
    education TEXT NULL,
    experience TEXT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_candidate_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_candidate_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Company-specific profile information.
CREATE TABLE company_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    address VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    logo_url VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_company_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_company_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Job offers published by companies.
CREATE TABLE job_offers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NULL,
    contract_type ENUM(
        'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'TEMPORARY'
    ) NOT NULL,
    salary_min DECIMAL(12,2) NULL,
    salary_max DECIMAL(12,2) NULL,
    status ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'CLOSED', 'REJECTED')
        NOT NULL DEFAULT 'DRAFT',
    publication_date DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_job_offers_company (company_id),
    INDEX idx_job_offers_status (status),
    CONSTRAINT fk_job_offers_company
        FOREIGN KEY (company_id) REFERENCES company_profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_job_offer_salary_range
        CHECK (
            salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
        )
) ENGINE=InnoDB;

-- 5. Applications connect candidates to job offers.
-- UNIQUE(candidate_id, job_offer_id) means one application per candidate per offer.
CREATE TABLE applications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    candidate_id BIGINT UNSIGNED NOT NULL,
    job_offer_id BIGINT UNSIGNED NOT NULL,
    cv_url VARCHAR(500) NULL,
    motivation_message TEXT NULL,
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED',
        'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    ) NOT NULL DEFAULT 'SUBMITTED',
    PRIMARY KEY (id),
    CONSTRAINT uq_application_candidate_offer
        UNIQUE (candidate_id, job_offer_id),
    INDEX idx_applications_job_offer (job_offer_id),
    CONSTRAINT fk_applications_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_applications_job_offer
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Tests attached to job offers.
-- An offer with no rows here has no test; an offer can have multiple tests.
CREATE TABLE tests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    job_offer_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    duration_minutes INT UNSIGNED NULL,
    passing_score DECIMAL(5,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tests_job_offer (job_offer_id),
    CONSTRAINT fk_tests_job_offer
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_test_duration
        CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT chk_test_passing_score
        CHECK (passing_score IS NULL OR (passing_score >= 0 AND passing_score <= 100))
) ENGINE=InnoDB;

-- 7. Each attempt belongs to one test and one application.
CREATE TABLE test_attempts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    test_id BIGINT UNSIGNED NOT NULL,
    application_id BIGINT UNSIGNED NOT NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    score DECIMAL(5,2) NULL,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
        NOT NULL DEFAULT 'NOT_STARTED',
    PRIMARY KEY (id),
    INDEX idx_test_attempts_application (application_id),
    CONSTRAINT fk_test_attempts_test
        FOREIGN KEY (test_id) REFERENCES tests(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_test_attempts_application
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_test_attempt_score
        CHECK (score IS NULL OR (score >= 0 AND score <= 100))
) ENGINE=InnoDB;

-- 8. Interviews arranged for an application.
CREATE TABLE interviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,
    scheduled_at DATETIME NOT NULL,
    location VARCHAR(255) NULL,
    meeting_url VARCHAR(500) NULL,
    notes TEXT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
        NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_interviews_application (application_id),
    CONSTRAINT fk_interviews_application
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Notifications delivered to a user account.
CREATE TABLE notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    INDEX idx_notifications_user_created (user_id, created_at),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Reports submitted about job offers.
CREATE TABLE job_offer_reports (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    job_offer_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(180) NOT NULL,
    description TEXT NULL,
    report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN')
        NOT NULL DEFAULT 'PENDING',
    PRIMARY KEY (id),
    INDEX idx_reports_job_offer (job_offer_id),
    INDEX idx_reports_user (user_id),
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_reports_job_offer
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Quick check: list all tables created in scroll_master.
SHOW TABLES;
