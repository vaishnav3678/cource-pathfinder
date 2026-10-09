import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { fetchCourses, fetchEnrollments, redeemAccessCodeApi, subscribeDataChanges } from '../services/api';
import { Course, Enrollment, LessonResource } from '../types';
import confetti from 'canvas-confetti';
import {
  Play,
  Video,
  FileText,
  Clock,
  ExternalLink,
  LogOut,
  Calendar,
  Download,
  BookOpen,
  Eye,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  X,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();

  const [enrolledCourses, setEnrolledCourses] = useState<{ course: Course; enrollment: Enrollment }[]>([]);
  const [activePdfPreview, setActivePdfPreview] = useState<LessonResource | null>(null);
  const [loading, setLoading] = useState(true);

  // Access Code Modal
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const loadData = useCallback(async (silent: boolean = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      const [allCourses, studentEnrollments] = await Promise.all([
        fetchCourses(),
        fetchEnrollments(user.id),
      ]);

      const paired = studentEnrollments
        .map((enr) => {
          const course = allCourses.find((c) => c.id === enr.courseId);
          return course ? { course, enrollment: enr } : null;
        })
        .filter(Boolean) as { course: Course; enrollment: Enrollment }[];

      setEnrolledCourses(paired);
    } catch (err: any) {
      if (!silent) {
        error(err.message || 'Failed to load courses from database');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, error]);

  useEffect(() => {
    loadData();

    // Automatically re-fetch when window regains focus to reflect Admin updates in real-time
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
  }, [loadData]);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessCodeInput.trim()) return;

    setIsRedeeming(true);
    try {
      const res = await redeemAccessCodeApi(user.id, accessCodeInput.trim());
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      success(res.message);
      setAccessCodeInput('');
      setCodeModalOpen(false);
      loadData(false);
    } catch (err: any) {
      error(err.message || 'Failed to redeem code');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!user) {
    onNavigate('student-login');
    return null;
  }

  const getCourseProgress = (course: Course, enrollment: Enrollment) => {
    let totalLessons = 0;
    course.modules.forEach((m) => {
      totalLessons += m.lessons.filter((l) => l.isPublished).length;
    });
    if (totalLessons === 0) return 0;
    const completedCount = enrollment.completedLessonIds.length;
    return Math.min(100, Math.round((completedCount / totalLessons) * 100));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Welcome Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Student Learning Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2147] mt-1">
                Welcome, {user.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Account ID: <span className="font-mono text-slate-700">{user.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setCodeModalOpen(true)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                title="Enter course access code to unlock other courses"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                <span>Unlock Course</span>
              </button>
              <button
                onClick={() => loadData(false)}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors shadow-2xs"
                title="Refresh from Database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#0B2147]">My Enrolled Courses</h2>
              <p className="text-xs text-slate-500">
                Your assigned programs and real-time learning progression
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Loading course enrollments from database...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Courses Assigned Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your student profile is active, but your administrator has not yet assigned a course track to your account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {enrolledCourses.map(({ course, enrollment }) => {
                const progress = getCourseProgress(course, enrollment);
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                const completedCount = enrollment.completedLessonIds.length;

                // Collect all resources across lessons for this course
                const allCourseResources: { resource: LessonResource; lessonTitle: string }[] = [];
                course.modules.forEach((m) => {
                  m.lessons.forEach((l) => {
                    if (l.resources) {
                      l.resources.forEach((r) => {
                        if (r.isPublished) {
                          allCourseResources.push({ resource: r, lessonTitle: l.title });
                        }
                      });
                    }
                  });
                });

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Banner */}
                      <div className="relative aspect-video overflow-hidden bg-slate-900">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#0B2147]/90 text-white backdrop-blur-xs">
                            {course.duration}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
                            Enrolled & Active
                          </span>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-7 space-y-6">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                            {course.category === 'development' ? 'Full Stack Track' : 'Manual Testing Track'}
                          </div>
                          <h3 className="text-xl font-bold text-[#0B2147]">{course.title}</h3>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {course.summary}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Course Progress</span>
                            <span className="font-mono font-extrabold text-blue-700">{progress}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>{completedCount} of {totalLessons} lessons completed</span>
                            <span>{course.modules.length} Modules</span>
                          </div>
                        </div>

                        {/* Upcoming Meeting Card */}
                        {course.meetingSchedule && course.meetingSchedule.isPublished && (
                          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                                <Video className="w-4 h-4 text-blue-700" />
                                <span>Upcoming Live Masterclass</span>
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">
                                {course.meetingSchedule.platform}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-slate-800">
                              {course.meetingSchedule.title}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>{course.meetingSchedule.timeDescription}</span>
                            </div>

                            {course.meetingSchedule.instructions && (
                              <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-lg">
                                Note: {course.meetingSchedule.instructions}
                              </p>
                            )}

                            <a
                              href={course.meetingSchedule.url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-3 px-4 bg-gradient-to-r from-[#0B2147] to-blue-700 hover:from-blue-950 hover:to-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm group"
                            >
                              <Video className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
                              <span>Join Live Class</span>
                              <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
                            </a>
                          </div>
                        )}

                        {/* Course Notes & PDF Resources Section */}
                        {allCourseResources.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>Course PDF Notes & Resources ({allCourseResources.length})</span>
                            </h4>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {allCourseResources.map(({ resource, lessonTitle }) => (
                                <div
                                  key={resource.id}
                                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="truncate">
                                    <div className="font-bold text-slate-800 truncate">{resource.title}</div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      Lesson: {lessonTitle}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => setActivePdfPreview(resource)}
                                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                                      title="View Document"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View</span>
                                    </button>
                                    <a
                                      href={resource.url}
                                      download={resource.fileName || `${resource.title}.pdf`}
                                      className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                      title="Download PDF"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action: Open in Full-Screen Course Learning Viewport */}
                    <div className="p-7 pt-0">
                      <button
                        onClick={() => onNavigate('learn', { courseId: course.id })}
                        className="w-full py-3.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 group"
                      >
                        <span>Continue Learning</span>
                        <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {activePdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activePdfPreview.title}</h3>
                  <p className="text-xs text-slate-500">{activePdfPreview.fileName || 'PDF Document'}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePdfPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-600">
              {activePdfPreview.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {activePdfPreview.description}
                </div>
              )}

              <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50/50 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  {activePdfPreview.title}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Official Pathfinder verified learning resource.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <a
                    href={activePdfPreview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Browser</span>
                  </a>
                  <a
                    href={activePdfPreview.url}
                    download={activePdfPreview.fileName || `${activePdfPreview.title}.pdf`}
                    className="px-4 py-2 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActivePdfPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Code Unlock Modal */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Unlock Course with Access Code</h3>
                  <p className="text-[11px] text-slate-500">Provided by Pathfinder admissions or instructor</p>
                </div>
              </div>
              <button
                onClick={() => setCodeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRedeemCode} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Your Access Code</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. FULLSTACK-PRO-2026 or MANUAL-QA-2026"
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147] uppercase placeholder:font-sans placeholder:normal-case placeholder:font-normal"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Example codes: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">FULLSTACK-PRO-2026</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">MANUAL-QA-2026</code>
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCodeModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRedeeming || !accessCodeInput.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B2147] hover:bg-blue-900 rounded-lg disabled:opacity-50 transition-all shadow-2xs"
                >
                  {isRedeeming ? 'Validating...' : 'Unlock Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
