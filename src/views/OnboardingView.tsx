import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import {
  Sparkles,
  ArrowRight,
  Check,
  Briefcase,
  GraduationCap,
  Target,
  Play,
  LayoutDashboard,
  WifiOff,
} from "lucide-react";
import { isClientOnline, onOnlineStatusChange } from "../lib/firebase";

interface OnboardingViewProps {
  onComplete: () => void;
  onStartPractice?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onStartPractice }) => {
  const { user, updateProfileData } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [online, setOnline] = useState(isClientOnline());

  useEffect(() => {
    const unsub = onOnlineStatusChange((status) => setOnline(status));
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    currentRole: user?.currentRole || "",
    targetRole: user?.targetRole || "Senior Software Engineer",
    targetCompany: user?.targetCompany || "Google / Stripe / Tech Leaders",
    experienceLevel: user?.experienceLevel || ("Senior" as any),
    education: user?.education || "University of California, Berkeley",
    degree: user?.degree || "B.S. in Computer Science",
    skills: user?.skills || "TypeScript, React, Node.js, Distributed Systems, Redis, SQL",
    workExperience: user?.workExperience || "4+ years building high-throughput microservices and responsive web platforms.",
    careerGoals: user?.careerGoals || "Master executive presence, pass Staff-level system design, and land a tier-1 offer.",
    preferredInterviewType: user?.preferredInterviewType || ("System Design" as any),
  });

  const [saving, setSaving] = useState(false);

  const handleFinalSubmit = async (destination: "interview" | "dashboard") => {
    if (saving) return;
    setSaving(true);

    // Timeout safety guarantee: never block navigation longer than 3 seconds
    const safetyTimer = setTimeout(() => {
      setSaving(false);
      if (destination === "interview" && onStartPractice) {
        onStartPractice();
      } else {
        onComplete();
      }
    }, 3000);

    try {
      // updateProfileData updates React state and local storage immediately,
      // and triggers background sync to Firestore
      await updateProfileData({
        ...formData,
        onboardingCompleted: true,
      });
      clearTimeout(safetyTimer);
      toast.success("Profile Calibrated", "Your AI interview coach is configured and ready.");

      if (destination === "interview" && onStartPractice) {
        onStartPractice();
      } else {
        onComplete();
      }
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.warn("Onboarding save fallback to offline cache:", err);
      toast.info("Offline Calibration", "Saved locally. Changes will sync once network is stable.");
      if (destination === "interview" && onStartPractice) {
        onStartPractice();
      } else {
        onComplete();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Offline sync notice if client is currently offline */}
      {!online && (
        <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Offline mode active — your profile will save locally and sync automatically to Firestore once connection returns.</span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
          <span>Step {step} of 3</span>
          <span>
            {step === 1
              ? "Target Role & Ambition"
              : step === 2
              ? "Education & Core Skills"
              : "Experience & Career Vision"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-1">
                <Target className="w-5 h-5" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Target Position & Ambition</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                AIVM dynamically adapts its question difficulty and rubric to the exact role and company tier you are targeting.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g. Machine Learning Engineer, Staff Frontend Architect, Product Manager"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Company / Tier
                </label>
                <input
                  type="text"
                  value={formData.targetCompany}
                  onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                  placeholder="e.g. Stripe, Google, Series B Startup"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Experience Tier
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
                >
                  <option value="Entry-Level">Entry-Level (0-2 years)</option>
                  <option value="Mid-Level">Mid-Level (2-5 years)</option>
                  <option value="Senior">Senior (5-8 years)</option>
                  <option value="Lead / Staff">Lead / Staff (8+ years)</option>
                  <option value="Principal / Director">Principal / Director (12+ years)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Primary Interview Focus Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Technical", "System Design", "Behavioral", "Mixed Comprehensive"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredInterviewType: type as any })}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border transition ${
                      formData.preferredInterviewType === type
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-1">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Education & Core Skills</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Help the interviewer frame technical questions around your specific stack and background.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g. Stanford University / Self-Taught Bootcamp"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Degree / Major
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. B.S. Computer Science / Information Systems"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Core Technical Skills & Keywords (Comma-separated)
              </label>
              <textarea
                rows={3}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Go, Kubernetes, Kafka, React, AWS, Microservices Architecture, Distributed Caching"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-1">
                <Briefcase className="w-5 h-5" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Experience & Career Vision</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Share your background stories, recent projects, and specific skills you want to drill.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Current / Most Recent Role
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                placeholder="e.g. Full Stack Engineer at Fintech Scaleup"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Work Experience & Key Project Highlights
              </label>
              <textarea
                rows={3}
                value={formData.workExperience}
                onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                placeholder="Briefly describe 1-2 major projects, architectures you designed, or scale challenges you solved..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Career Vision & Target Areas to Master
              </label>
              <input
                type="text"
                value={formData.careerGoals}
                onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                placeholder="e.g. Overcoming filler words, mastering system sizing, transitioning to Staff"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleFinalSubmit("dashboard")}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Complete & Enter Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinalSubmit("interview")}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{saving ? "Calibrating..." : "Start & Practice Interview"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
