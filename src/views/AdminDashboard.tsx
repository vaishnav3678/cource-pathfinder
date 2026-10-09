import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { storage } from '../services/storage';
import { saveMediaFile, deleteMediaFile } from '../services/mediaStore';
import { Course, CourseModule, Lesson, User, Enrollment, LessonResource, MeetingSchedule } from '../types';
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  Link as LinkIcon,
  Calendar,
  Lock,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileUp,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'videos' | 'resources' | 'students' | 'meetings' | 'logs'>('overview');

  // State data
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Video Management Modal / Interface
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState('fullstack-ai');
  const [targetModuleId, setTargetModuleId] = useState('');
  const [targetLessonId, setTargetLessonId] = useState('');
  const [videoSourceMode, setVideoSourceMode] = useState<'upload' | 'url'>('upload');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF & Resource Upload Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfCourseId, setPdfCourseId] = useState('fullstack-ai');
  const [pdfModuleId, setPdfModuleId] = useState('');
  const [pdfLessonId, setPdfLessonId] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Create Student Modal
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('student123');
  const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>(['fullstack-ai']);

  // Edit Meeting Schedule
  const [meetingTargetCourse, setMeetingTargetCourse] = useState('fullstack-ai');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<'Google Meet' | 'Zoom' | 'Microsoft Teams'>('Google Meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTimeDesc, setMeetingTimeDesc] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingInstructions, setMeetingInstructions] = useState('');
  const [meetingIsPublished, setMeetingIsPublished] = useState(true);

  // Search filter
  const [searchStudentQuery, setSearchStudentQuery] = useState('');

  const refreshAllData = () => {
    const loadedCourses = storage.getCourses();
    setCourses(loadedCourses);
    setStudents(storage.getStudents());
    setEnrollments(storage.getEnrollments());

    // Defaults for selectors
    if (loadedCourses.length > 0) {
      const defaultCourse = loadedCourses[0];
      setTargetCourseId(defaultCourse.id);
      setPdfCourseId(defaultCourse.id);
      if (defaultCourse.modules.length > 0) {
        setTargetModuleId(defaultCourse.modules[0].id);
        setPdfModuleId(defaultCourse.modules[0].id);
        if (defaultCourse.modules[0].lessons.length > 0) {
          setTargetLessonId(defaultCourse.modules[0].lessons[0].id);
          setPdfLessonId(defaultCourse.modules[0].lessons[0].id);
        }
      }
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Sync Meeting Form when course changes
  useEffect(() => {
    const c = courses.find((item) => item.id === meetingTargetCourse);
    if (c?.meetingSchedule) {
      setMeetingTitle(c.meetingSchedule.title || `${c.title} Live Session`);
      setMeetingPlatform(c.meetingSchedule.platform || 'Google Meet');
      setMeetingUrl(c.meetingSchedule.url || '');
      setMeetingTimeDesc(c.meetingSchedule.timeDescription || '');
      setMeetingDate(c.meetingSchedule.date || '');
      setMeetingTime(c.meetingSchedule.time || '');
      setMeetingInstructions(c.meetingSchedule.instructions || '');
      setMeetingIsPublished(c.meetingSchedule.isPublished ?? true);
    } else if (c) {
      setMeetingTitle(`${c.title} Live Masterclass`);
      setMeetingPlatform('Google Meet');
      setMeetingUrl('');
      setMeetingTimeDesc('Tuesdays & Thursdays • 7:30 PM IST');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingInstructions('');
      setMeetingIsPublished(true);
    }
  }, [meetingTargetCourse, courses]);

  if (!isAdmin) {
    onNavigate('admin-login');
    return null;
  }

  // --- VIDEO UPLOAD HANDLERS ---
  const handleOpenVideoModal = (courseId: string, moduleId: string, lessonId: string) => {
    setTargetCourseId(courseId);
    setTargetModuleId(moduleId);
    setTargetLessonId(lessonId);

    const c = courses.find((item) => item.id === courseId);
    const m = c?.modules.find((item) => item.id === moduleId);
    const l = m?.lessons.find((item) => item.id === lessonId);

    if (l) {
      setVideoSourceMode(l.videoSourceType || 'upload');
      setVideoUrlInput(l.videoSourceType === 'url' ? l.videoUrl : '');
    }
    setSelectedVideoFile(null);
    setUploadProgress(0);
    setVideoModalOpen(true);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video format (MP4, WebM, Quicktime)
    if (!file.type.startsWith('video/')) {
      error('Please select a valid video file (MP4, WebM, etc.).');
      return;
    }

    // Size limit check (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      error('Video size exceeds 500MB limit. Please compress before uploading.');
      return;
    }

    setSelectedVideoFile(file);
    success(`Selected video file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (videoSourceMode === 'upload') {
      if (!selectedVideoFile) {
        error('Please choose a video file from your computer.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      try {
        // Simulate progress bar smoothly while saving to IndexedDB / Storage
        const progressTimer = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressTimer);
              return 90;
            }
            return prev + 20;
          });
        }, 150);

        const mediaId = `vid-${targetCourseId}-${targetLessonId}-${Date.now()}`;
        const blobUrl = await saveMediaFile(mediaId, selectedVideoFile, selectedVideoFile.name);

        clearInterval(progressTimer);
        setUploadProgress(100);

        storage.updateLessonVideo(
          targetCourseId,
          targetModuleId,
          targetLessonId,
          {
            videoSourceType: 'upload',
            videoUrl: blobUrl,
            videoFileName: selectedVideoFile.name,
            videoFileSizeBytes: selectedVideoFile.size,
          },
          user?.email || 'admin'
        );

        success(`Video file "${selectedVideoFile.name}" uploaded successfully!`);
        setIsUploading(false);
        setVideoModalOpen(false);
        refreshAllData();
      } catch (err: any) {
        setIsUploading(false);
        error('Failed to upload video file: ' + err.message);
      }
    } else {
      // URL Mode
      if (!videoUrlInput.trim()) {
        error('Please enter a valid video stream URL.');
        return;
      }

      storage.updateLessonVideo(
        targetCourseId,
        targetModuleId,
        targetLessonId,
        {
          videoSourceType: 'url',
          videoUrl: videoUrlInput.trim(),
        },
        user?.email || 'admin'
      );

      success('Video URL updated and saved successfully!');
      setVideoModalOpen(false);
      refreshAllData();
    }
  };

  // --- PDF UPLOAD HANDLERS ---
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      error('Please select a valid PDF file.');
      return;
    }

    setSelectedPdfFile(file);
    if (!pdfTitle) {
      setPdfTitle(file.name.replace(/\.pdf$/i, ''));
    }
    success(`Selected PDF: ${file.name}`);
  };

  const handleSavePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      error('Please select a PDF file from your computer.');
      return;
    }
    if (!pdfTitle.trim()) {
      error('Please enter a title for this PDF note.');
      return;
    }

    setIsUploadingPdf(true);
    try {
      const mediaId = `pdf-${pdfCourseId}-${pdfLessonId}-${Date.now()}`;
      const blobUrl = await saveMediaFile(mediaId, selectedPdfFile, selectedPdfFile.name);

      const newResource: LessonResource = {
        id: `res-${Date.now()}`,
        title: pdfTitle.trim(),
        description: pdfDescription.trim() || undefined,
        type: 'pdf',
        url: blobUrl,
        fileName: selectedPdfFile.name,
        fileSizeBytes: selectedPdfFile.size,
        isPublished: true,
        uploadedAt: new Date().toISOString(),
      };

      storage.addLessonResource(pdfCourseId, pdfModuleId, pdfLessonId, newResource, user?.email || 'admin');

      success(`PDF note "${pdfTitle}" attached to course lesson!`);
      setIsUploadingPdf(false);
      setPdfModalOpen(false);
      setSelectedPdfFile(null);
      setPdfTitle('');
      setPdfDescription('');
      refreshAllData();
    } catch (err: any) {
      setIsUploadingPdf(false);
      error('Failed to upload PDF: ' + err.message);
    }
  };

  // --- STUDENT CREATION & ENROLLMENT HANDLERS ---
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim() || !newStudentPassword) {
      error('All required fields must be filled.');
      return;
    }

    if (assignedCourseIds.length === 0) {
      error('Please assign at least one course (Full Stack or Manual Testing) to the student.');
      return;
    }

    const res = await storage.createStudent({
      name: newStudentName,
      email: newStudentEmail,
      phone: newStudentPhone || undefined,
      plainPassword: newStudentPassword,
      assignedCourseIds,
      performedBy: user?.email || 'admin',
    });

    if (res.success) {
      success(res.message);
      setStudentModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPhone('');
      setNewStudentPassword('student123');
      refreshAllData();
    } else {
      error(res.message);
    }
  };

  const handleToggleCourseForStudent = (courseId: string) => {
    if (assignedCourseIds.includes(courseId)) {
      setAssignedCourseIds(assignedCourseIds.filter((id) => id !== courseId));
    } else {
      setAssignedCourseIds([...assignedCourseIds, courseId]);
    }
  };

  // --- MEETING SCHEDULE SAVE ---
  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl.trim()) {
      error('Please provide a meeting URL.');
      return;
    }

    const schedule: MeetingSchedule = {
      title: meetingTitle,
      platform: meetingPlatform,
      url: meetingUrl,
      timeDescription: meetingTimeDesc,
      date: meetingDate || undefined,
      time: meetingTime || undefined,
      instructions: meetingInstructions || undefined,
      isPublished: meetingIsPublished,
      nextSessionDate: meetingTimeDesc,
    };

    storage.updateMeetingSchedule(meetingTargetCourse, schedule, user?.email || 'admin');
    success(`Updated live meeting settings for course!`);
    refreshAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0B2147] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-blue-950 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Internal Console
            </div>
            <h2 className="text-base font-extrabold text-white">Pathfinder Admin</h2>
          </div>
          <Shield className="w-5 h-5 text-blue-300" />
        </div>

        <nav className="p-4 space-y-1 text-xs font-semibold flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Management</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>Desktop Video Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>PDF Notes & Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Accounts & Access</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'meetings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Meeting Links</span>
          </button>
        </nav>

        <div className="p-4 border-t border-blue-950 text-[11px] text-slate-400">
          Admin: {user?.username || user?.email}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B2147] capitalize">
              {activeTab === 'overview' && 'Executive LMS Dashboard'}
              {activeTab === 'courses' && 'Course & Syllabus Management'}
              {activeTab === 'videos' && 'Desktop Video Upload & URL Manager'}
              {activeTab === 'resources' && 'PDF Notes & Learning Resources'}
              {activeTab === 'students' && 'Student Accounts & Course Enrollments'}
              {activeTab === 'meetings' && 'Live Classrooms & Meeting Links'}
            </h1>
            <p className="text-xs text-slate-500">
              Real-time database records and administrative controls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllData}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'students' && (
              <button
                onClick={() => setStudentModalOpen(true)}
                className="px-4 py-2 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Student</span>
              </button>
            )}

            {activeTab === 'resources' && (
              <button
                onClick={() => setPdfModalOpen(true)}
                className="px-4 py-2 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <FileUp className="w-4 h-4" />
                <span>Upload PDF Note</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Enrolled Students
                </div>
                <div className="text-2xl font-extrabold text-[#0B2147] font-mono tabular-nums">
                  {students.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Active in database
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Active Courses
                </div>
                <div className="text-2xl font-extrabold text-[#0B2147] font-mono tabular-nums">
                  {courses.length}
                </div>
                <div className="text-[11px] text-blue-600 font-semibold mt-1">
                  Full Stack & QA
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Lessons
                </div>
                <div className="text-2xl font-extrabold text-[#0B2147] font-mono tabular-nums">
                  {courses.reduce((acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0), 0)}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  Video masterclasses
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Enrollments
                </div>
                <div className="text-2xl font-extrabold text-[#0B2147] font-mono tabular-nums">
                  {enrollments.length}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1">
                  Course allocations
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#0B2147]">Active Programs</h3>
                <div className="space-y-3">
                  {courses.map((course) => {
                    const enrCount = enrollments.filter((e) => e.courseId === course.id).length;
                    return (
                      <div
                        key={course.id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{course.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {course.modules.length} Modules • {course.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-blue-700">
                            {enrCount} Student{enrCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Video Upload Action */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#0B2147]">Quick Desktop Video Upload</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select any course lesson to upload an MP4/WebM video file directly from your computer or attach an authorized video stream URL.
                </p>
                <button
                  onClick={() => setActiveTab('videos')}
                  className="px-4 py-2.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Open Video Upload Manager</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#0B2147]">{course.title}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {course.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">{course.summary}</p>
                      <div className="text-xs text-slate-400 mt-1">
                        {course.duration} • ₹{course.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('learn', { courseId: course.id })}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Course</span>
                    </button>
                  </div>
                </div>

                {/* Modules & Lessons with Video & Resource indicators */}
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Syllabus Modules & Lesson Assets
                  </h4>
                  <div className="space-y-3">
                    {course.modules.map((mod) => (
                      <div key={mod.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{mod.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{mod.lessons.length} Lessons</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          {mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between text-xs p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 bg-white"
                            >
                              <div className="flex items-center gap-2.5 truncate max-w-md">
                                <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">{lesson.title}</span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  lesson.videoSourceType === 'upload' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {lesson.videoSourceType === 'upload' ? 'Desktop Upload' : 'Video URL'}
                                </span>

                                <button
                                  onClick={() => handleOpenVideoModal(course.id, mod.id, lesson.id)}
                                  className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 text-blue-700 rounded text-[11px] font-semibold transition-colors"
                                >
                                  Manage Video
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DESKTOP VIDEO UPLOADS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#0B2147]">Direct Video File Upload from Computer</h3>
                <p className="text-xs text-slate-500">
                  Select a course and lesson below to upload an MP4/WebM video file directly from your local desktop, or specify an external video URL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {courses.map((course) => (
                  <div key={course.id} className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                      <span className="text-[10px] font-bold text-blue-700 uppercase">
                        {course.duration}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {course.modules.flatMap((m) =>
                        m.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="truncate">
                              <div className="font-semibold text-slate-800 truncate">{lesson.title}</div>
                              <div className="text-[10px] text-slate-400">
                                Source: {lesson.videoSourceType === 'upload' ? (lesson.videoFileName || 'Uploaded Video') : 'Stream URL'}
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenVideoModal(course.id, m.id, lesson.id)}
                              className="px-3 py-1.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload Video</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PDF NOTES & LEARNING RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B2147]">Course PDF Notes & Handbooks</h3>
                  <p className="text-xs text-slate-500">
                    Uploaded PDF documents associated with course lessons. Authorized students can view and download these directly.
                  </p>
                </div>
                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="px-4 py-2 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New PDF</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {courses.map((course) => {
                  const courseResources: { resource: LessonResource; modTitle: string; lessonTitle: string; modId: string; lessonId: string }[] = [];
                  course.modules.forEach((m) => {
                    m.lessons.forEach((l) => {
                      if (l.resources) {
                        l.resources.forEach((r) => {
                          courseResources.push({
                            resource: r,
                            modTitle: m.title,
                            lessonTitle: l.title,
                            modId: m.id,
                            lessonId: l.id,
                          });
                        });
                      }
                    });
                  });

                  return (
                    <div key={course.id} className="border border-slate-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                        <span className="text-xs text-slate-500">{courseResources.length} Documents</span>
                      </div>

                      {courseResources.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No PDF notes uploaded for this course yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {courseResources.map(({ resource, lessonTitle, modId, lessonId }) => (
                            <div
                              key={resource.id}
                              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-bold text-slate-800 truncate">{resource.title}</div>
                                  <div className="text-[10px] text-slate-400 truncate">Lesson: {lessonTitle}</div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  storage.deleteLessonResource(course.id, modId, lessonId, resource.id, user?.email || 'admin');
                                  success(`Deleted resource "${resource.title}".`);
                                  refreshAllData();
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                title="Delete PDF"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {students.length} Registered Student Accounts
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Assigned Programs</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchStudentQuery.toLowerCase())
                      )
                      .map((student) => {
                        const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
                        const assignedCourseTitles = studentEnrollments
                          .map((e) => courses.find((c) => c.id === e.courseId)?.title)
                          .filter(Boolean);

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {student.avatarUrl ? (
                                  <img
                                    src={student.avatarUrl}
                                    alt={student.name}
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                                    {student.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900">{student.name}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>{student.phone || 'No phone'}</div>
                            </td>
                            <td className="py-3 px-4">
                              {assignedCourseTitles.length > 0 ? (
                                <div className="space-y-1">
                                  {assignedCourseTitles.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-semibold mr-1"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">None assigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  student.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {student.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    const nextStatus = student.status === 'active' ? 'suspended' : 'active';
                                    storage.setStudentStatus(student.id, nextStatus, user?.email || 'admin');
                                    success(`Student ${student.name} set to ${nextStatus}.`);
                                    refreshAllData();
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                  title={student.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                >
                                  {student.status === 'active' ? (
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEETINGS */}
        {activeTab === 'meetings' && (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0B2147]">Configure Course Live Meeting Links</h3>
              <p className="text-xs text-slate-500">
                Update the Google Meet or Zoom link displayed to students enrolled in this program.
              </p>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Program</label>
                <select
                  value={meetingTargetCourse}
                  onChange={(e) => setMeetingTargetCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={meetingPlatform}
                    onChange={(e) => setMeetingPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Meeting URL</label>
                  <input
                    type="url"
                    required
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Timing Description</label>
                <input
                  type="text"
                  required
                  value={meetingTimeDesc}
                  onChange={(e) => setMeetingTimeDesc(e.target.value)}
                  placeholder="Tuesdays & Thursdays • 7:30 PM - 9:30 PM IST"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Students</label>
                <textarea
                  value={meetingInstructions}
                  onChange={(e) => setMeetingInstructions(e.target.value)}
                  rows={2}
                  placeholder="Optional preparatory instructions before the session..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="meetPublished"
                  checked={meetingIsPublished}
                  onChange={(e) => setMeetingIsPublished(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-[#0B2147]"
                />
                <label htmlFor="meetPublished" className="text-xs text-slate-700">
                  Publish meeting card on enrolled students' dashboards
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                Save Live Session Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* VIDEO UPLOAD / URL MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#0B2147] mb-1">Lesson Video Source</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload a video file from your computer or provide an authorized stream URL.
            </p>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setVideoSourceMode('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceMode === 'upload' ? 'bg-white text-[#0B2147] shadow-xs' : 'text-slate-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload from Computer</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceMode('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceMode === 'url' ? 'bg-white text-[#0B2147] shadow-xs' : 'text-slate-600'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Video URL</span>
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              {videoSourceMode === 'upload' ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-800 block">
                      {selectedVideoFile ? selectedVideoFile.name : 'Click to select video file from desktop'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Supports MP4 and WebM files up to 500 MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      onChange={handleVideoFileSelect}
                      className="hidden"
                    />
                  </div>

                  {isUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Video Stream URL</label>
                  <input
                    type="url"
                    required
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/... or https://..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B2147] hover:bg-blue-900 rounded-lg disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF UPLOAD MODAL */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#0B2147] mb-1">Upload Course PDF Note</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a PDF document from your computer to attach to a lesson.
            </p>

            <form onSubmit={handleSavePdf} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Program</label>
                <select
                  value={pdfCourseId}
                  onChange={(e) => {
                    setPdfCourseId(e.target.value);
                    const c = courses.find((item) => item.id === e.target.value);
                    if (c?.modules[0]) {
                      setPdfModuleId(c.modules[0].id);
                      if (c.modules[0].lessons[0]) setPdfLessonId(c.modules[0].lessons[0].id);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson</label>
                <select
                  value={pdfLessonId}
                  onChange={(e) => {
                    setPdfLessonId(e.target.value);
                    // Find matching module
                    const c = courses.find((item) => item.id === pdfCourseId);
                    const m = c?.modules.find((mod) => mod.lessons.some((l) => l.id === e.target.value));
                    if (m) setPdfModuleId(m.id);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                >
                  {courses
                    .find((c) => c.id === pdfCourseId)
                    ?.modules.flatMap((m) =>
                      m.lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {m.title} — {l.title}
                        </option>
                      ))
                    )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PDF Document Title</label>
                <input
                  type="text"
                  required
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. Module 1 Complete Study Guide"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  placeholder="Brief note about the contents..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
              >
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 block">
                  {selectedPdfFile ? selectedPdfFile.name : 'Click to choose PDF from desktop'}
                </span>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPdf}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B2147] hover:bg-blue-900 rounded-lg disabled:opacity-50"
                >
                  {isUploadingPdf ? 'Uploading...' : 'Save PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STUDENT MODAL */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#0B2147] mb-1">Create Student Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provision student credentials and assign authorized courses directly.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Ramesh Deshmukh"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / Username</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="ramesh@student.pathfinder.edu"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Stored securely with SHA-256 hash.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Course Access</label>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={assignedCourseIds.includes(course.id)}
                        onChange={() => handleToggleCourseForStudent(course.id)}
                        className="rounded text-blue-600 focus:ring-[#0B2147]"
                      />
                      <span className="font-semibold text-slate-800">{course.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B2147] hover:bg-blue-900 rounded-lg"
                >
                  Create & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
