import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { getUserInterviews, deleteInterviewSession } from "../lib/firebase";
import { InterviewSession } from "../types";
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Play,
  Award,
  Calendar,
  Building,
  CheckCircle2,
} from "lucide-react";

interface HistoryViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const loadData = () => {
    if (!user) return;
    getUserInterviews(user.uid).then((list) => {
      setInterviews(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this interview record?")) {
      await deleteInterviewSession(id, user.uid);
      toast.info("Deleted", "Interview record removed from your history.");
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    const matchesSearch =
      i.config.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.config.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.config.interviewType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || i.config.interviewType === typeFilter;
    return matchesSearch && matchesType;
  });

  const types = ["All", "System Design", "Technical", "Behavioral", "HR & Cultural"];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Interview History & Transcripts
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Search past sessions, review evaluator scores, or resume paused interviews.
          </p>
        </div>

        <button
          onClick={() => onNavigate("interview_new")}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Mock Session</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by role, company..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                typeFilter === t
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Loading past interviews...
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <History className="w-10 h-10 text-neutral-600 dark:text-neutral-400 mx-auto" />
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            No interview records found
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto">
            {searchQuery
              ? "Try adjusting your search criteria or type filter."
              : "Start a mock interview to generate your first transcript and score."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInterviews.map((session) => {
            const isCompleted = session.status === "completed";
            const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={session.id}
                onClick={() => {
                  if (isCompleted) {
                    onNavigate("interview_result", session.id);
                  } else {
                    onNavigate("interview_room", session.id);
                  }
                }}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-400 dark:hover:border-neutral-600 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      session.evaluation?.overallScore && session.evaluation.overallScore >= 80
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    }`}
                  >
                    {session.evaluation?.overallScore ? `${session.evaluation.overallScore}%` : "—"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:underline">
                        {session.config.targetRole}
                      </h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {session.config.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {session.config.company}
                      </span>
                      <span>•</span>
                      <span>{session.config.interviewType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Paused"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCompleted) {
                        onNavigate("interview_result", session.id);
                      } else {
                        onNavigate("interview_room", session.id);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white rounded-lg transition"
                  >
                    {isCompleted ? "Scorecard" : "Resume"}
                  </button>

                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-rose-700 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
