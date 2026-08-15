-- Supabase PostgreSQL Schema for CivicRoad AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Authorities and Jurisdictions
CREATE TABLE IF NOT EXISTS authorities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction_id TEXT NOT NULL,
  is_simulated BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS jurisdictions (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  authority_id TEXT NOT NULL,
  bounds JSONB
);

-- 2. Users and Officers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  points_balance INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_count INT DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  authority_id TEXT, -- references authorities(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officers (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  authority_id TEXT NOT NULL,
  assigned_issue_ids TEXT[] DEFAULT '{}'
);

-- 3. Damage Classes
CREATE TABLE IF NOT EXISTS damage_classes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  default_severity_weight REAL NOT NULL,
  description TEXT NOT NULL
);

-- 4. Issues & Reports
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_class_id TEXT NOT NULL, -- references damage_classes(id)
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  jurisdiction_id TEXT NOT NULL,
  authority_id TEXT,
  routed_to TEXT,
  is_simulated_routing BOOLEAN DEFAULT false,
  reporter_id UUID NOT NULL REFERENCES users(id),
  image_url TEXT NOT NULL,
  image_hash TEXT NOT NULL,
  ai_confidence REAL NOT NULL,
  bounding_box JSONB NOT NULL,
  priority_score REAL DEFAULT 0,
  priority_band TEXT NOT NULL,
  assigned_officer_id UUID REFERENCES users(id),
  sla_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  image_url TEXT NOT NULL,
  ai_confidence REAL NOT NULL,
  bounding_box JSONB NOT NULL,
  image_hash TEXT NOT NULL,
  is_duplicate_of UUID REFERENCES issues(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issue_confirmations (
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS repair_evidences (
  issue_id UUID PRIMARY KEY REFERENCES issues(id) ON DELETE CASCADE,
  before_photo_url TEXT,
  after_photo_url TEXT,
  notes TEXT,
  officer_id UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Gamification (Points, Badges, Rewards)
CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  amount INT NOT NULL,
  related_issue_id UUID REFERENCES issues(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS rewards_catalog (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  point_cost INT NOT NULL,
  stock INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL REFERENCES rewards_catalog(id),
  point_cost INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Misc (Notifications, Audit Logs, Settings)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  related_issue_id UUID REFERENCES issues(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Default Settings Insert
INSERT INTO settings (id, data) VALUES (
  'global',
  '{
    "aiConfidenceThreshold": 0.55,
    "priorityThresholds": {
      "highReporterCount": 5,
      "criticalReporterCount": 10,
      "severityWeight": 1,
      "reporterWeight": 2,
      "recencyWeight": 0.5
    },
    "rateLimitReportsPerHour": 10,
    "slaHoursByBand": {
      "medium": 168,
      "high": 72,
      "critical": 24
    }
  }'
) ON CONFLICT (id) DO NOTHING;

-- Pre-seed Damage Classes and Badges if empty (or handled by your seed script)

