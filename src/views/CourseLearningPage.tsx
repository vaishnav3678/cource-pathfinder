import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { storage } from '../services/storage';
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
  Save,
  Menu,
  X,
  Upload,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'notes' | 'meeting'>('overview');

  // PDF Preview
  const [activePdfPreview, setActivePdfPreview] = useState<LessonResource | null>(null);

  // Student study notes
  const [lessonNote, setLessonNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    const loadedCourse = storage.getCourseById(courseId);
    if (!loadedCourse) {
      error('Course not found.');
      onNavigate('dashboard');
      return;
    }
    setCourse(loadedCourse);

    // Strict Authorization check: A student MUST be enrolled in this course to access it!
    if (!isAdmin && user) {
      const isAuthorized = storage.isStudentAuthorizedForCourse(user.id, courseId);
      if (!isAuthorized) {
        error(`Access Denied: You are not authorized for "${loadedCourse.title}". Only your enrolled programs can be opened.`);
        onNavigate('dashboard');
        return;
      }

      const enrollment = storage.getStudentEnrollments(user.id).find((e) => e.courseId === courseId);
      setCompletedLessonIds(enrollment?.completedLessonIds || []);

      // Find resume lesson
      let targetLesson: Lesson | null = null;
      if (enrollment?.lastWatchedLessonId) {
        for (const mod of loadedCourse.modules) {
          const found = mod.lessons.find((l) => l.id === enrollment.lastWatchedLessonId && l.isPublished);
          if (found) {
            targetLesson = found;
            break;
          }
        }
      }

      if (!targetLesson) {
        for (const mod of loadedCourse.modules) {
          const first = mod.lessons.find((l) => l.isPublished);
          if (first) {
            targetLesson = first;
            break;
          }
        }
      }

      if (targetLesson) {
        setActiveLesson(targetLesson);
      }
    } else if (isAdmin) {
      info('Administrator Preview Mode');
      const firstLesson = loadedCourse.modules[0]?.lessons[0] || null;
      setActiveLesson(firstLesson);
    }
  }, [courseId, user, isAdmin]);

  // Load notes when lesson changes
  useEffect(() => {
    if (user && activeLesson) {
      const existing = storage.getNotes(user.id, activeLesson.id);
      setLessonNote(existing?.content || '');
      if (!isAdmin) {
        storage.updateLastWatched(user.id, courseId, activeLesson.id);
      }
    }
  }, [activeLesson, user]);

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

  const handleToggleComplete = () => {
    if (!user || !activeLesson) return;
    if (isAdmin) {
      info('Lesson progress tracking is disabled in Admin preview.');
      return;
    }

    const isNowDone = storage.toggleLessonCompleted(user.id, courseId, activeLesson.id);
    if (isNowDone) {
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
      success('Lesson marked as complete! Great progress.');
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } else {
      setCompletedLessonIds((prev) => prev.filter((id) => id !== activeLesson.id));
      info('Lesson marked as incomplete.');
    }
  };

  const handleSaveNote = () => {
    if (!user || !activeLesson) return;
    setNoteSaving(true);
    storage.saveNote({
      id: `note-${user.id}-${activeLesson.id}`,
      studentId: user.id,
      courseId,
      lessonId: activeLesson.id,
      content: lessonNote,
      updatedAt: new Date().toISOString(),
    });
    setNoteSaving(false);
    success('Study notes saved.');
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Learning Bar */}
      <div className="bg-[#0B2147] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-blue-950 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
              <span>{course.category === 'development' ? 'Full Stack Track' : 'Manual Testing Track'}</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-slate-900 font-bold">
                  Admin Preview
                </span>
              )}
            </div>
            <h1 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{course.title}</h1>
          </div>
        </div>

        {/* Progress & Syllabus Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-300">
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
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide Syllabus' : 'Show Syllabus'}</span>
          </button>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Player & Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Container (supports uploaded video files & URLs) */}
          <div className="bg-black relative aspect-video max-h-[65vh] w-full flex items-center justify-center">
            {activeLesson ? (
              <video
                key={activeLesson.id + activeLesson.videoUrl}
                src={activeLesson.videoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a lesson from the syllabus</p>
              </div>
            )}
          </div>

          {/* Lesson Metadata Bar */}
          {activeLesson && (
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-blue-700">
                    Lesson {currentIndex + 1} of {totalLessonsCount}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {activeLesson.durationMinutes} mins
                  </span>
                  {activeLesson.videoSourceType === 'upload' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Desktop Uploaded Video
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#0B2147]">{activeLesson.title}</h2>
              </div>

              {/* Completion & Navigation Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    isCurrentLessonCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-600 hover:text-blue-700'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isCurrentLessonCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{isCurrentLessonCompleted ? 'Completed' : 'Mark as Complete'}</span>
                </button>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLesson(prevLesson)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Lesson"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setActiveLesson(nextLesson)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Lesson"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Tabs: Overview, Notes & Resources, Study Notes, Live Meeting */}
          <div className="p-6 bg-white flex-1">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'resources'
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Notes & Resources</span>
                {activeLesson?.resources && activeLesson.resources.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded-full text-[10px] font-mono">
                    {activeLesson.resources.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Notes</span>
              </button>
              {course.meetingSchedule && course.meetingSchedule.isPublished && (
                <button
                  onClick={() => setActiveTab('meeting')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'meeting'
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live Meeting</span>
                </button>
              )}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && activeLesson && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Lesson Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {activeLesson.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Course: <strong className="text-slate-800">{course.title}</strong></span>
                  <span>Duration: <strong className="text-slate-800">{activeLesson.durationMinutes} minutes</strong></span>
                </div>
              </div>
            )}

            {/* Tab: PDF Notes & Resources */}
            {activeTab === 'resources' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Downloadable Notes & PDF Materials</h3>
                  <span className="text-xs text-slate-500">Authorized for enrolled students</span>
                </div>

                {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                  <div className="space-y-3">
                    {activeLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{res.title}</div>
                            {res.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1">{res.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setActivePdfPreview(res)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <a
                            href={res.url !== '#' ? res.url : undefined}
                            download={res.fileName || `${res.title}.pdf`}
                            onClick={() => {
                              if (res.url === '#') {
                                success(`Downloaded: ${res.title}`);
                              }
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs">No PDF notes attached to this lesson.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Study Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Personal Lesson Notes</h3>
                    <p className="text-xs text-slate-500">Private study notebook for this session</p>
                  </div>
                  <button
                    onClick={handleSaveNote}
                    disabled={noteSaving}
                    className="px-4 py-2 bg-[#0B2147] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{noteSaving ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>

                <textarea
                  value={lessonNote}
                  onChange={(e) => setLessonNote(e.target.value)}
                  placeholder="Type your notes, code snippets, or bug checklists here..."
                  rows={8}
                  className="w-full p-4 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147] bg-slate-50/50 leading-relaxed"
                />
              </div>
            )}

            {/* Tab: Meeting */}
            {activeTab === 'meeting' && course.meetingSchedule && (
              <div className="max-w-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Live Masterclass</h3>
                <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                      {course.meetingSchedule.platform} Live Classroom
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">
                      {course.meetingSchedule.nextSessionDate || 'Scheduled Class'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#0B2147]">{course.meetingSchedule.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">Schedule: {course.meetingSchedule.timeDescription}</p>
                  </div>

                  {course.meetingSchedule.instructions && (
                    <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700">
                      <strong>Instructions: </strong>
                      {course.meetingSchedule.instructions}
                    </div>
                  )}

                  <a
                    href={course.meetingSchedule.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Meeting Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Syllabus */}
        {sidebarOpen && (
          <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 max-h-[calc(100vh-50px)] lg:h-auto overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Course Syllabus</h3>
                <p className="text-[11px] text-slate-500">
                  {completedCount} / {totalLessonsCount} Lessons Completed
                </p>
              </div>
              <span className="font-mono text-xs font-extrabold text-blue-700">
                {progressPercent}%
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-1.5">
                  <div className="px-2 py-1 text-xs font-bold text-slate-800">
                    {module.title}
                  </div>

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                            isActive
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isActive ? (
                              <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="truncate leading-tight">{lesson.title}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                              <span>{lesson.durationMinutes} min</span>
                              {lesson.resources && lesson.resources.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{lesson.resources.length} PDF</span>
                                </>
                              )}
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

      {/* PDF Document Preview Modal */}
      {activePdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{activePdfPreview.title}</h3>
              </div>
              <button
                onClick={() => setActivePdfPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="py-6 text-xs text-slate-600 space-y-3">
              <p>{activePdfPreview.description || 'Verified course study notes for this session.'}</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <span className="font-bold text-slate-800 block">{activePdfPreview.fileName || 'course_notes.pdf'}</span>
                <span className="text-slate-400 text-[11px]">Ready for download</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActivePdfPreview(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <a
                href={activePdfPreview.url !== '#' ? activePdfPreview.url : undefined}
                download={activePdfPreview.fileName || `${activePdfPreview.title}.pdf`}
                onClick={() => success(`Download started: ${activePdfPreview.title}`)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B2147] rounded-lg hover:bg-blue-900 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
