import React, { useState, useEffect } from 'react';
import { PathfinderLogo } from '../components/common/PathfinderLogo';
import { storage } from '../services/storage';
import { fetchCourses, subscribeDataChanges } from '../services/api';
import { Course } from '../types';
import { ArrowRight, BookOpen, Clock, Lock } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>(() => storage.getCourses());

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const remote = await fetchCourses();
        if (isMounted && remote && remote.length > 0) {
          setCourses(remote);
        }
      } catch (e) {
        // silent fallback to storage
      }
    };
    load();
    const unsubscribe = subscribeDataChanges(() => {
      load();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Header Branding & Welcome */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          {/* Original Pathfinder Logo */}
          <div className="inline-block hover:scale-105 transition-transform duration-300">
            <PathfinderLogo size={110} />
          </div>

          {/* Short Welcome Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B2147]">
            Welcome to <span className="text-blue-600">Pathfinder</span>
          </h1>

          {/* One Brief Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Pathfinder is an IT training institute providing specialized, industry-focused programs in Full Stack Development and Manual Testing with live masterclasses, hands-on projects, and video learning.
          </p>

          {/* Student Login Button */}
          <div className="pt-2">
            <button
              onClick={() => onNavigate('student-login')}
              className="px-8 py-3.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 group"
            >
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Two Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {courses.slice(0, 2).map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#0B2147]/90 text-white backdrop-blur-xs">
                      {course.duration}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-7 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {course.category === 'development' ? 'Full Stack Track' : 'Quality Assurance Track'}
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2147] group-hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {course.summary}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{course.modules.length} Modules</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-7 pt-0">
                <button
                  onClick={() => onNavigate('student-login')}
                  className="w-full py-3 bg-slate-50 hover:bg-[#0B2147] hover:text-white text-[#0B2147] border border-slate-200 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span>Access Course via Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
