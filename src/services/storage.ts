import {
  Course,
  User,
  Enrollment,
  AuditLog,
  StudentNote,
  CourseModule,
  Lesson,
  LessonResource,
  MeetingSchedule,
} from '../types';
import { hashPassword, verifyPassword } from './crypto';

// Asset paths
import fullstackThumb from '../assets/images/course_fullstack_ai_1791546784790.jpg';
import manualTestingThumb from '../assets/images/course_manual_testing_1791546798145.jpg';
import avatarSarah from '../assets/images/avatar_student_sarah_1791546821186.jpg';
import avatarArjun from '../assets/images/avatar_student_arjun_1791546832854.jpg';

const STORAGE_KEYS = {
  COURSES: 'pathfinder_courses_v2',
  USERS: 'pathfinder_users_v2',
  ENROLLMENTS: 'pathfinder_enrollments_v2',
  AUDIT_LOGS: 'pathfinder_audit_logs_v2',
  NOTES: 'pathfinder_notes_v2',
  INITIALIZED: 'pathfinder_initialized_v2',
};

// Seed initial courses
const initialCourses: Course[] = [
  {
    id: 'fullstack-ai',
    title: 'Full Stack Development with AI Tools',
    slug: 'full-stack-development-ai-tools',
    category: 'development',
    summary: 'Master modern full-stack web engineering with React 19, TypeScript, Node.js, PostgreSQL, and generative AI developer tools.',
    description: 'Pathfinder’s flagship Full Stack Development program combines enterprise web application architecture with next-generation AI developer toolchains. You will learn to architect production-ready React 19 frontends, scalable Node.js/Express APIs, cloud relational databases, and integrate LLM APIs seamlessly into real-world applications.',
    duration: '16 Weeks • 120 Hours',
    price: 34999,
    level: 'Beginner to Advanced',
    thumbnailUrl: fullstackThumb,
    status: 'published',
    instructor: {
      name: 'Dr. Vikrant Kulkarni',
      title: 'Principal Software Architect & Lead Instructor',
      bio: '15+ years architecting cloud platforms, ex-Tech Lead at enterprise software firms, passionate mentor to thousands of developers.',
    },
    meetingSchedule: {
      title: 'Full Stack AI Cohort Weekly Live Masterclass & Code Review',
      platform: 'Google Meet',
      url: 'https://meet.google.com/pfd-fsai-tech',
      timeDescription: 'Tuesdays & Thursdays • 7:30 PM - 9:30 PM IST',
      date: 'Every Tuesday & Thursday',
      time: '7:30 PM - 9:30 PM IST',
      instructions: 'Please join 5 minutes early with your VS Code environment and Git branch prepared for interactive code reviews.',
      isPublished: true,
      nextSessionDate: 'Thursday at 7:30 PM IST',
    },
    modules: [
      {
        id: 'fs-mod-1',
        courseId: 'fullstack-ai',
        title: 'Module 1: Modern Web Foundations & TypeScript',
        orderIndex: 1,
        description: 'Semantic HTML5, advanced responsive CSS, modern JavaScript (ES2024), and rigorous TypeScript typing.',
        lessons: [
          {
            id: 'fs-l-1',
            moduleId: 'fs-mod-1',
            courseId: 'fullstack-ai',
            title: 'Course Introduction & Modern Developer Environment Setup',
            description: 'Orientation to Pathfinder learning methodology, setting up VS Code, Git version control, Node.js 22 LTS, and package managers.',
            durationMinutes: 28,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-fs-1',
                title: 'Pathfinder Full Stack Roadmap & Tooling Guide.pdf',
                description: 'Official curriculum roadmap, recommended VS Code plugins, and Git CLI cheat sheet.',
                type: 'pdf',
                url: '#',
                fileName: 'Pathfinder_FullStack_Roadmap.pdf',
                fileSizeBytes: 2450000,
                isPublished: true,
                uploadedAt: '2026-02-01T10:00:00Z',
              },
            ],
          },
          {
            id: 'fs-l-2',
            moduleId: 'fs-mod-1',
            courseId: 'fullstack-ai',
            title: 'TypeScript Type System & Strict Contract Engineering',
            description: 'Mastering interfaces, utility types, discriminating unions, generics, and compile-time type safety for scalable systems.',
            durationMinutes: 45,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            isPublished: true,
            orderIndex: 2,
            resources: [
              {
                id: 'res-fs-2',
                title: 'TypeScript Enterprise Design Patterns.pdf',
                description: 'Comprehensive guide to strict TypeScript type narrowing, generics, and Zod schema validation.',
                type: 'pdf',
                url: '#',
                fileName: 'TypeScript_Patterns.pdf',
                fileSizeBytes: 3120000,
                isPublished: true,
                uploadedAt: '2026-02-05T10:00:00Z',
              },
            ],
          },
        ],
      },
      {
        id: 'fs-mod-2',
        courseId: 'fullstack-ai',
        title: 'Module 2: React 19 Architecture & State Management',
        orderIndex: 2,
        description: 'Component lifecycles, hooks, memoization, performance profiling, and state machines.',
        lessons: [
          {
            id: 'fs-l-3',
            moduleId: 'fs-mod-2',
            courseId: 'fullstack-ai',
            title: 'React 19 Actions, useTransition, and Optimistic UI',
            description: 'Deep dive into React 19 primitives, non-blocking rendering, and instant user feedback architecture.',
            durationMinutes: 50,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-fs-3',
                title: 'React 19 Server Components & Actions Guide.pdf',
                description: 'Lecture notes on React 19 optimistic updates and async action transitions.',
                type: 'pdf',
                url: '#',
                fileName: 'React19_Guide.pdf',
                fileSizeBytes: 1840000,
                isPublished: true,
                uploadedAt: '2026-02-10T10:00:00Z',
              },
            ],
          },
        ],
      },
      {
        id: 'fs-mod-3',
        courseId: 'fullstack-ai',
        title: 'Module 3: Generative AI Developer Tools & LLM APIs',
        orderIndex: 3,
        description: 'Prompt engineering for developers, integrating Gemini API, and building intelligent full-stack applications.',
        lessons: [
          {
            id: 'fs-l-4',
            moduleId: 'fs-mod-3',
            courseId: 'fullstack-ai',
            title: 'Integrating Gemini API into Full Stack Applications',
            description: 'Calling Google Gemini SDK from Express backend, structured JSON outputs, system instructions, and streaming tokens.',
            durationMinutes: 55,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-fs-4',
                title: 'Gemini API Developer Handbook & Code Samples.pdf',
                description: 'Full stack implementation reference with structured outputs and token streaming.',
                type: 'pdf',
                url: '#',
                fileName: 'Gemini_Handbook.pdf',
                fileSizeBytes: 4200000,
                isPublished: true,
                uploadedAt: '2026-02-15T10:00:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'manual-testing',
    title: 'Manual Testing (Software Quality Engineering)',
    slug: 'manual-testing-quality-engineering',
    category: 'testing',
    summary: 'Master comprehensive Software QA: SDLC, STLC, Test Scenarios, Test Cases, Bug Lifecycle in Jira, Functional, Smoke, Regression, and UAT.',
    description: 'Pathfinder’s industry-accredited Manual Testing program transforms students into rigorous Quality Assurance engineers. You will learn the end-to-end testing lifecycle, author enterprise test plans and test case matrices, master boundary value analysis, log high-quality bug reports in Jira, perform smoke, regression, and user acceptance testing, and qualify enterprise software for production release.',
    duration: '12 Weeks • 90 Hours',
    price: 24999,
    level: 'Beginner to Intermediate',
    thumbnailUrl: manualTestingThumb,
    status: 'published',
    instructor: {
      name: 'Pooja Deshmukh',
      title: 'QA Lead & Test Automation Architect',
      bio: '12+ years in Quality Assurance, certified ISTQB Advanced Test Analyst, trained 1,500+ QA professionals.',
    },
    meetingSchedule: {
      title: 'Manual Testing QA Live Workshop & Defect Triage',
      platform: 'Zoom',
      url: 'https://zoom.us/j/pathfinder-qa-testing',
      timeDescription: 'Mondays & Wednesdays • 8:00 PM - 9:30 PM IST',
      date: 'Every Monday & Wednesday',
      time: '8:00 PM - 9:30 PM IST',
      instructions: 'Have your sample test case spreadsheet open and ready for live peer defect triage.',
      isPublished: true,
      nextSessionDate: 'Wednesday at 8:00 PM IST',
    },
    modules: [
      {
        id: 'mt-mod-1',
        courseId: 'manual-testing',
        title: 'Module 1: Software Testing Fundamentals & Quality Principles',
        orderIndex: 1,
        description: 'Why software fails, core testing principles, cost of defects, verification vs validation, and quality metrics.',
        lessons: [
          {
            id: 'mt-l-1',
            moduleId: 'mt-mod-1',
            courseId: 'manual-testing',
            title: 'Introduction to Software Testing & Quality Assurance Mindset',
            description: 'Understanding what a QA engineer does, why manual testing remains foundational, and the seven core principles of software testing.',
            durationMinutes: 32,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-mt-1',
                title: 'Software Testing Fundamentals Handbook.pdf',
                description: 'ISTQB Foundation syllabus primer, seven testing principles, and quality metrics.',
                type: 'pdf',
                url: '#',
                fileName: 'Testing_Fundamentals_Handbook.pdf',
                fileSizeBytes: 2890000,
                isPublished: true,
                uploadedAt: '2026-02-01T10:00:00Z',
              },
            ],
          },
          {
            id: 'mt-l-2',
            moduleId: 'mt-mod-1',
            courseId: 'manual-testing',
            title: 'Verification vs Validation & Quality Control vs Quality Assurance',
            description: 'Static testing vs dynamic testing, reviews, walkthroughs, inspections, and defect prevention paradigms.',
            durationMinutes: 38,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            isPublished: true,
            orderIndex: 2,
            resources: [
              {
                id: 'res-mt-2',
                title: 'Static Testing & Walkthrough Checklist.pdf',
                description: 'Formal inspection template and requirement review guidelines.',
                type: 'pdf',
                url: '#',
                fileName: 'Static_Testing_Checklist.pdf',
                fileSizeBytes: 1450000,
                isPublished: true,
                uploadedAt: '2026-02-05T10:00:00Z',
              },
            ],
          },
        ],
      },
      {
        id: 'mt-mod-2',
        courseId: 'manual-testing',
        title: 'Module 2: Test Scenarios & Test Case Authoring',
        orderIndex: 2,
        description: 'Boundary Value Analysis (BVA), Equivalence Class Partitioning (ECP), Decision Tables, and writing test cases in Excel/Jira.',
        lessons: [
          {
            id: 'mt-l-3',
            moduleId: 'mt-mod-2',
            courseId: 'manual-testing',
            title: 'Black-Box Test Design: BVA & Equivalence Partitioning',
            description: 'Practical calculation of boundary values, two-point vs three-point BVA, and identifying robust test partitions.',
            durationMinutes: 52,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-mt-3',
                title: 'Standard Test Case Document Template.pdf',
                description: 'Production-grade test case sheet with preconditions, test data, and expected results.',
                type: 'pdf',
                url: '#',
                fileName: 'Pathfinder_TestCase_Template.pdf',
                fileSizeBytes: 1980000,
                isPublished: true,
                uploadedAt: '2026-02-12T10:00:00Z',
              },
            ],
          },
        ],
      },
      {
        id: 'mt-mod-3',
        courseId: 'manual-testing',
        title: 'Module 3: Defect Management & Bug Life Cycle in Jira',
        orderIndex: 3,
        description: 'Logging defects that developers love, Jira workflow, Severity vs Priority, and Defect Triage.',
        lessons: [
          {
            id: 'mt-l-4',
            moduleId: 'mt-mod-3',
            courseId: 'manual-testing',
            title: 'The Bug Life Cycle & Professional Defect Reporting',
            description: 'Step-by-step defect lifecycle: New, Open, In Progress, Resolved, Verified, Closed, Reopened. Defect leakage vs defect density.',
            durationMinutes: 44,
            videoSourceType: 'url',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            isPublished: true,
            orderIndex: 1,
            resources: [
              {
                id: 'res-mt-4',
                title: 'Industry Standard Bug Report Template with Real Examples.pdf',
                description: 'Real-world bug reports with steps to reproduce, logs, and screenshots.',
                type: 'pdf',
                url: '#',
                fileName: 'Bug_Report_Template.pdf',
                fileSizeBytes: 3400000,
                isPublished: true,
                uploadedAt: '2026-02-18T10:00:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
];

class StorageService {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public async init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      await this.resetToDefaults();
    }
    this.isInitialized = true;
  }

  public async resetToDefaults() {
    // Hash requested initial admin credentials:
    // Username: pathfinder@3678
    // Password: Pathfinder@3678
    const adminPasswordHash = await hashPassword('Pathfinder@3678');
    const studentPasswordHash = await hashPassword('student123');

    const users: User[] = [
      {
        id: 'admin-owner-1',
        name: 'Pathfinder Administrator',
        email: 'pathfinder@3678', // Can log in with username or email
        username: 'pathfinder@3678',
        passwordHash: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'student-sarah-1',
        name: 'Sarah Patel',
        email: 'sarah.patel@student.pathfinder.edu',
        username: 'sarah.patel',
        passwordHash: studentPasswordHash,
        role: 'student',
        avatarUrl: avatarSarah,
        createdAt: '2026-02-01T10:00:00Z',
        lastLoginAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'student-arjun-1',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@student.pathfinder.edu',
        username: 'arjun.kumar',
        passwordHash: studentPasswordHash,
        role: 'student',
        avatarUrl: avatarArjun,
        createdAt: '2026-02-15T10:00:00Z',
        lastLoginAt: new Date().toISOString(),
        status: 'active',
      },
    ];

    // Seed enrollments:
    // Sarah is enrolled in Full Stack ONLY
    // Arjun is enrolled in Manual Testing ONLY
    const enrollments: Enrollment[] = [
      {
        id: 'enr-sarah-fs',
        studentId: 'student-sarah-1',
        courseId: 'fullstack-ai',
        enrolledAt: '2026-02-01T10:00:00Z',
        status: 'active',
        completedLessonIds: ['fs-l-1'],
        lastWatchedLessonId: 'fs-l-2',
        lastWatchedAt: '2026-10-08T10:00:00Z',
      },
      {
        id: 'enr-arjun-mt',
        studentId: 'student-arjun-1',
        courseId: 'manual-testing',
        enrolledAt: '2026-02-15T10:00:00Z',
        status: 'active',
        completedLessonIds: ['mt-l-1'],
        lastWatchedLessonId: 'mt-l-2',
        lastWatchedAt: '2026-10-07T14:00:00Z',
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'log-init-1',
        action: 'SYSTEM_INITIALIZED',
        details: 'Pathfinder secure database provisioned with role-based access control.',
        performedBy: 'System',
        timestamp: new Date().toISOString(),
        entityType: 'auth',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- Auth & User Management ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getStudents(): User[] {
    return this.getUsers().filter((u) => u.role === 'student');
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public findUserByIdentifier(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.getUsers().find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.username && u.username.toLowerCase() === clean)
    );
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public async authenticate(identifier: string, plainPassword: string): Promise<{ success: boolean; message: string; user?: User }> {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'Invalid credentials. User not found.' };
    }

    if (user.status === 'suspended') {
      return { success: false, message: 'This account has been deactivated. Please contact Pathfinder Administration.' };
    }

    const isValid = await verifyPassword(plainPassword, user.passwordHash);
    if (!isValid) {
      this.logAction('FAILED_LOGIN_ATTEMPT', `Failed login attempt for ${identifier}`, identifier, 'auth');
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveUser(user);
    this.logAction('SUCCESSFUL_LOGIN', `User ${user.email} (${user.role}) logged in`, user.email, 'auth');

    return { success: true, message: `Welcome back, ${user.name}!`, user };
  }

  public async createStudent(params: {
    name: string;
    email: string;
    phone?: string;
    plainPassword: string;
    assignedCourseIds: string[];
    performedBy: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = this.findUserByIdentifier(cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(params.plainPassword);
    const newStudentId = `student-${Date.now()}`;

    const newStudent: User = {
      id: newStudentId,
      name: params.name.trim(),
      email: cleanEmail,
      phone: params.phone || undefined,
      passwordHash,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.saveUser(newStudent);

    // Assign enrollments directly
    const enrollments = this.getEnrollments();
    params.assignedCourseIds.forEach((courseId) => {
      enrollments.push({
        id: `enr-${Date.now()}-${courseId}`,
        studentId: newStudentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: [],
      });
    });
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    this.logAction(
      'STUDENT_CREATED',
      `Admin created student ${newStudent.name} (${newStudent.email}) and assigned ${params.assignedCourseIds.join(', ')}`,
      params.performedBy,
      'student'
    );

    return { success: true, message: `Student account created for ${newStudent.name}!`, user: newStudent };
  }

  public setStudentStatus(studentId: string, status: 'active' | 'suspended', performedBy: string): void {
    const student = this.getUserById(studentId);
    if (student) {
      student.status = status;
      this.saveUser(student);
      this.logAction('STUDENT_STATUS_UPDATED', `Student ${student.email} set to ${status}`, performedBy, 'student');
    }
  }

  public async resetStudentPassword(studentId: string, newPlainPassword: string, performedBy: string): Promise<boolean> {
    const student = this.getUserById(studentId);
    if (!student) return false;
    student.passwordHash = await hashPassword(newPlainPassword);
    this.saveUser(student);
    this.logAction('PASSWORD_RESET', `Password reset for student ${student.email}`, performedBy, 'student');
    return true;
  }

  // --- Courses & Lessons ---
  public getCourses(): Course[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      return data ? JSON.parse(data) : initialCourses;
    } catch {
      return initialCourses;
    }
  }

  public getCourseById(courseId: string): Course | undefined {
    return this.getCourses().find((c) => c.id === courseId);
  }

  public saveCourse(course: Course, performedBy: string = 'admin'): void {
    const courses = this.getCourses();
    const index = courses.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      courses[index] = { ...course, updatedAt: new Date().toISOString() };
    } else {
      courses.push({ ...course, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    this.logAction('COURSE_SAVED', `Updated course: ${course.title}`, performedBy, 'course');
  }

  public deleteCourse(courseId: string, performedBy: string = 'admin'): void {
    const courses = this.getCourses().filter((c) => c.id !== courseId);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    this.logAction('COURSE_DELETED', `Deleted course ID: ${courseId}`, performedBy, 'course');
  }

  public updateLessonVideo(
    courseId: string,
    moduleId: string,
    lessonId: string,
    videoData: {
      videoSourceType: 'upload' | 'url';
      videoUrl: string;
      videoFileName?: string;
      videoFileSizeBytes?: number;
    },
    performedBy: string = 'admin'
  ): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return false;
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (!lesson) return false;

    lesson.videoSourceType = videoData.videoSourceType;
    lesson.videoUrl = videoData.videoUrl;
    lesson.videoFileName = videoData.videoFileName;
    lesson.videoFileSizeBytes = videoData.videoFileSizeBytes;

    this.saveCourse(course, performedBy);
    this.logAction('VIDEO_UPDATED', `Updated video for lesson "${lesson.title}" (${videoData.videoSourceType})`, performedBy, 'video');
    return true;
  }

  public addLessonResource(
    courseId: string,
    moduleId: string,
    lessonId: string,
    resource: LessonResource,
    performedBy: string = 'admin'
  ): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return false;
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (!lesson) return false;

    if (!lesson.resources) lesson.resources = [];
    lesson.resources.push(resource);

    this.saveCourse(course, performedBy);
    this.logAction('RESOURCE_UPLOADED', `Uploaded resource "${resource.title}" to lesson "${lesson.title}"`, performedBy, 'pdf');
    return true;
  }

  public deleteLessonResource(
    courseId: string,
    moduleId: string,
    lessonId: string,
    resourceId: string,
    performedBy: string = 'admin'
  ): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return false;
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (!lesson || !lesson.resources) return false;

    lesson.resources = lesson.resources.filter((r) => r.id !== resourceId);
    this.saveCourse(course, performedBy);
    this.logAction('RESOURCE_DELETED', `Deleted resource ${resourceId} from lesson "${lesson.title}"`, performedBy, 'pdf');
    return true;
  }

  public updateMeetingSchedule(
    courseId: string,
    meeting: MeetingSchedule,
    performedBy: string = 'admin'
  ): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    course.meetingSchedule = meeting;
    this.saveCourse(course, performedBy);
    this.logAction('MEETING_UPDATED', `Updated meeting link for "${course.title}"`, performedBy, 'meeting');
    return true;
  }

  // --- Strict Student Enrollments (NO ACCESS CODES) ---
  public getEnrollments(): Enrollment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getStudentEnrollments(studentId: string): Enrollment[] {
    return this.getEnrollments().filter((e) => e.studentId === studentId && e.status === 'active');
  }

  public isStudentAuthorizedForCourse(studentId: string, courseId: string): boolean {
    return this.getEnrollments().some((e) => e.studentId === studentId && e.courseId === courseId && e.status === 'active');
  }

  public updateStudentEnrollments(studentId: string, courseIds: string[], performedBy: string = 'admin'): void {
    let enrollments = this.getEnrollments().filter((e) => e.studentId !== studentId);
    courseIds.forEach((courseId) => {
      enrollments.push({
        id: `enr-${Date.now()}-${courseId}`,
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: [],
      });
    });
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    this.logAction('ENROLLMENT_ASSIGNED', `Updated enrolled courses for student ${studentId} to: ${courseIds.join(', ')}`, performedBy, 'student');
  }

  public toggleLessonCompleted(studentId: string, courseId: string, lessonId: string): boolean {
    const enrollments = this.getEnrollments();
    const target = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (!target) return false;

    const set = new Set(target.completedLessonIds || []);
    let isNowCompleted = false;
    if (set.has(lessonId)) {
      set.delete(lessonId);
      isNowCompleted = false;
    } else {
      set.add(lessonId);
      isNowCompleted = true;
    }

    target.completedLessonIds = Array.from(set);
    target.lastWatchedLessonId = lessonId;
    target.lastWatchedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    return isNowCompleted;
  }

  public updateLastWatched(studentId: string, courseId: string, lessonId: string): void {
    const enrollments = this.getEnrollments();
    const target = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (target) {
      target.lastWatchedLessonId = lessonId;
      target.lastWatchedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logAction(action: string, details: string, performedBy: string, entityType: AuditLog['entityType'] = 'auth'): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString(),
      entityType,
    };
    logs.unshift(newLog);
    if (logs.length > 250) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // --- Student Personal Notes ---
  public getNotes(studentId: string, lessonId: string): StudentNote | undefined {
    try {
      const notes: StudentNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
      return notes.find((n) => n.studentId === studentId && n.lessonId === lessonId);
    } catch {
      return undefined;
    }
  }

  public saveNote(note: StudentNote): void {
    try {
      const notes: StudentNote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
      const index = notes.findIndex((n) => n.studentId === note.studentId && n.lessonId === note.lessonId);
      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.unshift(note);
      }
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving note', e);
    }
  }
}

export const storage = new StorageService();
