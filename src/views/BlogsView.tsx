import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { BLOG_POSTS } from "../data/mockContent";
import { BlogPost } from "../types";
import { toggleBookmark, isItemBookmarked } from "../lib/firebase";
import {
  FileText,
  Bookmark,
  Search,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Share2,
} from "lucide-react";

export const BlogsView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [posts] = useState<BlogPost[]>(BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Behavioral", "System Design", "Strategy", "Career"];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleBookmark = async (post: BlogPost) => {
    if (!user) return;
    const added = await toggleBookmark(user.uid, "blog", post.id, post.title, post.snippet);
    if (added) {
      toast.success("Article Bookmarked", `Saved "${post.title}".`);
    } else {
      toast.info("Bookmark Removed", `"${post.title}" removed.`);
    }
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link Copied", "Article link copied to clipboard.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {selectedPost ? (
        /* Article Reading View */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBookmark(selectedPost)}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <Bookmark className={`w-4 h-4 ${user && isItemBookmarked(user.uid, "blog", selectedPost.id) ? "fill-current text-indigo-600" : ""}`} />
              </button>
              <button
                onClick={() => handleShare(selectedPost)}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                {selectedPost.category}
              </span>
              <span>•</span>
              <span className="text-neutral-600 dark:text-neutral-400">{selectedPost.date}</span>
              <span>•</span>
              <span className="text-neutral-600 dark:text-neutral-400">{selectedPost.readTime}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              {selectedPost.title}
            </h1>

            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              {selectedPost.snippet}
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-[10px]">
                {selectedPost.author.charAt(0)}
              </div>
              <span className="font-medium">{selectedPost.author}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="space-y-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed pt-6 border-t border-neutral-200 dark:border-neutral-800 font-sans">
            {selectedPost.content.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
            {selectedPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Blog Index */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Interview Prep & Career Articles
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Field-tested strategies for salary negotiation, executive presence, and back-of-the-envelope estimations.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles & tags..."
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedPost(post)}
                    className="text-lg font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer leading-snug"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {post.snippet}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <span>By {post.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBookmark(post)}
                      className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Bookmark article"
                    >
                      <Bookmark className={`w-4 h-4 ${user && isItemBookmarked(user.uid, "blog", post.id) ? "fill-current text-indigo-600" : ""}`} />
                    </button>

                    <button
                      onClick={() => setSelectedPost(post)}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
