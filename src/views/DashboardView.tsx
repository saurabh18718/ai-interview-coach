import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserInterviews } from "../lib/firebase";
import { InterviewSession } from "../types";
import { CardSkeleton } from "../components/common/Skeleton";
import {
  Play,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface DashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getUserInterviews(user.uid).then((data) => {
        setInterviews(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Compute metrics
  const completed = interviews.filter((i) => i.status === "completed" && i.evaluation);
  const totalInterviews = completed.length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(
          completed.reduce((acc, curr) => acc + (curr.evaluation?.overallScore || 0), 0) /
            totalInterviews
        )
      : 0;

  const bestScore =
    totalInterviews > 0
      ? Math.max(...completed.map((c) => c.evaluation?.overallScore || 0))
      : 0;

  // Chart data from completed interviews
  const trendData = [...completed]
    .reverse()
    .slice(-7)
    .map((item, idx) => ({
      name: `Session ${idx + 1}`,
      score: item.evaluation?.overallScore || 0,
      tech: item.evaluation?.technicalScore || 0,
      comm: item.evaluation?.communicationScore || 0,
      role: item.config.targetRole,
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

  // Aggregated strengths and weaknesses
  const allStrengths = completed.flatMap((c) => c.evaluation?.strengths || []).slice(0, 3);
  const allWeaknesses = completed.flatMap((c) => c.evaluation?.weaknesses || []).slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Role: {user?.targetRole || "Software Engineer"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.displayName || "Candidate"}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your AI Coach is calibrated for <strong className="text-white">{user?.targetCompany || "Tier 1 Tech"}</strong>. Practice full text & speech drills, receive instant rubric scoring, and track interview velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("interview_new")}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Launch Mock Interview</span>
            </button>
            <button
              onClick={() => onNavigate("practice")}
              className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition border border-white/10"
            >
              Targeted Drills
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interviews Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalInterviews}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalInterviews > 0 ? "Real sessions evaluated" : "Take your first mock loop"}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalInterviews > 0 ? `${avgScore}%` : "—"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {avgScore >= 80 ? "Offer readiness threshold passed" : "Target: 80%+ for Tier 1"}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Overall Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalInterviews > 0 ? `${bestScore}%` : "—"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Peak performance recorded
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience Level</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {user?.experienceLevel || "Senior"}
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-1 block"
          >
            Adjust profile & resume →
          </button>
        </div>
      </div>

      {/* Progress Chart + Coaching Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interview Score Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation history across recent mock sessions
              </p>
            </div>
            <button
              onClick={() => onNavigate("performance")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {trendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#4f46e5" }}
                    activeDot={{ r: 7 }}
                    name="Overall Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="tech"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Technical"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Award className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No interview sessions recorded yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Complete your first mock interview to generate score trends and AI rubric analysis.
              </p>
              <button
                onClick={() => onNavigate("interview_new")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Launch 1st Session
              </button>
            </div>
          )}
        </div>

        {/* Strengths & Focus Areas */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Coaching Observations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Key takeaways identified by the AI evaluator
            </p>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Proven Strengths
                </span>
                {allStrengths.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {allStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span className="line-clamp-2">{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Take an interview to unlock concrete strength metrics.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Priority Focus Areas
                </span>
                {allWeaknesses.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {allWeaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span className="line-clamp-2">{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    AI detects areas to tighten (e.g. system sizing, STAR structure).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onNavigate("learning")}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-800 dark:text-white rounded-lg transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explore Role Study Guides</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Interviews List */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Mock Interviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review transcripts, rubrics, and model answers
            </p>
          </div>
          {interviews.length > 0 && (
            <button
              onClick={() => onNavigate("history")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all ({interviews.length})
            </button>
          )}
        </div>

        {interviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">No interviews found yet.</p>
            <button
              onClick={() => onNavigate("interview_new")}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
            >
              Configure First Mock Interview
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interviews.slice(0, 4).map((session) => {
              const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={session.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-lg transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {session.evaluation?.overallScore ? `${session.evaluation.overallScore}%` : "—"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {session.config.targetRole}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{session.config.company || "Standard Tech"}</span>
                        <span>•</span>
                        <span>{session.config.interviewType}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {session.status === "completed" ? (
                      <button
                        onClick={() => onNavigate("interview_result", session.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
                      >
                        View Scorecard
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate("interview_room", session.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 transition"
                      >
                        Resume Session
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
