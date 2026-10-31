CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  provider_open_id VARCHAR(191) NOT NULL UNIQUE,
  email VARCHAR(254) NULL,
  full_name VARCHAR(191) NOT NULL,
  account_status VARCHAR(24) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  display_name VARCHAR(80) NULL,
  preferred_language VARCHAR(32) NOT NULL DEFAULT 'en',
  general_area VARCHAR(120) NULL,
  citizenship_country VARCHAR(80) NULL,
  profile_photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role_name VARCHAR(48) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  granted_by CHAR(36) NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_role (user_id, role_name),
  KEY ix_roles_status (role_name, status),
  CONSTRAINT fk_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_granter FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  requested_role VARCHAR(48) NOT NULL,
  reason TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  reviewed_by CHAR(36) NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_role_request_queue (status, created_at),
  CONSTRAINT fk_role_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_request_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_sessions_user (user_id),
  KEY ix_sessions_expiry (expires_at),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS article_categories (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS article_sources (
  slug VARCHAR(100) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  url VARCHAR(1000) NULL,
  source_type VARCHAR(40) NOT NULL DEFAULT 'publisher',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_articles (
  slug VARCHAR(120) NOT NULL PRIMARY KEY,
  author_id CHAR(36) NULL,
  category_slug VARCHAR(80) NOT NULL,
  source_slug VARCHAR(100) NULL,
  title VARCHAR(240) NOT NULL,
  excerpt VARCHAR(500) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  article_type VARCHAR(40) NOT NULL DEFAULT 'reporting',
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  image_url VARCHAR(500) NULL,
  is_breaking TINYINT(1) NOT NULL DEFAULT 0,
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_articles_feed (status, published_at),
  KEY ix_articles_category (category_slug, status),
  CONSTRAINT fk_article_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_article_category FOREIGN KEY (category_slug) REFERENCES article_categories(slug),
  CONSTRAINT fk_article_source FOREIGN KEY (source_slug) REFERENCES article_sources(slug) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_articles (
  user_id CHAR(36) NOT NULL,
  article_slug VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, article_slug),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_article FOREIGN KEY (article_slug) REFERENCES news_articles(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS article_corrections (
  id CHAR(36) NOT NULL PRIMARY KEY,
  article_slug VARCHAR(120) NOT NULL,
  correction_text TEXT NOT NULL,
  editor_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_corrections_article (article_slug, created_at),
  CONSTRAINT fk_correction_article FOREIGN KEY (article_slug) REFERENCES news_articles(slug) ON DELETE CASCADE,
  CONSTRAINT fk_correction_editor FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS editorial_reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  article_slug VARCHAR(120) NOT NULL,
  reviewer_id CHAR(36) NULL,
  stage VARCHAR(40) NOT NULL,
  decision VARCHAR(40) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_editorial_article (article_slug, created_at),
  CONSTRAINT fk_review_article FOREIGN KEY (article_slug) REFERENCES news_articles(slug) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media_assets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  media_type VARCHAR(40) NOT NULL,
  asset_url VARCHAR(1000) NULL,
  license_note VARCHAR(500) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS civic_courses (
  slug VARCHAR(100) NOT NULL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  summary VARCHAR(600) NOT NULL,
  category VARCHAR(80) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_lessons (
  slug VARCHAR(140) NOT NULL PRIMARY KEY,
  course_slug VARCHAR(100) NOT NULL,
  title VARCHAR(240) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  source_note VARCHAR(500) NULL,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_lessons_course (course_slug, sort_order),
  CONSTRAINT fk_lesson_course FOREIGN KEY (course_slug) REFERENCES civic_courses(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_enrolments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_slug VARCHAR(100) NOT NULL,
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  completed_lessons JSON NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrolment (user_id, course_slug),
  CONSTRAINT fk_enrolment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrolment_course FOREIGN KEY (course_slug) REFERENCES civic_courses(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  lesson_slug VARCHAR(140) NOT NULL,
  question_text TEXT NOT NULL,
  options_json JSON NOT NULL,
  answer_key VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_slug) REFERENCES course_lessons(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_slug VARCHAR(100) NOT NULL,
  score_percent TINYINT UNSIGNED NOT NULL,
  answers_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_quiz_user (user_id, course_slug, created_at),
  CONSTRAINT fk_quiz_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempt_course FOREIGN KEY (course_slug) REFERENCES civic_courses(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS public_representatives (
  slug VARCHAR(120) NOT NULL PRIMARY KEY,
  display_name VARCHAR(191) NOT NULL,
  office_title VARCHAR(191) NOT NULL,
  constituency VARCHAR(191) NULL,
  region VARCHAR(100) NULL,
  official_contact_url VARCHAR(1000) NULL,
  profile_text TEXT NULL,
  verification_status VARCHAR(32) NOT NULL DEFAULT 'unverified',
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS representative_verifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  representative_slug VARCHAR(120) NOT NULL,
  verification_method VARCHAR(60) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  source_reference VARCHAR(500) NULL,
  reviewed_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rep_verification_profile FOREIGN KEY (representative_slug) REFERENCES public_representatives(slug) ON DELETE CASCADE,
  CONSTRAINT fk_rep_verification_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS citizen_questions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  representative_slug VARCHAR(120) NOT NULL,
  question_text TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  response_text TEXT NULL,
  responded_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  KEY ix_questions_user (user_id, created_at),
  CONSTRAINT fk_question_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_question_rep FOREIGN KEY (representative_slug) REFERENCES public_representatives(slug),
  CONSTRAINT fk_question_responder FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS community_concerns (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  general_area VARCHAR(120) NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  assigned_to CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_concerns_user (user_id, created_at),
  KEY ix_concerns_queue (status, created_at),
  CONSTRAINT fk_concern_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_concern_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS concern_updates (
  id CHAR(36) NOT NULL PRIMARY KEY,
  concern_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NULL,
  status VARCHAR(32) NOT NULL,
  public_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_concern_updates (concern_id, created_at),
  CONSTRAINT fk_concern_update_concern FOREIGN KEY (concern_id) REFERENCES community_concerns(id) ON DELETE CASCADE,
  CONSTRAINT fk_concern_update_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS public_commitments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  institution VARCHAR(191) NOT NULL,
  statement TEXT NOT NULL,
  geographic_area VARCHAR(191) NULL,
  source_url VARCHAR(1000) NULL,
  statement_date DATE NULL,
  stated_timeline VARCHAR(191) NULL,
  assessment VARCHAR(40) NOT NULL DEFAULT 'not_assessed',
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commitment_evidence (
  id CHAR(36) NOT NULL PRIMARY KEY,
  commitment_id CHAR(36) NOT NULL,
  source_url VARCHAR(1000) NULL,
  evidence_note TEXT NOT NULL,
  assessment_type VARCHAR(40) NOT NULL DEFAULT 'official_claim',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_commitment_evidence FOREIGN KEY (commitment_id) REFERENCES public_commitments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS public_events (
  slug VARCHAR(120) NOT NULL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  organizer VARCHAR(191) NOT NULL,
  venue VARCHAR(191) NULL,
  starts_at TIMESTAMP NULL,
  registration_url VARCHAR(1000) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  is_demo TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_registrations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  event_slug VARCHAR(120) NOT NULL,
  user_id CHAR(36) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_registration (event_slug, user_id),
  CONSTRAINT fk_event_reg_event FOREIGN KEY (event_slug) REFERENCES public_events(slug) ON DELETE CASCADE,
  CONSTRAINT fk_event_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS discussion_topics (
  slug VARCHAR(120) NOT NULL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  description TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS discussion_posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  topic_slug VARCHAR(120) NOT NULL,
  user_id CHAR(36) NOT NULL,
  parent_id CHAR(36) NULL,
  body TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'visible',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_discussion_topic (topic_slug, created_at),
  CONSTRAINT fk_discussion_topic FOREIGN KEY (topic_slug) REFERENCES discussion_topics(slug) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_parent FOREIGN KEY (parent_id) REFERENCES discussion_posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS moderation_reports (
  id CHAR(36) NOT NULL PRIMARY KEY,
  reporter_id CHAR(36) NULL,
  post_id CHAR(36) NULL,
  reason VARCHAR(80) NOT NULL,
  details TEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'submitted',
  reviewed_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_report_post FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE SET NULL,
  CONSTRAINT fk_report_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body VARCHAR(600) NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_notifications_user (user_id, created_at),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verification_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  method VARCHAR(40) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'not_started',
  provider_reference VARCHAR(191) NULL,
  user_note VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_verification_queue (status, created_at),
  CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verification_results (
  id CHAR(36) NOT NULL PRIMARY KEY,
  request_id CHAR(36) NOT NULL,
  result_status VARCHAR(32) NOT NULL,
  provider_reference VARCHAR(191) NULL,
  reviewed_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_result_request FOREIGN KEY (request_id) REFERENCES verification_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_result_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verification_audit_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  request_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NULL,
  action VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_verification_audit_request (request_id, created_at),
  CONSTRAINT fk_verification_audit_request FOREIGN KEY (request_id) REFERENCES verification_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS consent_records (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  consent_type VARCHAR(80) NOT NULL,
  consent_version VARCHAR(40) NOT NULL,
  granted TINYINT(1) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_consent_user (user_id, consent_type),
  CONSTRAINT fk_consent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS privacy_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  request_type VARCHAR(40) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_privacy_queue (status, created_at),
  CONSTRAINT fk_privacy_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  actor_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  object_type VARCHAR(80) NOT NULL,
  object_id VARCHAR(191) NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_audit_created (created_at),
  KEY ix_audit_actor (actor_id, created_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
