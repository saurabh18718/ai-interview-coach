import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { STUDY_TOPICS } from "../data/mockContent";
import { StudyTopic } from "../types";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X,
} from "lucide-react";

interface LearningViewProps {
  initialTopic?: string;
  onPracticeTopic: (prompt: string) => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  initialTopic,
  onPracticeTopic,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [topics, setTopics] = useState<StudyTopic[]>(STUDY_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(
    STUDY_TOPICS.find((t) => t.title.toLowerCase().includes(initialTopic?.toLowerCase() || "")) ||
      STUDY_TOPICS[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);

  // AI Generated Custom Guide state
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [activeGuideModal, setActiveGuideModal] = useState<any | null>(null);

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleComplete = (id: string) => {
    if (completedTopicIds.includes(id)) {
      setCompletedTopicIds(completedTopicIds.filter((tid) => tid !== id));
      toast.info("Progress Updated", "Marked topic as uncompleted.");
    } else {
      setCompletedTopicIds([...completedTopicIds, id]);
      toast.success("Great job!", "Topic marked as mastered.");
    }
  };

  const handleGenerateCustomGuide = async (topicName: string) => {
    if (!topicName.trim()) return;
    setIsGeneratingGuide(true);
    try {
      const res = await fetch("/api/learning/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicName,
          role: user?.targetRole || "Software Engineer",
          level: user?.experienceLevel || "Senior",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate guide");

      const data = await res.json();
      setActiveGuideModal(data);
      toast.success("Masterclass Guide Generated", `Tailored for ${user?.targetRole || "your role"}.`);
    } catch (err: any) {
      toast.error("Generation Error", err.message);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-indigo-700 dark:text-indigo-400">
              Personalized Curriculum
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              Role: {user?.targetRole || "Software Engineer"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Role-Specific Study Roadmaps
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Master core conceptual invariants, architectural trade-offs, and common interviewer traps.
          </p>
        </div>

        {/* Generate Custom Topic Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customTopicInput}
            onChange={(e) => setCustomTopicInput(e.target.value)}
            placeholder="Generate on any topic (e.g. Raft Consensus)..."
            className="px-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
          />
          <button
            onClick={() => handleGenerateCustomGuide(customTopicInput)}
            disabled={isGeneratingGuide || !customTopicInput.trim()}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 disabled:opacity-40 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingGuide ? "Crafting..." : "Generate Guide"}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study topics or categories..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition shadow-sm"
        />
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic) => {
          const isCompleted = completedTopicIds.includes(topic.id);

          return (
            <div
              key={topic.id}
              className={`bg-white dark:bg-neutral-900 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                isCompleted
                  ? "border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {topic.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-3 h-3" />
                    <span>{topic.estimatedMinutes}m</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                  {topic.summary}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
                    Core Architectural Insights:
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                    {topic.keyPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleComplete(topic.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isCompleted ? "Mastered" : "Mark Mastered"}</span>
                </button>

                <button
                  onClick={() => handleGenerateCustomGuide(topic.title)}
                  className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
                >
                  <span>Deep Dive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Deep Dive Modal */}
      {activeGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-indigo-700 dark:text-indigo-400">
                  AI Masterclass Guide
                </span>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                  {activeGuideModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveGuideModal(null)}
                className="p-1 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl whitespace-pre-wrap">
              {activeGuideModal.overview}
            </div>

            {/* Key Concepts */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block">
                Foundational Concepts & Trade-offs
              </span>
              <div className="space-y-3">
                {activeGuideModal.keyConcepts?.map((kc: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs space-y-1"
                  >
                    <span className="font-bold text-neutral-900 dark:text-white">{kc.title}</span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {kc.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Questions */}
            {activeGuideModal.sampleQuestions?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block">
                  High-Stakes Interview Questions on This Topic
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {activeGuideModal.sampleQuestions.map((sq: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Q:</span>
                      <span>{sq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setActiveGuideModal(null)}
                className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
