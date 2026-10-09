import { Course, User, Enrollment, LessonResource, MeetingSchedule } from '../types';

export const API_BASE = '';

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/api/courses`);
  const data = await res.json();
  if (data.success) {
    return data.courses;
  }
  throw new Error(data.message || 'Failed to fetch courses');
}

export async function fetchCourseById(id: string): Promise<Course> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`);
  const data = await res.json();
  if (data.success) {
    return data.course;
  }
  throw new Error(data.message || 'Course not found');
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (data.success) {
    return data.course;
  }
  throw new Error(data.message || 'Failed to update course');
}

export async function uploadLessonVideoFile(
  courseId: string,
  moduleId: string,
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ videoUrl: string; fileName: string; fileSizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('videoFile', file);
    formData.append('videoSourceType', 'upload');

    xhr.open('POST', `${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success && data.lesson) {
          resolve({
            videoUrl: data.lesson.videoUrl,
            fileName: data.lesson.videoFileName,
            fileSizeBytes: data.lesson.videoFileSizeBytes,
          });
        } else {
          reject(new Error(data.message || 'Upload failed'));
        }
      } catch (e: any) {
        reject(new Error('Server error parsing response'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error uploading video'));
    xhr.send(formData);
  });
}

export async function updateLessonVideoUrl(
  courseId: string,
  moduleId: string,
  lessonId: string,
  videoUrl: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl, videoSourceType: 'url' }),
  });
  const data = await res.json();
  if (data.success) {
    return data.lesson;
  }
  throw new Error(data.message || 'Failed to update video URL');
}

export async function uploadLessonPdfResource(
  courseId: string,
  moduleId: string,
  lessonId: string,
  file: File,
  title: string,
  description?: string
): Promise<LessonResource> {
  const formData = new FormData();
  formData.append('pdfFile', file);
  formData.append('title', title);
  if (description) formData.append('description', description);

  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (data.success) {
    return data.resource;
  }
  throw new Error(data.message || 'Failed to upload PDF note');
}

export async function deleteLessonPdfResource(
  courseId: string,
  moduleId: string,
  lessonId: string,
  resourceId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete resource');
  }
}

export async function updateCourseMeeting(
  courseId: string,
  meeting: MeetingSchedule
): Promise<MeetingSchedule> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/meeting`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meeting),
  });
  const data = await res.json();
  if (data.success) {
    return data.meetingSchedule;
  }
  throw new Error(data.message || 'Failed to update meeting settings');
}

export async function fetchStudents(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/students`);
  const data = await res.json();
  if (data.success) {
    return data.students;
  }
  throw new Error(data.message || 'Failed to fetch students');
}

export async function createStudentApi(params: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  assignedCourseIds: string[];
}): Promise<User> {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success) {
    return data.student;
  }
  throw new Error(data.message || 'Failed to create student');
}

export async function fetchEnrollments(studentId?: string): Promise<Enrollment[]> {
  const url = studentId ? `${API_BASE}/api/enrollments?studentId=${encodeURIComponent(studentId)}` : `${API_BASE}/api/enrollments`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.success) {
    return data.enrollments;
  }
  throw new Error(data.message || 'Failed to fetch enrollments');
}

export async function toggleLessonProgressApi(
  studentId: string,
  courseId: string,
  lessonId: string
): Promise<{ isCompleted: boolean; completedLessonIds: string[] }> {
  const res = await fetch(`${API_BASE}/api/enrollments/toggle-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId, lessonId }),
  });
  const data = await res.json();
  if (data.success) {
    return { isCompleted: data.isCompleted, completedLessonIds: data.completedLessonIds };
  }
  throw new Error(data.message || 'Failed to update progress');
}

export async function loginApi(
  identifier: string,
  password: string,
  expectedRole?: string
): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password, expectedRole }),
  });
  const data = await res.json();
  if (data.success) {
    return { user: data.user };
  }
  throw new Error(data.message || 'Login failed');
}

// Module Management
export async function addModuleApi(
  courseId: string,
  params: { title: string; description?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to add module');
}

export async function updateModuleApi(
  courseId: string,
  moduleId: string,
  params: { title?: string; description?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to update module');
}

export async function deleteModuleApi(courseId: string, moduleId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to delete module');
}

// Lesson Management
export async function addLessonApi(
  courseId: string,
  moduleId: string,
  params: {
    title: string;
    description?: string;
    durationMinutes?: number;
    videoUrl?: string;
    videoSourceType?: 'upload' | 'url';
    isPublished?: boolean;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to add lesson');
}

export async function updateLessonApi(
  courseId: string,
  moduleId: string,
  lessonId: string,
  params: {
    title?: string;
    description?: string;
    durationMinutes?: number;
    videoUrl?: string;
    videoSourceType?: 'upload' | 'url';
    isPublished?: boolean;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to update lesson');
}

export async function deleteLessonApi(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (data.success) return data;
  throw new Error(data.message || 'Failed to delete lesson');
}

// Student Enrollment & Profile Updates
export async function updateStudentEnrollmentsApi(
  studentId: string,
  assignedCourseIds: string[]
): Promise<Enrollment[]> {
  const res = await fetch(`${API_BASE}/api/students/${studentId}/enrollments`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedCourseIds }),
  });
  const data = await res.json();
  if (data.success) return data.enrollments;
  throw new Error(data.message || 'Failed to update student enrollments');
}

export async function updateStudentProfileApi(
  studentId: string,
  updates: Partial<User> & { password?: string }
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/students/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (data.success) return data.student;
  throw new Error(data.message || 'Failed to update student profile');
}

// Access Code Redemption
export async function redeemAccessCodeApi(
  studentId: string,
  code: string
): Promise<{ course: Course; enrollment: Enrollment; message: string }> {
  const res = await fetch(`${API_BASE}/api/access-codes/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, code }),
  });
  const data = await res.json();
  if (data.success) {
    return { course: data.course, enrollment: data.enrollment, message: data.message };
  }
  throw new Error(data.message || 'Failed to redeem access code');
}

// Instant cross-tab broadcast helper
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('pathfinder_lms_sync');
  }
} catch (e) {
  // ignore if not supported
}

export function notifyDataChanged() {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ timestamp: Date.now() });
    }
  } catch (e) {
    // fallback
  }
}

export function subscribeDataChanges(callback: () => void): () => void {
  if (!syncChannel) return () => {};
  const handler = () => callback();
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}

