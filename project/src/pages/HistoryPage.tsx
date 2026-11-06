import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorAlert } from "../components/ErrorAlert";
import { ArrowRightIcon } from "../components/icons";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { formatDate } from "../lib/format";
import { listRecentLessons } from "../lib/lessonStore";
import type { SavedLesson } from "../types/learning";

export function HistoryPage() {
  const [lessons, setLessons] = useState<SavedLesson[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    listRecentLessons(100)
      .then((items) => {
        if (active) setLessons(items);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div>
      <PageHeader
        eyebrow="Learning History"
        title="Your lessons"
        description="Revisit any lesson you have created. Your most recent lessons appear first."
      />

      {error && <ErrorAlert message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
      {!error && lessons === null && <LoadingState message="Loading your lessons..." />}
      {!error && lessons?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-navy-600 p-8 text-center">
          <p className="text-slate-300">No lessons yet.</p>
          <Link
            to="/learn"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Create your first lesson
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
      {!error && lessons && lessons.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                to={`/history/${lesson.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-navy-700 bg-navy-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium text-cyan-300">{formatDate(lesson.created_at)}</p>
                  <p className="truncate text-base font-semibold text-white">{lesson.topic}</p>
                  <p className="truncate text-sm text-slate-400">{lesson.title}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
