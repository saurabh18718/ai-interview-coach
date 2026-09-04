import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { INITIAL_PRACTICE_QUESTIONS } from "../data/mockContent";
import { PracticeQuestionItem, PracticeEvaluationResult } from "../types";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  Lightbulb,
  Award,
  RefreshCw,
  Clock,
  BookOpen,
} from "lucide-react";

export const PracticeView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [questions, setQuestions] = useState<PracticeQuestionItem[]>(INITIAL_PRACTICE_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestionItem>(INITIAL_PRACTICE_QUESTIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PracticeEvaluationResult | null>(null);
  const [showHints, setShowHints] = useState(false);

  const categories = ["All", "Behavioral", "System Design", "Technical", "HR", "Leadership"];

  const filteredQuestions =
    selectedCategory === "All"
      ? questions
      : questions.filter((q) => q.category === selectedCategory);

  // Generate new practice question via Gemini
  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/practice/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory === "All" ? "Technical" : selectedCategory,
          difficulty: "Medium",
          targetRole: user?.targetRole || "Software Engineer",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate question");

      const data = await res.json();
      const newQ: PracticeQuestionItem = {
        id: `pq_${Date.now()}`,
        category: (data.category as any) || "Technical",
        role: user?.targetRole || "Software Engineer",
        difficulty: data.difficulty || "Medium",
        question: data.question,
        hints: data.hints || [],
        evaluationCriteria: data.evaluationCriteria,
      };

      setQuestions([newQ, ...questions]);
      setSelectedQuestion(newQ);
      setUserAnswer("");
      setEvaluationResult(null);
      setShowHints(false);
      toast.success("New AI Question Ready", "Formulated based on your role and industry trends.");
    } catch (err: any) {
      toast.error("Generation Error", err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate candidate's answer
  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      toast.error("Input required", "Please type your answer before submitting.");
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/practice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedQuestion.category,
          question: selectedQuestion.question,
          answer: userAnswer,
          targetRole: user?.targetRole || "Software Engineer",
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();
      setEvaluationResult(data);
      toast.success("Answer Evaluated", `Score: ${data.score}%`);
    } catch (err: any) {
      toast.error("Evaluation Error", err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Single-Question Practice Mode
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Hone individual behavioral, system design, or technical answers with instant AI feedback.
          </p>
        </div>

        <button
          onClick={handleGenerateQuestion}
          disabled={isGenerating}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "Generating Question..." : "Generate New AI Question"}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Question Picker + Practice Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions List */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2 h-fit max-h-[600px] overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 px-2 mb-2">
            Practice Library ({filteredQuestions.length})
          </div>

          {filteredQuestions.map((q) => {
            const isSelected = selectedQuestion.id === q.id;

            return (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setEvaluationResult(null);
                  setShowHints(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-xs transition space-y-1.5 ${
                  isSelected
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-neutral-900/10 dark:text-neutral-900"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {q.category}
                  </span>
                  <span className="text-[10px] opacity-75">{q.difficulty}</span>
                </div>
                <p className="font-medium line-clamp-2 leading-relaxed">{q.question}</p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Question Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  {selectedQuestion.category}
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  {selectedQuestion.difficulty} Difficulty
                </span>
              </div>

              {selectedQuestion.hints?.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHints ? "Hide Hints" : "View Hints"}</span>
                </button>
              )}
            </div>

            <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-relaxed">
              {selectedQuestion.question}
            </h2>

            {showHints && selectedQuestion.hints?.length > 0 && (
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200">
                <span className="font-semibold block uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-400">
                  Framework & Strategic Hints
                </span>
                <ul className="list-disc list-inside space-y-1">
                  {selectedQuestion.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Input Area */}
            <form onSubmit={handleEvaluateAnswer} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Answer
                </label>
                <textarea
                  rows={6}
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Structure your answer clearly (e.g. STAR Situation/Task/Action/Result or Architecture components)..."
                  className="w-full p-4 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  type="submit"
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 disabled:opacity-40 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEvaluating ? "Evaluating with Gemini..." : "Evaluate My Answer"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Evaluation Result Display */}
          {evaluationResult && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    AI Rubric Evaluation
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Detailed benchmark against {user?.experienceLevel || "Senior"} standards
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-neutral-900 dark:text-white">
                    {evaluationResult.score}%
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                    {evaluationResult.score >= 80 ? "Pass Rating" : "Needs Revision"}
                  </span>
                </div>
              </div>

              <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                {evaluationResult.feedback}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                    {evaluationResult.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <HelpCircle className="w-3.5 h-3.5" /> Improvements
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                    {evaluationResult.improvements?.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Model Answer */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-2">
                  Exemplar Answer Architecture
                </span>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs leading-relaxed text-neutral-900 dark:text-neutral-100 font-sans whitespace-pre-wrap">
                  {evaluationResult.idealAnswer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
