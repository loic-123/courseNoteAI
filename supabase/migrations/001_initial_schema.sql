-- CourseNotes AI Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-seed institutions
INSERT INTO institutions (name, short_name) VALUES
  ('Imperial College London', 'Imperial'),
  ('University of Cambridge', 'Cambridge'),
  ('University of Oxford', 'Oxford'),
  ('University College London', 'UCL'),
  ('London School of Economics', 'LSE');

-- 2. Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, code)
);

-- 3. Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Notes table (main content table)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  language TEXT CHECK(language IN ('en', 'fr')) DEFAULT 'en',

  -- Generated content
  notes_markdown TEXT NOT NULL,
  qcm_json JSONB NOT NULL,
  visual_prompt TEXT NOT NULL,
  visual_image_url TEXT,

  -- Engagement metrics
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  views_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL, -- IP hash or fingerprint
  vote_type TEXT CHECK(vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(note_id, user_identifier)
);

-- 6. Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Notes_tags junction table
CREATE TABLE notes_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_notes_course ON notes(course_id);
CREATE INDEX idx_notes_upvotes ON notes(upvotes DESC);
CREATE INDEX idx_notes_created ON notes(created_at DESC);
CREATE INDEX idx_notes_language ON notes(language);
CREATE INDEX idx_votes_note_user ON votes(note_id, user_identifier);
CREATE INDEX idx_courses_institution ON courses(institution_id);
CREATE INDEX idx_modules_course ON modules(course_id);

-- Trigger to update updated_at on notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(note_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notes SET views_count = views_count + 1 WHERE id = note_uuid;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE institutions IS 'Universities and educational institutions';
COMMENT ON TABLE courses IS 'Courses offered by institutions';
COMMENT ON TABLE modules IS 'Subparts/lectures within courses';
COMMENT ON TABLE notes IS 'Generated study materials (notes + QCM + visual)';
COMMENT ON TABLE votes IS 'User votes on notes (upvote/downvote)';
COMMENT ON TABLE tags IS 'Tags for categorizing notes';
COMMENT ON TABLE notes_tags IS 'Many-to-many relationship between notes and tags';
