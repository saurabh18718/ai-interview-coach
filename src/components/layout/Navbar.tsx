import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  Target,
  Play,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

interface NavbarProps {
  currentView?: string;
  activeTab?: string;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onNavigate: (view: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeTab,
  isDark,
  onToggleTheme,
  onNavigate,
  onToggleMobileMenu,
}) => {
  const { user, signOut } = useAuth();
  const active = activeTab || currentView || "dashboard";

  const isTrainingActive =
    active === "dashboard" ||
    active === "interview_new" ||
    active.startsWith("interview_") ||
    active === "practice";

  const isHistoryActive = active === "history" || active === "performance";
  const isResourceActive =
    active === "learning" ||
    active === "books" ||
    active === "blogs" ||
    active === "bookmarks";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shrink-0">
      {/* Brand & Left Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Coach
            </span>
          </div>
        </button>

        {user?.targetRole && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-slate-900 dark:text-slate-200">
              Role:
            </span>
            <span className="truncate max-w-[140px] font-medium">{user.targetRole}</span>
          </div>
        )}
      </div>

      {/* Center Nav Links (Professional Polish aesthetic) */}
      <div className="hidden md:flex items-center gap-6 h-16 text-sm font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => onNavigate("dashboard")}
          className={`h-full flex items-center transition ${
            isTrainingActive
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 font-bold"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Training Room
        </button>
        <button
          onClick={() => onNavigate("history")}
          className={`h-full flex items-center transition ${
            isHistoryActive
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 font-bold"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Session History
        </button>
        <button
          onClick={() => onNavigate("learning")}
          className={`h-full flex items-center transition ${
            isResourceActive
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 font-bold"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Resource Hub
        </button>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={() => onNavigate("interview_new")}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs sm:text-sm shadow-md shadow-indigo-200 dark:shadow-none transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Drill</span>
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
              title="Career Profile & Resume"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">
                  {user.displayName || "Alex Rivera"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Premium Plan
                </p>
              </div>
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-xs">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
              </div>
            </button>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate("auth")}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

