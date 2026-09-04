import React from "react";
import {
  LayoutDashboard,
  Video,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  History,
  User,
  Settings,
  X,
  Bookmark,
} from "lucide-react";

interface SidebarProps {
  currentView?: string;
  activeTab?: string;
  onNavigate?: (view: string) => void;
  onSelectTab?: (view: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeTab,
  onNavigate,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const current = activeTab || currentView || "dashboard";
  const navigate = onSelectTab || onNavigate || (() => {});

  const navItems = [
    { id: "dashboard", label: "Training Room", icon: LayoutDashboard },
    { id: "interview_new", label: "Mock Interview", icon: Video },
    { id: "practice", label: "Targeted Drills", icon: CheckCircle2 },
    { id: "learning", label: "Role Roadmaps", icon: GraduationCap },
    { id: "books", label: "Prep Playbooks", icon: BookOpen },
    { id: "blogs", label: "Career & Strategy", icon: FileText },
    { id: "bookmarks", label: "Saved Items", icon: Bookmark },
    { id: "performance", label: "Analytics & Velocity", icon: TrendingUp },
    { id: "history", label: "Session History", icon: History },
    { id: "profile", label: "Career Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Workspace
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              current === item.id ||
              (item.id === "interview_new" && current.startsWith("interview_")) ||
              (item.id === "books" && current.startsWith("book_")) ||
              (item.id === "blogs" && current.startsWith("blog_")) ||
              (item.id === "learning" && current.startsWith("learning_"));

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border-l-2 border-indigo-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Professional Polish Deep Indigo Weekly Progress Card */}
      <div className="mt-4 bg-indigo-900 text-white rounded-xl p-4 shadow-lg shadow-indigo-100 dark:shadow-none shrink-0">
        <p className="text-xs font-medium opacity-80 mb-1">Weekly Progress</p>
        <p className="text-2xl font-bold mb-2">
          82<span className="text-sm font-normal opacity-70">/100</span>
        </p>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-400 w-[82%] rounded-full" />
        </div>
        <p className="text-[10px] mt-2.5 opacity-70 italic">+12% from last week</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

