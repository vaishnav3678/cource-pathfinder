import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { fetchCourseById, fetchEnrollments, toggleLessonProgressApi, subscribeDataChanges } from '../services/api';
import { Course, Lesson, LessonResource } from '../types';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Video,
  Clock,
  BookOpen,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Eye,
  Menu,
  X,
  Maximize,
  AlertCircle,
  RefreshCw,
  Edit3,
} from 'lucide-react';

interface CourseLearningPageProps {
  courseId: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const CourseLearningPage: React.FC<CourseLearningPageProps> = ({ courseId, onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'meeting'>('overview');
  const [videoError, setVideoError] = useState(false);
  const [activePdfModal, setActivePdfModal] = useState<LessonResource | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Load course and enrollment directly from shared backend
  const loadData = async (silent: boolean = false) => {
    try {
      const loadedCourse = await fetchCourseById(courseId);
      setCourse(loadedCourse);

      // Verify student authorization
      if (!isAdmin && user) {
        const studentEnrollments = await fetchEnrollments(user.id);
        const enr = studentEnrollments.find((e) => e.courseId === courseId && e.status === 'active');
        if (!enr) {
          if (!silent) {
            error(`Access Denied: You are not enrolled in "${loadedCourse.title}".`);
            onNavigate('dashboard');
          }
          return;
        }
        setCompletedLessonIds(enr.completedLessonIds || []);

        // Resume lesson or keep active
        setActiveLesson((prev) => {
          if (prev) {
            // Find updated lesson from fresh course data
            for (const mod of loadedCourse.modules) {
              const fresh = mod.lessons.find((l) => l.id === prev.id);
              if (fresh) return fresh;
            }
          }
          // Default first published lesson
          for (const mod of loadedCourse.modules) {
            const first = mod.lessons.find((l) => l.isPublished);
            if (first) return first;
          }
          return null;
        });
      } else if (isAdmin) {
        // Admin preview mode
        setActiveLesson((prev) => {
          if (prev) {
            for (const mod of loadedCourse.modules) {
              const fresh = mod.lessons.find((l) => l.id === prev.id);
              if (fresh) return fresh;
            }
          }
          return loadedCourse.modules[0]?.lessons[0] || null;
        });
      }
    } catch (err: any) {
      if (!silent) {
        error(err.message || 'Error loading course content');
        onNavigate('dashboard');
      }
    }
  };

  useEffect(() => {
    loadData();

    // Re-fetch automatically when window regains focus to reflect Admin updates in real-time
    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);

    // Instant cross-tab sync when Admin saves changes
    const unsubscribe = subscribeDataChanges(() => {
      loadData(true);
    });

    // Polling every 4 seconds to sync admin updates across browser sessions
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
      clearInterval(interval);
    };
  }, [courseId, user, isAdmin]);

  // Reset video error on lesson change
  useEffect(() => {
    setVideoError(false);
  }, [activeLesson?.id, activeLesson?.videoUrl]);

  const allLessons = useMemo(() => {
    if (!course) return [];
    const list: Lesson[] = [];
    course.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        if (l.isPublished || isAdmin) {
          list.push(l);
        }
      });
    });
    return list;
  }, [course, isAdmin]);

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessonsCount = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
  const isCurrentLessonCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false;

  const handleToggleComplete = async () => {
    if (!user || !activeLesson) return;
    if (isAdmin) {
      info('Lesson completion tracking is disabled in Admin preview.');
      return;
    }

    try {
      const res = await toggleLessonProgressApi(user.id, courseId, activeLesson.id);
      setCompletedLessonIds(res.completedLessonIds);
      if (res.isCompleted) {
        success('Lesson marked as complete! Great work.');
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
        });
      } else {
        info('Lesson marked as incomplete.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update progress');
    }
  };

  // Browser Fullscreen API trigger for video
  const handleFullscreenVideo = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch((err) => {
          console.error('Error enabling fullscreen mode:', err);
        });
      } else {
        document.exitFullscreen();
      }
    } else if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Helper: check if video URL is an embed (e.g. YouTube, Vimeo, Google Drive)
  const isEmbedVideo = (url?: string) => {
    if (!url) return false;
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.includes('drive.google.com') ||
      url.includes('/embed/') ||
      url.includes('/preview')
    );
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const v = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${v}?autoplay=0&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace('/view', '/preview').replace('/edit', '/preview');
    }
    return url;
  };

  if (!course) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading course environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-white select-none">
      {/* 1. Header Bar: Full Width, Concise */}
      <header className="h-14 px-4 sm:px-6 bg-[#0B2147] border-b border-blue-900 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 truncate">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="h-4 w-px bg-blue-800 hidden sm:block" />

          <div className="truncate">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block leading-tight">
              {course.category === 'development' ? 'Full Stack Track' : 'Manual Testing Track'}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
            <span>Progress:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-white">{progressPercent}%</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Toggle Syllabus Sidebar"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide Syllabus' : 'Syllabus'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Body: Split Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Viewport: Video & Tabs (Fills remaining height) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          {/* Prominent Video Player Container */}
          <div
            ref={playerContainerRef}
            className="relative bg-black aspect-video max-h-[58vh] sm:max-h-[62vh] w-full flex items-center justify-center shrink-0 group"
          >
            {activeLesson && activeLesson.videoUrl ? (
              isEmbedVideo(activeLesson.videoUrl) ? (
                <iframe
                  src={getEmbedUrl(activeLesson.videoUrl)}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoError ? (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">Video stream cannot be loaded.</p>
                  <p className="text-[11px] text-slate-500">Please verify the video URL or re-upload the MP4 in Admin Panel.</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    key={activeLesson.id + activeLesson.videoUrl}
                    src={activeLesson.videoUrl}
                    controls
                    playsInline
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Separate Fullscreen button */}
                  <button
                    onClick={handleFullscreenVideo}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-xs font-semibold flex items-center gap-1 shadow-md"
                    title="Fullscreen Video"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </>
              )
            ) : (
              <div className="text-center p-8 text-slate-500 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-xs font-medium">No video uploaded for this lesson yet.</p>
              </div>
            )}
          </div>

          {/* Lesson Metadata Bar */}
          {activeLesson && (
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <span className="text-blue-400 font-semibold">
                    Lesson {currentIndex + 1} of {totalLessonsCount}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeLesson.durationMinutes} mins
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {activeLesson.title}
                </h2>
              </div>

              {/* Navigation & Completion Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleToggleComplete}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCurrentLessonCompleted
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isCurrentLessonCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{isCurrentLessonCompleted ? 'Completed' : 'Mark as Complete'}</span>
                </button>

                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                  <button
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLesson(prevLesson)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous Lesson"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setActiveLesson(nextLesson)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next Lesson"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation: Overview, Notes & Resources, Live Meeting */}
          <div className="p-4 sm:p-6 flex-1 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'resources'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes & Resources</span>
                {activeLesson?.resources && activeLesson.resources.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-blue-900 text-blue-200 rounded-full text-[10px] font-mono">
                    {activeLesson.resources.length}
                  </span>
                )}
              </button>
              {course.meetingSchedule && course.meetingSchedule.isPublished && (
                <button
                  onClick={() => setActiveTab('meeting')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'meeting'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Meeting</span>
                </button>
              )}
            </div>

            {/* Content: Overview */}
            {activeTab === 'overview' && activeLesson && (
              <div className="max-w-3xl space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeLesson.description}
                </p>
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
                  Course: <span className="text-slate-300 font-semibold">{course.title}</span>
                </div>
              </div>
            )}

            {/* Content: Notes & Resources */}
            {activeTab === 'resources' && (
              <div className="max-w-2xl space-y-3">
                <div className="text-xs font-bold text-slate-300">
                  PDF Notes & Learning Documents
                </div>

                {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                  <div className="space-y-2">
                    {activeLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold text-white truncate">{res.title}</div>
                            {res.description && (
                              <div className="text-[11px] text-slate-400 truncate">{res.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setActivePdfModal(res)}
                            className="px-2.5 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <a
                            href={res.url}
                            download={res.fileName || `${res.title}.pdf`}
                            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs">No notes uploaded for this lesson yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Content: Meeting */}
            {activeTab === 'meeting' && course.meetingSchedule && (
              <div className="max-w-xl space-y-4">
                <div className="p-5 rounded-2xl border border-blue-900 bg-blue-950/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-300 uppercase tracking-wider">
                      {course.meetingSchedule.platform} Live Session
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900 text-blue-200">
                      {course.meetingSchedule.nextSessionDate || 'Scheduled Class'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{course.meetingSchedule.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{course.meetingSchedule.timeDescription}</p>
                  </div>

                  {course.meetingSchedule.instructions && (
                    <p className="text-xs text-slate-400 italic bg-black/30 p-2.5 rounded-lg border border-blue-900/50">
                      Instructions: {course.meetingSchedule.instructions}
                    </p>
                  )}

                  <a
                    href={course.meetingSchedule.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-blue-800 shadow-sm"
                  >
                    <Video className="w-4 h-4 text-blue-400" />
                    <span>Launch Live Classroom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Viewport: Expandable/Collapsible Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-88 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 max-h-[40vh] lg:max-h-full overflow-hidden z-10">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Course Syllabus
                </span>
                <span className="text-[11px] text-slate-500">
                  {completedCount} / {totalLessonsCount} Completed
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-400">
                {progressPercent}%
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {course.modules.map((mod) => (
                <div key={mod.id} className="space-y-1">
                  <div className="px-2 py-1 text-xs font-bold text-slate-400 truncate">
                    {mod.title}
                  </div>

                  <div className="space-y-0.5">
                    {mod.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-start gap-2 ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                            ) : isActive ? (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="truncate leading-tight">{lesson.title}</div>
                            <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                              {lesson.durationMinutes}m
                              {lesson.resources && lesson.resources.length > 0 && ` · ${lesson.resources.length} PDF`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* PDF View Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold truncate max-w-sm">{activePdfModal.title}</h3>
              </div>
              <button
                onClick={() => setActivePdfModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <p>{activePdfModal.description || 'Verified course study notes for this session.'}</p>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                <FileText className="w-8 h-8 text-blue-400 mx-auto" />
                <span className="block font-bold text-slate-200">{activePdfModal.fileName || 'course_notes.pdf'}</span>
                <span className="text-[11px] text-slate-500">Official Pathfinder Document</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActivePdfModal(null)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
              <a
                href={activePdfModal.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Browser</span>
              </a>
              <a
                href={activePdfModal.url}
                download={activePdfModal.fileName || `${activePdfModal.title}.pdf`}
                className="px-4 py-1.5 bg-[#0B2147] hover:bg-blue-900 text-white border border-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
