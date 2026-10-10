import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MouseGlow } from './components/common/MouseGlow';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { AdminLoginPage } from './views/AdminLoginPage';
import { StudentDashboard } from './views/StudentDashboard';
import { CourseLearningPage } from './views/CourseLearningPage';
import { AdminDashboard } from './views/AdminDashboard';
import { Shield } from 'lucide-react';

function getInitialViewFromPath(): { view: string; params: any } {
  const path = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const courseId = searchParams.get('courseId') || 'fullstack-ai';

  if (path === '/admin') {
    return { view: 'admin', params: {} };
  }
  if (path === '/login' || path === '/student-login') {
    return { view: 'student-login', params: {} };
  }
  if (path === '/dashboard') {
    return { view: 'dashboard', params: {} };
  }
  if (path === '/learn') {
    return { view: 'learn', params: { courseId } };
  }
  return { view: 'landing', params: {} };
}

function getPathForView(view: string, extra?: any): string {
  switch (view) {
    case 'admin':
    case 'admin-login':
      return '/admin';
    case 'student-login':
    case 'login':
      return '/login';
    case 'dashboard':
      return '/dashboard';
    case 'learn':
      return extra?.courseId ? `/learn?courseId=${extra.courseId}` : '/learn';
    case 'landing':
    default:
      return '/';
  }
}

function AppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const initial = getInitialViewFromPath();
  const [currentView, setCurrentView] = useState<string>(initial.view);
  const [viewParams, setViewParams] = useState<any>(initial.params);

  useEffect(() => {
    const handlePopState = () => {
      const { view, params } = getInitialViewFromPath();
      setCurrentView(view);
      setViewParams(params);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: string, extra?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    if (extra) {
      setViewParams(extra);
    }
    const targetPath = getPathForView(view, extra);
    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState({ view, extra }, '', targetPath);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;

      case 'student-login':
      case 'login':
        if (isAuthenticated && isAdmin) {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        if (isAuthenticated && !isAdmin) {
          return <StudentDashboard onNavigate={handleNavigate} />;
        }
        return <LoginPage onNavigate={handleNavigate} />;

      case 'admin-login':
      case 'admin':
        // Protected Admin route at /admin
        if (!isAuthenticated) {
          // If a logged-out visitor opens /admin, show the Admin Login form on this route
          return <AdminLoginPage onNavigate={handleNavigate} />;
        }
        if (!isAdmin) {
          // If a student opens /admin, deny access and provide option to return to Student Dashboard
          return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 bg-slate-50/60">
              <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0B2147]">Administrator Access Required</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Pathfinder Admin Console is strictly reserved for authorized institute faculty and administrators. Your current student account does not have permission to access administrative tools.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="flex-1 py-2.5 px-4 bg-[#0B2147] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Return to Student Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigate('landing')}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Home
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return <AdminDashboard onNavigate={handleNavigate} />;

      case 'dashboard':
        if (!isAuthenticated) {
          return <LoginPage onNavigate={handleNavigate} />;
        }
        if (isAdmin) {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        return <StudentDashboard onNavigate={handleNavigate} />;

      case 'learn':
        if (!isAuthenticated) {
          return <LoginPage onNavigate={handleNavigate} />;
        }
        return (
          <CourseLearningPage
            courseId={viewParams?.courseId || 'fullstack-ai'}
            onNavigate={handleNavigate}
          />
        );

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const isFullscreenLearnMode = currentView === 'learn';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Subtle mouse-follow glow on desktop */}
      <MouseGlow />

      {/* Navigation Header */}
      {!isFullscreenLearnMode && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      )}

      {/* Active View Container */}
      <div className="flex-1">
        {renderCurrentView()}
      </div>

      {/* Footer with small unobtrusive Admin Login link */}
      {!isFullscreenLearnMode && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
