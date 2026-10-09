export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  passwordHash: string; // Stored securely as SHA-256 hash
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
}

export interface LessonResource {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'assignment' | 'zip' | 'doc';
  url: string; // Data URL, blob URL, or Supabase Storage URL
  fileName?: string;
  fileSizeBytes?: number;
  isPublished: boolean;
  uploadedAt: string;
}

export type VideoSourceType = 'upload' | 'url';

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoSourceType: VideoSourceType;
  videoUrl: string; // Uploaded video Blob/Storage URL OR external video stream URL
  videoFileName?: string;
  videoFileSizeBytes?: number;
  isPublished: boolean;
  orderIndex: number;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  description?: string;
  lessons: Lesson[];
}

export interface MeetingSchedule {
  id?: string;
  title: string;
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams';
  url: string;
  timeDescription: string;
  date?: string;
  time?: string;
  instructions?: string;
  isPublished: boolean;
  nextSessionDate?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: 'development' | 'testing' | 'other';
  description: string;
  summary: string;
  duration: string;
  price: number;
  level: string;
  thumbnailUrl: string;
  status: 'published' | 'draft' | 'archived';
  modules: CourseModule[];
  meetingSchedule?: MeetingSchedule;
  instructor?: {
    name: string;
    title: string;
    bio: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'suspended';
  completedLessonIds: string[];
  lastWatchedLessonId?: string;
  lastWatchedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  entityType: 'course' | 'student' | 'video' | 'pdf' | 'meeting' | 'auth';
}

export interface StudentNote {
  id: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  content: string;
  updatedAt: string;
}
