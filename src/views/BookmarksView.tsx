import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { getUserBookmarks, toggleBookmark } from "../lib/firebase";
import { BookmarkItem } from "../types";
import {
  Bookmark,
  BookOpen,
  FileText,
  Trash2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface BookmarksViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "book" | "blog" | "topic">("all");

  const loadData = () => {
    if (!user) return;
    const bms = getUserBookmarks(user.uid);
    setBookmarks(bms);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRemove = async (bm: BookmarkItem) => {
    if (!user) return;
    await toggleBookmark(user.uid, bm.itemType, bm.itemId, bm.title, bm.subtitle);
    toast.info("Bookmark Removed", `"${bm.title}" was removed.`);
    setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
  };

  const filtered =
    filterType === "all" ? bookmarks : bookmarks.filter((b) => b.itemType === filterType);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Saved Library & Bookmarks
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Your saved interview playbooks, tactical blog posts, and study references.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["all", "book", "blog", "topic"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filterType === type
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {type === "all" ? "All Items" : `${type}s`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Loading bookmarks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Bookmark className="w-10 h-10 text-neutral-600 dark:text-neutral-400 mx-auto" />
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            No bookmarks saved
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto">
            Click the bookmark icon on any digital book chapter or blog article to save it here for offline study.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((bm) => (
            <div
              key={bm.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-sm transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                  <span className="flex items-center gap-1 uppercase tracking-wider font-semibold text-[10px]">
                    {bm.itemType === "book" ? (
                      <>
                        <BookOpen className="w-3 h-3 text-indigo-500" /> Digital Book
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 text-emerald-500" /> Article
                      </>
                    )}
                  </span>
                  <span>{new Date(bm.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                  {bm.title}
                </h3>
                {bm.subtitle && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    {bm.subtitle}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleRemove(bm)}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-rose-700 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (bm.itemType === "book") onNavigate("books");
                    else if (bm.itemType === "blog") onNavigate("blogs");
                    else onNavigate("practice");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  <span>Open Content</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
