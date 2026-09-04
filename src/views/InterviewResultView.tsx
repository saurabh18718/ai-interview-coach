import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getInterviewSession } from "../lib/firebase";
import { InterviewSession, QuestionCritique } from "../types";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

interface InterviewResultViewProps {
  sessionId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const InterviewResultView: React.FC<InterviewResultViewProps> = ({
  sessionId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!user) return;
    getInterviewSession(sessionId, user.uid).then((s) => {
      setSession(s);
      setLoading(false);

      if (s?.evaluation?.overallScore) {
        // Trigger confetti for solid performance
        if (s.evaluation.overallScore >= 75) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }

        // Count up animation
        const target = s.evaluation.overallScore;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            setAnimatedScore(target);
            clearInterval(interval);
          } else {
            setAnimatedScore(current);
          }
        }, 25);
      }
    });
  }, [sessionId, user]);

  if (loading || !session || !session.evaluation) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Loading Scorecard & Evaluation...
        </p>
      </div>
    );
  }

  const evalData = session.evaluation;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-indigo-700 dark:text-indigo-400">
              Mock Interview Scorecard
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {session.config.difficulty}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {session.config.targetRole}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Target Company: {session.config.company} • {session.config.interviewType} • Completed on{" "}
            {new Date(session.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate("interview_new")}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Loop</span>
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Score & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Big Overall Score Card */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 to-indigo-950 text-white rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300">
              Overall Score
            </span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-5xl font-black tracking-tight">{animatedScore}%</div>
            <div className="text-xs font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{evalData.verdict}</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-300 leading-snug">
            Calibrated against hiring standards for {session.config.experienceLevel} level.
          </p>
        </div>

        {/* Technical Score */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Technical Depth
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">
              {evalData.technicalScore}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${evalData.technicalScore}%` }}
            />
          </div>
        </div>

        {/* Communication Score */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Communication & STAR
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">
              {evalData.communicationScore}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${evalData.communicationScore}%` }}
            />
          </div>
        </div>

        {/* Problem Solving Score */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Problem Breakdown
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">
              {evalData.problemSolvingScore}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${evalData.problemSolvingScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Hiring Committee Summary
        </h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {evalData.summary}
        </p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-neutral-800 dark:text-neutral-200">
            {evalData.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>Targeted Improvement Areas</span>
          </div>
          <ul className="space-y-2 text-xs text-neutral-800 dark:text-neutral-200">
            {evalData.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Accordion with Better Answer Examples */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Question-by-Question Critique & Model Answers
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Click any question to inspect your response, the evaluator critique, and an exemplar high-scoring answer.
          </p>
        </div>

        <div className="space-y-3">
          {evalData.questionBreakdown?.map((q: QuestionCritique, idx: number) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                      {q.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {q.score}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
                    {/* Your Answer */}
                    <div>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1">
                        Your Stated Answer:
                      </span>
                      <p className="text-neutral-800 dark:text-neutral-200 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 italic">
                        "{q.candidateAnswer}"
                      </p>
                    </div>

                    {/* Critique */}
                    <div>
                      <span className="font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                        Evaluator Critique:
                      </span>
                      <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        {q.critique}
                      </p>
                    </div>

                    {/* Better Answer Example */}
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                        Exemplar Model Answer:
                      </span>
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-neutral-900 dark:text-neutral-100 font-sans leading-relaxed">
                        {q.betterAnswerExample}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Study Topics */}
      {evalData.recommendedStudyTopics?.length > 0 && (
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Recommended Study Topics
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Topics chosen specifically to address identified gaps in this session
              </p>
            </div>
            <button
              onClick={() => onNavigate("learning")}
              className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evalData.recommendedStudyTopics.map((topicItem, idx) => (
              <div
                key={idx}
                className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {topicItem.topic}
                  </h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-snug">
                    {topicItem.reason}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("learning", topicItem.topic)}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Generate Custom Guide</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
