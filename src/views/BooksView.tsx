import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { DIGITAL_BOOKS } from "../data/mockContent";
import { DigitalBook, BookChapter } from "../types";
import { toggleBookmark, isItemBookmarked } from "../lib/firebase";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Clock,
  User,
  Sparkles,
  Search,
} from "lucide-react";

export const BooksView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [books] = useState<DigitalBook[]>(DIGITAL_BOOKS);
  const [selectedBook, setSelectedBook] = useState<DigitalBook | null>(null);
  const [activeChapter, setActiveChapter] = useState<BookChapter | null>(null);
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBook = (book: DigitalBook) => {
    setSelectedBook(book);
    setActiveChapter(book.chapters[0] || null);
  };

  const handleToggleChapterRead = (chapterId: string) => {
    if (readChapters.includes(chapterId)) {
      setReadChapters(readChapters.filter((id) => id !== chapterId));
      toast.info("Progress Updated", "Chapter marked unread.");
    } else {
      setReadChapters([...readChapters, chapterId]);
      toast.success("Chapter Completed", "Keep up the reading streak!");
    }
  };

  const handleBookmarkBook = async (book: DigitalBook) => {
    if (!user) return;
    const added = await toggleBookmark(user.uid, "book", book.id, book.title, book.subtitle);
    if (added) {
      toast.success("Saved to Library", `"${book.title}" bookmarked.`);
    } else {
      toast.info("Removed Bookmark", `"${book.title}" removed.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* If reading a specific book */}
      {selectedBook && activeChapter ? (
        <div className="space-y-6">
          {/* Reader Top Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setSelectedBook(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>

            <button
              onClick={() => handleBookmarkBook(selectedBook)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Bookmark book"
            >
              <Bookmark className={`w-4 h-4 ${user && isItemBookmarked(user.uid, "book", selectedBook.id) ? "fill-current text-indigo-600" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chapters Table of Contents */}
            <div className="lg:col-span-4 space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 h-fit">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-400">
                  {selectedBook.category}
                </span>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  By {selectedBook.author}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                  Chapters ({selectedBook.chapters.length})
                </span>
                {selectedBook.chapters.map((ch, idx) => {
                  const isCurrent = activeChapter.id === ch.id;
                  const isRead = readChapters.includes(ch.id);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapter(ch)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-sm"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <span className="line-clamp-1">
                        {idx + 1}. {ch.title}
                      </span>
                      {isRead && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? "text-emerald-400 dark:text-emerald-600" : "text-emerald-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapter Content Reader */}
            <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Chapter Reading
                </span>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {activeChapter.title}
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed italic">
                  "{activeChapter.summary}"
                </p>
              </div>

              <div className="space-y-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                {activeChapter.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Action items box */}
              {activeChapter.actionItems?.length > 0 && (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                    Key Interview Takeaways & Action Items:
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200 list-disc list-inside">
                    {activeChapter.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Completion Toggle */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {readChapters.includes(activeChapter.id) ? "Completed" : "Not yet marked complete"}
                </span>

                <button
                  onClick={() => handleToggleChapterRead(activeChapter.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    readChapters.includes(activeChapter.id)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {readChapters.includes(activeChapter.id)
                      ? "Completed (Click to Unmark)"
                      : "Mark Chapter Completed"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Library Overview */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Digital Prep Books & Playbooks
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Rigorous, original field guides covering behavioral STAR mastery, 45-minute system design, and executive communication.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition group"
              >
                {/* Book Cover Gradient Header */}
                <div className={`p-6 bg-gradient-to-br ${book.coverColor} text-white space-y-2`}>
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span className="font-semibold uppercase tracking-wider">{book.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight leading-snug">{book.title}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">{book.subtitle}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{book.author}</span>
                    </div>

                    <div className="pt-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold block mb-1">Chapters included:</span>
                      <ul className="space-y-1">
                        {book.chapters.map((c, i) => (
                          <li key={c.id} className="line-clamp-1 text-neutral-600 dark:text-neutral-400">
                            {i + 1}. {c.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => handleBookmarkBook(book)}
                      className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Bookmark"
                    >
                      <Bookmark className={`w-4 h-4 ${user && isItemBookmarked(user.uid, "book", book.id) ? "fill-current text-indigo-600" : ""}`} />
                    </button>

                    <button
                      onClick={() => handleOpenBook(book)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Read Playbook</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
