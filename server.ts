import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Ensure data and uploads directory exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'pathfinder_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for uploaded video & PDF files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB limit
  },
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving with range requests support for video seeking
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Password Hashing Helper
function hashPassword(plainText: string, salt: string = 'pathfinder_salt_2026'): string {
  return crypto.createHash('sha256').update(plainText + salt).digest('hex');
}

// Database helper
interface DBState {
  courses: any[];
  users: any[];
  enrollments: any[];
  auditLogs: any[];
  notes: any[];
  accessCodes: any[];
}

function getInitialDB(): DBState {
  const adminHash = hashPassword('Pathfinder@3678');
  const studentHash = hashPassword('student123');

  return {
    courses: [
      {
        id: 'fullstack-ai',
        title: 'Full Stack Development with AI Tools',
        slug: 'full-stack-development-ai-tools',
        category: 'development',
        summary: 'Master modern full-stack engineering with React 19, TypeScript, Node.js, PostgreSQL, and cutting-edge generative AI developer workflows.',
        description: 'Pathfinder’s flagship Full Stack Development program combines enterprise web application architecture with next-generation AI developer toolchains. Learn to architect production-ready React 19 frontends, scalable Node.js/Express REST APIs, cloud relational databases, and integrate LLM APIs seamlessly into real-world applications.',
        duration: '16 Weeks • 120 Hours',
        price: 34999,
        level: 'Beginner to Advanced',
        thumbnailUrl: '/pathfinder_logo.jpg',
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
            description: 'Semantic HTML5, responsive CSS, modern JavaScript (ES2024), and strict TypeScript typing.',
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
                    uploadedAt: new Date().toISOString(),
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
                    uploadedAt: new Date().toISOString(),
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
                    uploadedAt: new Date().toISOString(),
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
        thumbnailUrl: '/pathfinder_logo.jpg',
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
                    uploadedAt: new Date().toISOString(),
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
                id: 'mt-l-2',
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
                    id: 'res-mt-2',
                    title: 'Standard Test Case Document Template.pdf',
                    description: 'Production-grade test case sheet with preconditions, test data, and expected results.',
                    type: 'pdf',
                    url: '#',
                    fileName: 'Pathfinder_TestCase_Template.pdf',
                    fileSizeBytes: 1980000,
                    isPublished: true,
                    uploadedAt: new Date().toISOString(),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    users: [
      {
        id: 'admin-owner-1',
        name: 'Pathfinder Administrator',
        email: 'pathfinder@3678',
        username: 'pathfinder@3678',
        passwordHash: adminHash,
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
        passwordHash: studentHash,
        role: 'student',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'student-arjun-1',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@student.pathfinder.edu',
        username: 'arjun.kumar',
        passwordHash: studentHash,
        role: 'student',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: 'active',
      },
    ],
    enrollments: [
      {
        id: 'enr-sarah-fs',
        studentId: 'student-sarah-1',
        courseId: 'fullstack-ai',
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: ['fs-l-1'],
        lastWatchedLessonId: 'fs-l-2',
      },
      {
        id: 'enr-arjun-mt',
        studentId: 'student-arjun-1',
        courseId: 'manual-testing',
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: ['mt-l-1'],
        lastWatchedLessonId: 'mt-l-2',
      },
    ],
    auditLogs: [],
    notes: [],
    accessCodes: [
      {
        id: 'code-1',
        code: 'FULLSTACK-PRO-2026',
        courseId: 'fullstack-ai',
        expiresAt: '2028-12-31T23:59:59.000Z',
        usageLimit: 100,
        timesUsed: 0,
        isActive: true,
      },
      {
        id: 'code-2',
        code: 'MANUAL-QA-2026',
        courseId: 'manual-testing',
        expiresAt: '2028-12-31T23:59:59.000Z',
        usageLimit: 100,
        timesUsed: 0,
        isActive: true,
      },
    ],
  };
}

function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DBState = JSON.parse(content);
      if (!parsed.accessCodes) {
        parsed.accessCodes = getInitialDB().accessCodes;
        saveDB(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
  }
  const initial = getInitialDB();
  saveDB(initial);
  return initial;
}

function saveDB(data: DBState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// Initial load
loadDB();

// ==========================================
// REST API ROUTES
// ==========================================

// 1. COURSES
app.get('/api/courses', (_req, res) => {
  const db = loadDB();
  res.json({ success: true, courses: db.courses });
});

app.get('/api/courses/:id', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  res.json({ success: true, course });
});

app.put('/api/courses/:id', (req, res) => {
  const db = loadDB();
  const index = db.courses.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  db.courses[index] = {
    ...db.courses[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDB(db);
  res.json({ success: true, course: db.courses[index] });
});

app.post('/api/courses', (req, res) => {
  const db = loadDB();
  const newCourse = {
    ...req.body,
    id: req.body.id || `course-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    modules: req.body.modules || [],
  };
  db.courses.push(newCourse);
  saveDB(db);
  res.json({ success: true, course: newCourse });
});

app.delete('/api/courses/:id', (req, res) => {
  const db = loadDB();
  db.courses = db.courses.filter((c) => c.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Course deleted' });
});

// COURSE THUMBNAIL UPLOAD OR URL
app.post('/api/courses/:id/thumbnail', upload.single('thumbnailFile'), (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (req.file) {
    course.thumbnailUrl = `/api/uploads/${req.file.filename}`;
  } else if (req.body.thumbnailUrl) {
    course.thumbnailUrl = req.body.thumbnailUrl.trim();
  }
  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, thumbnailUrl: course.thumbnailUrl, course });
});

// MODULE MANAGEMENT (ADD, EDIT, DELETE)
app.post('/api/courses/:courseId/modules', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (!course.modules) course.modules = [];

  const newModule = {
    id: `mod-${Date.now()}`,
    courseId: course.id,
    title: req.body.title || `Module ${course.modules.length + 1}`,
    description: req.body.description || '',
    orderIndex: course.modules.length + 1,
    lessons: [],
  };

  course.modules.push(newModule);
  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, module: newModule, course });
});

app.put('/api/courses/:courseId/modules/:moduleId', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const mod = course.modules?.find((m: any) => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

  if (req.body.title) mod.title = req.body.title.trim();
  if (req.body.description !== undefined) mod.description = req.body.description.trim();

  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, module: mod, course });
});

app.delete('/api/courses/:courseId/modules/:moduleId', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  course.modules = course.modules.filter((m: any) => m.id !== req.params.moduleId);
  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, message: 'Module deleted', course });
});

// LESSON MANAGEMENT (ADD, EDIT, DELETE)
app.post('/api/courses/:courseId/modules/:moduleId/lessons', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const mod = course.modules?.find((m: any) => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

  if (!mod.lessons) mod.lessons = [];

  const newLesson = {
    id: `l-${Date.now()}`,
    moduleId: mod.id,
    courseId: course.id,
    title: req.body.title || `Lesson ${mod.lessons.length + 1}`,
    description: req.body.description || 'Lesson description and class materials.',
    durationMinutes: Number(req.body.durationMinutes) || 30,
    videoSourceType: req.body.videoSourceType || 'url',
    videoUrl: req.body.videoUrl || '',
    isPublished: req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true,
    orderIndex: mod.lessons.length + 1,
    resources: [],
  };

  mod.lessons.push(newLesson);
  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, lesson: newLesson, course });
});

app.put('/api/courses/:courseId/modules/:moduleId/lessons/:lessonId', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const mod = course.modules?.find((m: any) => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

  const lesson = mod.lessons?.find((l: any) => l.id === req.params.lessonId);
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

  if (req.body.title !== undefined) lesson.title = req.body.title.trim();
  if (req.body.description !== undefined) lesson.description = req.body.description.trim();
  if (req.body.durationMinutes !== undefined) lesson.durationMinutes = Number(req.body.durationMinutes);
  if (req.body.videoUrl !== undefined) lesson.videoUrl = req.body.videoUrl.trim();
  if (req.body.videoSourceType !== undefined) lesson.videoSourceType = req.body.videoSourceType;
  if (req.body.isPublished !== undefined) lesson.isPublished = Boolean(req.body.isPublished);

  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, lesson, course });
});

app.delete('/api/courses/:courseId/modules/:moduleId/lessons/:lessonId', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const mod = course.modules?.find((m: any) => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

  mod.lessons = mod.lessons.filter((l: any) => l.id !== req.params.lessonId);
  course.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, message: 'Lesson deleted', course });
});

// 2. VIDEO MANAGEMENT: DESKTOP UPLOAD & VIDEO URL
app.post(
  '/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/video',
  upload.single('videoFile'),
  (req, res) => {
    const db = loadDB();
    const { courseId, moduleId, lessonId } = req.params;

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const mod = course.modules.find((m: any) => m.id === moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

    const lesson = mod.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    // File upload vs URL
    if (req.file) {
      const publicPath = `/api/uploads/${req.file.filename}`;
      lesson.videoSourceType = 'upload';
      lesson.videoUrl = publicPath;
      lesson.videoFileName = req.file.originalname;
      lesson.videoFileSizeBytes = req.file.size;
    } else if (req.body.videoUrl) {
      lesson.videoSourceType = req.body.videoSourceType || 'url';
      lesson.videoUrl = req.body.videoUrl.trim();
    }

    if (req.body.title) lesson.title = req.body.title;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.durationMinutes) lesson.durationMinutes = Number(req.body.durationMinutes);

    course.updatedAt = new Date().toISOString();
    saveDB(db);

    res.json({
      success: true,
      message: 'Video updated successfully',
      lesson,
    });
  }
);

// 3. PDF NOTES & RESOURCES UPLOAD & MANAGEMENT
app.post(
  '/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources',
  upload.single('pdfFile'),
  (req, res) => {
    const db = loadDB();
    const { courseId, moduleId, lessonId } = req.params;

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const mod = course.modules.find((m: any) => m.id === moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

    const lesson = mod.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (!lesson.resources) lesson.resources = [];

    let fileUrl = '#';
    let fileName = req.body.fileName || 'document.pdf';
    let fileSize = 0;

    if (req.file) {
      fileUrl = `/api/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const newResource = {
      id: `res-${Date.now()}`,
      title: req.body.title || fileName,
      description: req.body.description || '',
      type: req.body.type || 'pdf',
      url: fileUrl,
      fileName,
      fileSizeBytes: fileSize,
      isPublished: true,
      uploadedAt: new Date().toISOString(),
    };

    lesson.resources.push(newResource);
    course.updatedAt = new Date().toISOString();
    saveDB(db);

    res.json({
      success: true,
      message: 'PDF note uploaded and attached successfully',
      resource: newResource,
    });
  }
);

app.delete(
  '/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources/:resourceId',
  (req, res) => {
    const db = loadDB();
    const { courseId, moduleId, lessonId, resourceId } = req.params;

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const mod = course.modules.find((m: any) => m.id === moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

    const lesson = mod.lessons.find((l: any) => l.id === lessonId);
    if (!lesson || !lesson.resources) return res.status(404).json({ success: false, message: 'Resource not found' });

    lesson.resources = lesson.resources.filter((r: any) => r.id !== resourceId);
    course.updatedAt = new Date().toISOString();
    saveDB(db);

    res.json({ success: true, message: 'Resource deleted successfully' });
  }
);

// 4. MEETING LINKS
app.put('/api/courses/:courseId/meeting', (req, res) => {
  const db = loadDB();
  const course = db.courses.find((c) => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  course.meetingSchedule = req.body;
  course.updatedAt = new Date().toISOString();
  saveDB(db);

  res.json({ success: true, message: 'Meeting settings saved', meetingSchedule: course.meetingSchedule });
});

// 5. AUTHENTICATION & USERS
app.post('/api/auth/login', (req, res) => {
  const db = loadDB();
  const { identifier, password, expectedRole } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password required' });
  }

  const clean = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.username && u.username.toLowerCase() === clean)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Account not found with this identifier' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }

  const computedHash = hashPassword(password);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      success: false,
      message: expectedRole === 'admin' ? 'Administrator credentials required' : 'Student credentials required',
    });
  }

  user.lastLoginAt = new Date().toISOString();
  saveDB(db);

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, message: `Welcome, ${safeUser.name}!`, user: safeUser });
});

// 6. STUDENTS & ENROLLMENTS
app.get('/api/students', (_req, res) => {
  const db = loadDB();
  const students = db.users
    .filter((u) => u.role === 'student')
    .map(({ passwordHash, ...u }) => u);
  res.json({ success: true, students });
});

app.post('/api/students', (req, res) => {
  const db = loadDB();
  const { name, email, phone, password, assignedCourseIds } = req.body;

  const cleanEmail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Student email already exists' });
  }

  const newId = `student-${Date.now()}`;
  const newUser = {
    id: newId,
    name: name.trim(),
    email: cleanEmail,
    phone: phone || '',
    passwordHash: hashPassword(password || 'student123'),
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Enroll in assigned courses
  if (Array.isArray(assignedCourseIds)) {
    assignedCourseIds.forEach((courseId) => {
      db.enrollments.push({
        id: `enr-${Date.now()}-${courseId}`,
        studentId: newId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: [],
      });
    });
  }

  saveDB(db);
  const { passwordHash: _, ...safeUser } = newUser;
  res.json({ success: true, message: `Student account created for ${safeUser.name}!`, student: safeUser });
});

// Update Student Profile or Password (Admin or Student)
app.put('/api/students/:id', (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Student account not found' });

  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.email) user.email = req.body.email.trim().toLowerCase();
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.status) user.status = req.body.status;
  if (req.body.password) {
    user.passwordHash = hashPassword(req.body.password);
  }

  saveDB(db);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, message: 'Student profile updated successfully', student: safeUser });
});

// Admin: Update Student's Assigned Courses / Enrollments
app.put('/api/students/:id/enrollments', (req, res) => {
  const db = loadDB();
  const studentId = req.params.id;
  const user = db.users.find((u) => u.id === studentId);
  if (!user) return res.status(404).json({ success: false, message: 'Student account not found' });

  const { assignedCourseIds } = req.body;
  if (!Array.isArray(assignedCourseIds)) {
    return res.status(400).json({ success: false, message: 'assignedCourseIds must be an array' });
  }

  // Current enrollments for this student
  const existingForStudent = db.enrollments.filter((e) => e.studentId === studentId);

  // Deactivate or remove any unassigned
  existingForStudent.forEach((enr) => {
    if (!assignedCourseIds.includes(enr.courseId)) {
      enr.status = 'inactive';
    } else {
      enr.status = 'active';
    }
  });

  // Add any new courses not already enrolled
  assignedCourseIds.forEach((courseId) => {
    const existing = existingForStudent.find((e) => e.courseId === courseId);
    if (!existing) {
      db.enrollments.push({
        id: `enr-${Date.now()}-${courseId}`,
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: [],
      });
    }
  });

  saveDB(db);
  const updatedEnrollments = db.enrollments.filter((e) => e.studentId === studentId && e.status === 'active');
  res.json({ success: true, message: 'Student course access updated', enrollments: updatedEnrollments });
});

// Access Code Redemption (Student unlocks course via code)
app.post('/api/access-codes/redeem', (req, res) => {
  const db = loadDB();
  const { studentId, code } = req.body;

  if (!studentId || !code) {
    return res.status(400).json({ success: false, message: 'Student ID and Access Code are required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const accessCode = db.accessCodes?.find(
    (c) => c.code.toUpperCase() === cleanCode && c.isActive
  );

  if (!accessCode) {
    return res.status(400).json({ success: false, message: 'Invalid or expired course access code.' });
  }

  if (accessCode.expiresAt && new Date(accessCode.expiresAt) < new Date()) {
    return res.status(400).json({ success: false, message: 'This access code has expired.' });
  }

  if (accessCode.usageLimit && (accessCode.timesUsed || 0) >= accessCode.usageLimit) {
    return res.status(400).json({ success: false, message: 'This access code has reached its maximum redemptions.' });
  }

  // Check if course exists
  const targetCourse = db.courses.find((c) => c.id === accessCode.courseId);
  if (!targetCourse) {
    return res.status(404).json({ success: false, message: 'Target course not found' });
  }

  // Check if student already enrolled
  let enr = db.enrollments.find((e) => e.studentId === studentId && e.courseId === accessCode.courseId);
  if (enr && enr.status === 'active') {
    return res.status(400).json({
      success: false,
      message: `You are already enrolled in "${targetCourse.title}".`,
    });
  }

  if (enr) {
    enr.status = 'active';
  } else {
    enr = {
      id: `enr-${Date.now()}-${accessCode.courseId}`,
      studentId,
      courseId: accessCode.courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      completedLessonIds: [],
    };
    db.enrollments.push(enr);
  }

  accessCode.timesUsed = (accessCode.timesUsed || 0) + 1;
  saveDB(db);

  res.json({
    success: true,
    message: `Congratulations! You have unlocked "${targetCourse.title}".`,
    course: targetCourse,
    enrollment: enr,
  });
});

app.get('/api/enrollments', (req, res) => {
  const db = loadDB();
  const { studentId } = req.query;
  let list = db.enrollments;
  if (studentId) {
    list = list.filter((e) => e.studentId === studentId && e.status === 'active');
  }
  res.json({ success: true, enrollments: list });
});

app.post('/api/enrollments/toggle-lesson', (req, res) => {
  const db = loadDB();
  const { studentId, courseId, lessonId } = req.body;

  const enr = db.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
  if (!enr) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  const set = new Set(enr.completedLessonIds || []);
  let isCompleted = false;
  if (set.has(lessonId)) {
    set.delete(lessonId);
    isCompleted = false;
  } else {
    set.add(lessonId);
    isCompleted = true;
  }

  enr.completedLessonIds = Array.from(set);
  enr.lastWatchedLessonId = lessonId;
  enr.lastWatchedAt = new Date().toISOString();
  saveDB(db);

  res.json({ success: true, isCompleted, completedLessonIds: enr.completedLessonIds });
});

// ==========================================
// VITE SPA MIDDLEWARE / PRODUCTION STATIC
// ==========================================
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Pathfinder Dynamic LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
