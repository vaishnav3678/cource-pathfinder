-- =========================================================================
-- Pathfinder Dynamic Learning Management Portal — Supabase PostgreSQL Schema
-- Migration: 20261009_pathfinder_schema.sql
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL, -- SHA-256 / PBKDF2 hash
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('development', 'testing', 'other')),
  description TEXT NOT NULL,
  summary TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  level TEXT DEFAULT 'Beginner to Advanced',
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  instructor JSONB,
  meeting_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. LESSONS (Supports both desktop uploaded videos & external stream URLs)
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  video_source_type TEXT NOT NULL DEFAULT 'url' CHECK (video_source_type IN ('upload', 'url')),
  video_url TEXT NOT NULL,
  video_file_name TEXT,
  video_file_size_bytes BIGINT,
  is_published BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  resources JSONB DEFAULT '[]'::jsonb, -- Array of PDF resources
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. STUDENT ENROLLMENTS (Direct admin assignment - NO access codes)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  completed_lesson_ids TEXT[] DEFAULT '{}',
  last_watched_lesson_id TEXT,
  last_watched_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  entity_type TEXT NOT NULL
);

-- 7. STUDENT NOTES
CREATE TABLE IF NOT EXISTS public.student_notes (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(student_id, lesson_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Courses: Read published by all; Admin can manage all
CREATE POLICY "Public courses viewable" ON public.courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin course management" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Lessons: Students can only view lessons of courses they are enrolled in
CREATE POLICY "Students view enrolled lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid()
        AND enrollments.course_id = lessons.course_id
        AND enrollments.status = 'active'
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enrollments: Students see only their own enrollments
CREATE POLICY "Students see own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admin manages all enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================================================================
-- STORAGE BUCKETS (Create in Supabase Dashboard -> Storage)
-- 1. 'course-videos' (Private bucket, 500MB max per video)
-- 2. 'course-pdfs'   (Private bucket, 50MB max per PDF)
-- =========================================================================
