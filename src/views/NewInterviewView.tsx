import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { InterviewConfig, InterviewSession } from "../types";
import { saveInterviewSession } from "../lib/firebase";
import {
  Sparkles,
  ArrowRight,
  Play,
  Building,
  Target,
  Clock,
  HelpCircle,
  Cpu,
  Layers,
} from "lucide-react";

interface NewInterviewViewProps {
  onStartSession: (sessionId: string) => void;
  onCancel: () => void;
}

export const NewInterviewView: React.FC<NewInterviewViewProps> = ({
  onStartSession,
  onCancel,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<InterviewConfig>({
    targetRole: user?.targetRole || "Senior Software Engineer",
    company: user?.targetCompany || "Google",
    experienceLevel: user?.experienceLevel || "Senior",
    interviewType: user?.preferredInterviewType || "System Design",
    difficulty: "Medium",
    durationMinutes: 20,
    totalQuestions: 4,
    topics: user?.skills || "Distributed Systems, Microservices, Caching",
    focusArea: "Scalability and Architectural Trade-offs",
  });

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend to generate opening greeting & first question
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: user,
          config,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize interview room");
      }

      const data = await res.json();
      const sessionId = `sess_${Date.now()}`;

      const newSession: InterviewSession = {
        id: sessionId,
        userId: user?.uid || "usr_guest",
        config,
        status: "in_progress",
        currentQuestionIndex: 1,
        elapsedSeconds: 0,
        currentQuestionText: data.firstQuestion,
        messages: [
          {
            id: `msg_${Date.now()}_1`,
            sender: "ai",
            text: `${data.greeting}\n\n**Question 1 of ${config.totalQuestions}:**\n${data.firstQuestion}`,
            timestamp: new Date().toISOString(),
            questionNumber: 1,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInterviewSession(newSession);
      toast.success("Interview Room Ready", "Interviewer connected. Good luck!");
      onStartSession(sessionId);
    } catch (err: any) {
      toast.error("Initialization Failed", err.message || "Could not launch interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Configure Mock Interview
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Customize your interviewer's persona, question depth, and company evaluation rubric.
        </p>
      </div>

      <form onSubmit={handleLaunch} className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-sm">
          {/* Target Role & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Target Job Role
              </label>
              <input
                type="text"
                required
                value={config.targetRole}
                onChange={(e) => setConfig({ ...config, targetRole: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Target Company / Style
              </label>
              <input
                type="text"
                required
                value={config.company}
                onChange={(e) => setConfig({ ...config, company: e.target.value })}
                placeholder="e.g. Stripe, Google, Fast-Growth Fintech"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          {/* Interview Type & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Interview Type
              </label>
              <select
                value={config.interviewType}
                onChange={(e) => setConfig({ ...config, interviewType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value="System Design">System Design & Cloud Architecture</option>
                <option value="Technical">Technical & Algorithm Trade-offs</option>
                <option value="Behavioral">Behavioral (STAR & Leadership Principles)</option>
                <option value="HR & Cultural">HR & Cultural Fit</option>
                <option value="Mixed Comprehensive">Comprehensive End-to-End Loop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Experience Level
              </label>
              <select
                value={config.experienceLevel}
                onChange={(e) => setConfig({ ...config, experienceLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value="Entry-Level">Entry-Level / Graduate</option>
                <option value="Mid-Level">Mid-Level (2-5 Years)</option>
                <option value="Senior">Senior (5-8 Years)</option>
                <option value="Staff / Principal">Staff / Principal (8+ Years)</option>
                <option value="Engineering Lead">Engineering Management / Lead</option>
              </select>
            </div>
          </div>

          {/* Difficulty & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Difficulty Tier
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value="Easy">Standard / Warmup</option>
                <option value="Medium">Rigorous (Standard Tier 1)</option>
                <option value="Hard">Challenging / Edge Cases</option>
                <option value="Executive / FAANG">Executive / Staff Committee Bar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Target Duration
              </label>
              <select
                value={config.durationMinutes}
                onChange={(e) => setConfig({ ...config, durationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value={15}>15 Minutes (Express)</option>
                <option value={25}>25 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Full Deep Dive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                Total Questions
              </label>
              <select
                value={config.totalQuestions}
                onChange={(e) => setConfig({ ...config, totalQuestions: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value={3}>3 Questions (Fast)</option>
                <option value={4}>4 Questions (Balanced)</option>
                <option value={5}>5 Questions (In-depth)</option>
                <option value={6}>6 Questions (Exhaustive)</option>
              </select>
            </div>
          </div>

          {/* Topics & Focus Areas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Specific Technical Topics or Focus Areas (Optional)
            </label>
            <input
              type="text"
              value={config.topics}
              onChange={(e) => setConfig({ ...config, topics: e.target.value })}
              placeholder="e.g. Distributed Caching, Redis, Kafka, Concurrency, SQL optimization"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {loading ? (
              <span>Preparing Interview Room...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Mock Interview</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
