import React, { useState } from 'react';
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

function AppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (view: string, extra?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    if (extra) {
      setViewParams(extra);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'student-login':
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'learn':
        return (
          <CourseLearningPage
            courseId={viewParams?.courseId || 'fullstack-ai'}
            onNavigate={handleNavigate}
          />
        );
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
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
