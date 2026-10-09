import React, { useState } from 'react';
import { storage } from '../services/storage';
import { Course } from '../types';
import {
  Code,
  CheckCircle2,
  BookOpen,
  Video,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';

interface CurriculumPageProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const CurriculumPage: React.FC<CurriculumPageProps> = ({ onNavigate }) => {
  const courses = storage.getCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('fullstack-ai');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Comprehensive Syllabi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B2147]">
            Industry-Standard Academic Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Engineered in collaboration with principal software architects and QA leads to mirror production environments.
          </p>

          {/* Track Selector Tabs */}
          <div className="pt-6 flex justify-center">
            <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    selectedCourseId === course.id
                      ? 'bg-white text-[#0B2147] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Course Details */}
      {selectedCourse && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* Overview Strip */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {selectedCourse.category === 'development' ? 'Full Stack Engineering' : 'Quality Assurance'}
                  </span>
                  <span className="text-xs text-slate-500">Duration: {selectedCourse.duration}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">Level: {selectedCourse.level}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-[#0B2147]">{selectedCourse.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedCourse.description}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Live Instructor Masterclasses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hands-on Code Reviews</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Authorized Course Notes & PDFs</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center">
                <div className="text-xs text-slate-500">Academic Tuition Fee</div>
                <div className="text-3xl font-extrabold text-[#0B2147] font-mono">
                  ₹{selectedCourse.price.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Includes all modules, downloadable materials, video access, and live sessions.
                </div>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-3 bg-[#0B2147] hover:bg-[#153463] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Access via Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modules and Lessons Hierarchy */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-[#0B2147]">
              Detailed Curriculum Modules ({selectedCourse.modules.length} Modules)
            </h3>

            <div className="space-y-4">
              {selectedCourse.modules.map((module, mIdx) => (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        Module {mIdx + 1}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{module.title}</h4>
                      {module.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {module.lessons.length} Lessons
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 p-2">
                    {module.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="p-4 hover:bg-slate-50/60 rounded-xl transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-600 shrink-0" />
                            <h5 className="text-xs font-bold text-slate-800">
                              {mIdx + 1}.{lIdx + 1} {lesson.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-500 pl-6 leading-relaxed">
                            {lesson.description}
                          </p>
                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="pl-6 pt-1 flex items-center gap-3 text-[11px] text-slate-400">
                              <span>Includes:</span>
                              {lesson.resources.map((r) => (
                                <span key={r.id} className="text-blue-700 font-medium">
                                  {r.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-xs font-mono text-slate-400 shrink-0 mt-0.5">
                          {lesson.durationMinutes} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
