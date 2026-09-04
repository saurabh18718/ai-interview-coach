import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import {
  User,
  Building,
  Target,
  Globe,
  Volume2,
  Moon,
  Sun,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const ProfileSettingsView: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "Senior Software Engineer");
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany || "Google");
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || "Senior");
  const [skills, setSkills] = useState(user?.skills || "Distributed Systems, Caching, Go, Microservices");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        targetRole,
        targetCompany,
        experienceLevel,
        skills,
      });
      toast.success("Profile Updated", "Your coaching settings have been saved.");
    } catch (err: any) {
      toast.error("Save Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetLocalStorage = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your local simulated cache? This will reset all demo interview sessions."
      )
    ) {
      localStorage.removeItem("aivm_simulated_interviews");
      localStorage.removeItem("aivm_simulated_bookmarks");
      toast.info("Cache Reset", "Local mock interview history cleared.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Coaching Profile & Settings
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Configure your career trajectory, target companies, and AI interviewer defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider pb-2 border-b border-neutral-100 dark:border-neutral-800">
            Candidate Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Full Name / Alias
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Target Job Role
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Lead Distributed Systems Engineer"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Dream / Target Company
              </label>
              <input
                type="text"
                required
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Stripe, OpenAI, Google"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Seniority Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              >
                <option value="Entry-Level">Entry-Level (0-2 YOE)</option>
                <option value="Mid-Level">Mid-Level (2-5 YOE)</option>
                <option value="Senior">Senior (5-8 YOE)</option>
                <option value="Staff / Principal">Staff / Principal (8+ YOE)</option>
                <option value="Engineering Manager">Engineering Manager / Director</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Key Technical Skills & Competencies
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Distributed Systems, Kafka, Go, PostgreSQL, Caching"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
              The AI interviewer dynamically tailors deep-dive questions around these core technologies.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={signOut}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
          >
            Sign Out of Profile
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Local Data Management</span>
        </div>
        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Clear your simulated local interview sessions, cached transcripts, and saved bookmarks.
        </p>
        <button
          type="button"
          onClick={handleResetLocalStorage}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Local Session Storage</span>
        </button>
      </div>
    </div>
  );
};
