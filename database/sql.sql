
-- =========================================================
-- JOBFLOW - COMPLETE DATABASE
-- MySQL 8.0+
-- React frontend + Spring Boot backend
-- =========================================================

CREATE DATABASE IF NOT EXISTS scroll_master
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE scroll_master;

-- =========================================================
-- 1. USERS
-- Shared authentication and roles for all account types
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),

    role ENUM('CANDIDATE', 'COMPANY', 'ADMIN')
        NOT NULL DEFAULT 'CANDIDATE',

    account_status ENUM('ACTIVE', 'SUSPENDED', 'DELETED')
        NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- 2. CANDIDATE PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,

    photo_url VARCHAR(500),
    headline VARCHAR(255),
    about_me TEXT,
    skills TEXT,
    education TEXT,
    experience TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidate_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- 3. COMPANY PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS company_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,

    company_name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    website VARCHAR(500),
    logo_url VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_company_name (company_name)
) ENGINE=InnoDB;

-- =========================================================
-- 4. JOB OFFERS
-- =========================================================

CREATE TABLE IF NOT EXISTS job_offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),

    contract_type ENUM(
        'FULL_TIME',
        'PART_TIME',
        'INTERNSHIP',
        'CONTRACT',
        'TEMPORARY'
    ) NOT NULL,

    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),

    status ENUM(
        'DRAFT',
        'PENDING',
        'PUBLISHED',
        'CLOSED',
        'REJECTED'
    ) NOT NULL DEFAULT 'DRAFT',

    publication_date DATETIME,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_offer_company
        FOREIGN KEY (company_id) REFERENCES company_profiles(id)
        ON DELETE RESTRICT,

    INDEX idx_job_status (status),
    INDEX idx_job_company (company_id),
    INDEX idx_job_location (location),
    INDEX idx_job_publication_date (publication_date)
) ENGINE=InnoDB;

-- =========================================================
-- 5. APPLICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_offer_id BIGINT NOT NULL,

    cv_url VARCHAR(500),
    motivation_message TEXT,

    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status ENUM(
        'SUBMITTED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN'
    ) NOT NULL DEFAULT 'SUBMITTED',

    CONSTRAINT fk_application_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_application_job
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_candidate_job
        UNIQUE (candidate_id, job_offer_id),

    INDEX idx_application_status (status),
    INDEX idx_application_job (job_offer_id),
    INDEX idx_application_candidate (candidate_id)
) ENGINE=InnoDB;

-- =========================================================
-- 6. TESTS
-- =========================================================

CREATE TABLE IF NOT EXISTS tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_offer_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT UNSIGNED,
    passing_score DECIMAL(5,2),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_job
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE RESTRICT,

    INDEX idx_test_job (job_offer_id)
) ENGINE=InnoDB;

-- =========================================================
-- 7. TEST ATTEMPTS
-- =========================================================

CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,

    started_at DATETIME,
    completed_at DATETIME,
    score DECIMAL(5,2),

    status ENUM(
        'NOT_STARTED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT fk_attempt_test
        FOREIGN KEY (test_id) REFERENCES tests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_attempt_application
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE RESTRICT,

    INDEX idx_attempt_test (test_id),
    INDEX idx_attempt_application (application_id),
    INDEX idx_attempt_status (status)
) ENGINE=InnoDB;

-- =========================================================
-- 8. INTERVIEWS
-- =========================================================

CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,

    scheduled_at DATETIME NOT NULL,
    location VARCHAR(255),
    meeting_url VARCHAR(500),
    notes TEXT,

    status ENUM(
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW'
    ) NOT NULL DEFAULT 'SCHEDULED',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_interview_application
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE RESTRICT,

    INDEX idx_interview_application (application_id),
    INDEX idx_interview_schedule (scheduled_at),
    INDEX idx_interview_status (status)
) ENGINE=InnoDB;

-- =========================================================
-- 9. NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,

    message TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_notification_user_read (user_id, is_read),
    INDEX idx_notification_created (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- 10. JOB OFFER REPORTS
-- Users can report inappropriate job offers
-- =========================================================

CREATE TABLE IF NOT EXISTS job_offer_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_offer_id BIGINT NOT NULL,

    reason VARCHAR(255) NOT NULL,
    description TEXT,

    report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status ENUM(
        'PENDING',
        'REVIEWED',
        'DISMISSED',
        'ACTION_TAKEN'
    ) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_report_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_report_job
        FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
        ON DELETE RESTRICT,

    INDEX idx_report_status (status),
    INDEX idx_report_job (job_offer_id),
    INDEX idx_report_user (user_id)
) ENGINE=InnoDB;

-- =========================================================
-- 11. ADMIN PROFILES
-- Additional profile information for administrators
-- =========================================================

CREATE TABLE IF NOT EXISTS admin_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,

    position VARCHAR(100),
    department VARCHAR(100),
    bio TEXT,
    photo_url VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- 12. ADMIN AUDIT LOGS
-- Records administrative actions and changes
-- =========================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    admin_user_id BIGINT NOT NULL,

    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id BIGINT,

    details TEXT,

    old_value JSON,
    new_value JSON,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_log_admin
        FOREIGN KEY (admin_user_id) REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_audit_admin (admin_user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_target (target_type, target_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- END OF JOBFLOW DATABASE
-- =========================================================
