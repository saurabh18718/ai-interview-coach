import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/common/Toast";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";

// Views
import { AuthView } from "./views/AuthView";
import { OnboardingView } from "./views/OnboardingView";
import { DashboardView } from "./views/DashboardView";
import { NewInterviewView } from "./views/NewInterviewView";
import { InterviewRoomView } from "./views/InterviewRoomView";
import { InterviewResultView } from "./views/InterviewResultView";
import { PracticeView } from "./views/PracticeView";
import { LearningView } from "./views/LearningView";
import { BooksView } from "./views/BooksView";
import { BlogsView } from "./views/BlogsView";
import { HistoryView } from "./views/HistoryView";
import { PerformanceView } from "./views/PerformanceView";
import { BookmarksView } from "./views/BookmarksView";
import { ProfileSettingsView } from "./views/ProfileSettingsView";

function MainAppContent() {
  const { user, loading } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [learningTopicParam, setLearningTopicParam] = useState<string | undefined>(undefined);

  // Layout UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("aivm_theme") === "dark" ||
      (!localStorage.getItem("aivm_theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("aivm_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("aivm_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Router handler
  const handleNavigate = (view: string, param?: string) => {
    setActiveTab(view);
    setMobileMenuOpen(false);

    if (view === "interview_room" || view === "interview_result") {
      if (param) setActiveSessionId(param);
    } else if (view === "learning" && param) {
      setLearningTopicParam(param);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <div className="w-5 h-5 bg-white rounded-xs rotate-45" />
        </div>
        <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading AI Coach...
        </p>
      </div>
    );
  }

  // Not signed in -> Show Auth View
  if (!user) {
    return <AuthView onSuccess={() => setActiveTab("dashboard")} />;
  }

  // First time user -> Show Onboarding Setup
  if (!user.onboardingCompleted) {
    return (
      <OnboardingView
        onComplete={() => setActiveTab("dashboard")}
        onStartPractice={() => setActiveTab("interview_new")}
      />
    );
  }

  // In full-screen Interview Room mode, render focused distraction-free layout
  if (activeTab === "interview_room" && activeSessionId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
        <InterviewRoomView
          sessionId={activeSessionId}
          onFinish={(sid) => {
            setActiveSessionId(sid);
            setActiveTab("interview_result");
          }}
          onExit={() => setActiveTab("dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        isDark={isDark}
        activeTab={activeTab}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950">
          {activeTab === "dashboard" && (
            <DashboardView onNavigate={handleNavigate} />
          )}

          {activeTab === "interview_new" && (
            <NewInterviewView
              onStartSession={(sessionId) => {
                setActiveSessionId(sessionId);
                setActiveTab("interview_room");
              }}
              onCancel={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "interview_result" && activeSessionId && (
            <InterviewResultView
              sessionId={activeSessionId}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "practice" && <PracticeView />}

          {activeTab === "learning" && (
            <LearningView
              initialTopic={learningTopicParam}
              onPracticeTopic={(topic) => handleNavigate("practice")}
            />
          )}

          {activeTab === "books" && <BooksView />}

          {activeTab === "blogs" && <BlogsView />}

          {activeTab === "history" && (
            <HistoryView onNavigate={handleNavigate} />
          )}

          {activeTab === "performance" && (
            <PerformanceView onNavigate={handleNavigate} />
          )}

          {activeTab === "bookmarks" && (
            <BookmarksView onNavigate={handleNavigate} />
          )}

          {(activeTab === "settings" || activeTab === "profile") && <ProfileSettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
