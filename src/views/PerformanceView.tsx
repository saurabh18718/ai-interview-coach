import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserInterviews } from "../lib/firebase";
import { InterviewSession } from "../types";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Target,
  Clock,
  ArrowRight,
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
  Cell,
} from "recharts";

interface PerformanceViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid).then((list) => {
      setSessions(list);
      setLoading(false);
    });
  }, [user]);

  const completed = sessions.filter((s) => s.status === "completed" && s.evaluation);
  const totalCount = completed.length;

  const avgOverall =
    totalCount > 0
      ? Math.round(
          completed.reduce((acc, s) => acc + (s.evaluation?.overallScore || 0), 0) / totalCount
        )
      : 0;

  const avgTech =
    totalCount > 0
      ? Math.round(
          completed.reduce((acc, s) => acc + (s.evaluation?.technicalScore || 0), 0) / totalCount
        )
      : 0;

  const avgComm =
    totalCount > 0
      ? Math.round(
          completed.reduce((acc, s) => acc + (s.evaluation?.communicationScore || 0), 0) / totalCount
        )
      : 0;

  const avgProblem =
    totalCount > 0
      ? Math.round(
          completed.reduce((acc, s) => acc + (s.evaluation?.problemSolvingScore || 0), 0) /
            totalCount
        )
      : 0;

  const bestScore =
    totalCount > 0 ? Math.max(...completed.map((s) => s.evaluation?.overallScore || 0)) : 0;

  // Trend data
  const trendData = [...completed]
    .reverse()
    .map((s, idx) => ({
      name: `Session ${idx + 1}`,
      overall: s.evaluation?.overallScore || 0,
      tech: s.evaluation?.technicalScore || 0,
      comm: s.evaluation?.communicationScore || 0,
      problem: s.evaluation?.problemSolvingScore || 0,
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

  const dimensionData = [
    { name: "Technical Depth", score: avgTech, color: "#10b981" },
    { name: "Communication / STAR", score: avgComm, color: "#6366f1" },
    { name: "Problem Solving", score: avgProblem, color: "#0ea5e9" },
    { name: "Overall Index", score: avgOverall, color: "#f59e0b" },
  ];

  const allStrengths = Array.from(
    new Set(completed.flatMap((s) => s.evaluation?.strengths || []))
  ).slice(0, 5);

  const allWeaknesses = Array.from(
    new Set(completed.flatMap((s) => s.evaluation?.weaknesses || []))
  ).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Performance Analytics & Rubric Tracking
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Historical analysis of your mock interview performance, rubric trends, and recurring areas for growth.
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <BarChart2 className="w-12 h-12 text-neutral-600 dark:text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No Completed Interviews Yet
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            Once you complete mock interviews, your dimensional performance charts and improvement velocity will be recorded here automatically.
          </p>
          <button
            onClick={() => onNavigate("interview_new")}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition"
          >
            Launch First Interview
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Average Overall Score
              </span>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {avgOverall}%
              </div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 block">
                Across {totalCount} evaluated sessions
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Peak Score
              </span>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {bestScore}%
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                Top performance benchmark
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Technical Mastery
              </span>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {avgTech}%
              </div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 block">
                Average technical dimension
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Communication Quality
              </span>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {avgComm}%
              </div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 block">
                STAR structure and conciseness
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                Progress Velocity Over Time
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6">
                Tracking improvement across subsequent interview attempts
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis domain={[40, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#262626",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      name="Overall Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="tech"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name="Technical"
                    />
                    <Line
                      type="monotone"
                      dataKey="comm"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name="Communication"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dimension Breakdown Bar Chart */}
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                Core Competency Dimensional Balance
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6">
                Comparative rating across evaluated scoring pillars
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dimensionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#262626",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {dimensionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Aggregated Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4" /> Consistently Praised Strengths
              </span>
              <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                {allStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-4 h-4" /> Recurring Coaching Feedback
              </span>
              <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                {allWeaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
