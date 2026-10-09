import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key'
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

/**
 * Validates connection to the Supabase backend
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  const targetUrl = url || supabaseUrl;
  const targetKey = key || supabaseAnonKey;

  if (!targetUrl || !targetKey) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are required.',
    };
  }

  try {
    const testClient = createClient(targetUrl, targetKey);
    // Ping public table or auth
    const { error } = await testClient.from('courses').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet if schema isn't run, check if auth reachable
      const { error: authError } = await testClient.auth.getSession();
      if (authError) {
        return {
          success: false,
          message: `Connection failed: ${authError.message}`,
        };
      }
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Supabase instance.',
    };
  }
}

/**
 * Complete SQL DDL Schema Script for Pathfinder LMS
 * Admins can copy this directly into the Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- Pathfinder Learning Management System (LMS) - PostgreSQL Schema for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('development', 'testing')),
  description TEXT NOT NULL,
  summary TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  level TEXT DEFAULT 'Beginner to Advanced',
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  instructor JSONB,
  features TEXT[] DEFAULT '{}',
  meeting_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. COURSE MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  video_url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. COURSE ACCESS CODES TABLE (Server validated)
CREATE TABLE IF NOT EXISTS public.access_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  assigned_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_student_email TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  expires_at TIMESTAMPTZ,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT FALSE,
  max_attempts INTEGER DEFAULT 5,
  failed_attempts INTEGER DEFAULT 0
);

-- 6. STUDENT ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'completed', 'revoked')),
  access_code_used TEXT,
  activated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  completed_lesson_ids TEXT[] DEFAULT '{}',
  last_watched_lesson_id TEXT,
  last_watched_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  author_name TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent'))
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  entity_type TEXT NOT NULL
);

-- 9. STUDENT NOTES TABLE
CREATE TABLE IF NOT EXISTS public.student_notes (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(student_id, lesson_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policies:
-- Courses are readable by everyone if published; editable by admins
CREATE POLICY "Public courses readable" ON public.courses
  FOR SELECT USING (status = 'published');

-- Students see only their own enrollments
CREATE POLICY "Students see own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Students see only lessons of courses they are actively enrolled in
CREATE POLICY "Students see enrolled course lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid()
        AND enrollments.course_id = lessons.course_id
        AND enrollments.status = 'active'
    )
  );
`;
