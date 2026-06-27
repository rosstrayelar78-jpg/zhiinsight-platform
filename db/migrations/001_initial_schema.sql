CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(80) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name varchar(120),
  status varchar(20) NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admins_status_check CHECK (status IN ('active', 'disabled'))
);

CREATE TABLE regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  code varchar(32) UNIQUE,
  level varchar(20) NOT NULL,
  parent_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT regions_level_check CHECK (level IN ('province', 'city', 'district'))
);

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename varchar(255) NOT NULL,
  original_name varchar(255) NOT NULL,
  mime_type varchar(120) NOT NULL,
  size bigint NOT NULL,
  storage_path text NOT NULL,
  public_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL,
  slug varchar(120) NOT NULL UNIQUE,
  type varchar(30) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tags_type_check CHECK (type IN ('topic', 'industry', 'policy', 'case'))
);

CREATE TABLE policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  summary text,
  content text,
  issuing_authority varchar(255),
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  policy_level varchar(30),
  publish_date date,
  source_url text,
  status varchar(20) NOT NULL DEFAULT 'draft',
  seo_title varchar(255),
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT policies_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT policies_level_check CHECK (
    policy_level IS NULL OR policy_level IN ('national', 'provincial', 'municipal', 'district')
  )
);

CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  summary text,
  content text,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  case_type varchar(50),
  industry varchar(120),
  status varchar(20) NOT NULL DEFAULT 'draft',
  seo_title varchar(255),
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT cases_status_check CHECK (status IN ('draft', 'published'))
);

CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  summary text,
  content text,
  cover_image text,
  status varchar(20) NOT NULL DEFAULT 'draft',
  seo_title varchar(255),
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT topics_status_check CHECK (status IN ('draft', 'published'))
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  summary text,
  content text,
  publisher varchar(255),
  publish_date date,
  file_id uuid REFERENCES files(id) ON DELETE SET NULL,
  is_downloadable boolean NOT NULL DEFAULT true,
  status varchar(20) NOT NULL DEFAULT 'draft',
  seo_title varchar(255),
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT reports_status_check CHECK (status IN ('draft', 'published'))
);

CREATE TABLE content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(30) NOT NULL,
  content_id uuid NOT NULL,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_tags_type_check CHECK (content_type IN ('policy', 'case', 'topic', 'report')),
  CONSTRAINT content_tags_unique UNIQUE (content_type, content_id, tag_id)
);

CREATE TABLE topic_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content_type varchar(30) NOT NULL,
  content_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT topic_relations_type_check CHECK (content_type IN ('policy', 'case', 'report')),
  CONSTRAINT topic_relations_unique UNIQUE (topic_id, content_type, content_id)
);

CREATE INDEX idx_policies_status_publish_date ON policies(status, publish_date DESC);
CREATE INDEX idx_policies_region_id ON policies(region_id);
CREATE INDEX idx_cases_status_created_at ON cases(status, created_at DESC);
CREATE INDEX idx_cases_region_id ON cases(region_id);
CREATE INDEX idx_topics_status_created_at ON topics(status, created_at DESC);
CREATE INDEX idx_reports_status_publish_date ON reports(status, publish_date DESC);
CREATE INDEX idx_content_tags_lookup ON content_tags(content_type, content_id);
CREATE INDEX idx_topic_relations_topic ON topic_relations(topic_id, sort_order);
