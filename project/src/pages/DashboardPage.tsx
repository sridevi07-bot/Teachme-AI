import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorAlert } from "../components/ErrorAlert";
import { ArrowRightIcon } from "../components/icons";
import { LoadingState } from "../components/LoadingState";
import { TopicForm } from "../components/TopicForm";
import { listRecentLessons } from "../lib/lessonStore";
import { formatDate, greetingFor } from "../lib/format";
import { SUGGESTED_SUBJECTS } from "../lib/suggestedSubjects";
import type { SavedLesson } from "../types/learning";

export function DashboardPage() {
  const navigate = useNavigate();
  const [greeting] = useState(() => greetingFor(new Date()));
  const [recent, setRecent] = useState<SavedLesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    listRecentLessons()
      .then((lessons) => {
        if (active) setRecent(lessons);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function startLesson(topic: string) {
    navigate(`/learn?topic=${encodeURIComponent(topic)}`);
  }

  return (
    <div className="space-y-12">
      <section className="animate-fade-up space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-cyan-300">{greeting}, learner</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Welcome to TeachMe AI</h1>
          <p className="max-w-2xl text-base leading-[1.5] text-slate-300 sm:text-lg">
            Your personal AI teacher explains any subject in simple language, with examples, steps, and a quick quiz to
            check what you learned.
          </p>
        </div>
        <div className="max-w-3xl">
          <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">What would you like to learn today?</h2>
          <TopicForm
            size="large"
            placeholder="For example: photosynthesis, fractions, or the French Revolution"
            submitLabel="Start learning"
            onSubmit={startLesson}
          />
        </div>
      </section>

      <section aria-labelledby="suggested-heading" className="space-y-5">
        <h2 id="suggested-heading" className="text-xl sm:text-2xl">
          Suggested subjects
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SUGGESTED_SUBJECTS.map((subject) => (
            <div
              key={subject.name}
              className="rounded-2xl border border-navy-700 bg-navy-850 p-5 transition-colors duration-200 hover:border-navy-600"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <subject.Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base">{subject.name}</h3>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {subject.topics.map((topic) => (
                  <li key={topic}>
                    <button
                      type="button"
                      onClick={() => startLesson(topic)}
                      className="rounded-full border border-navy-600 px-3 py-1.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400"
                    >
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-xl sm:text-2xl">
            Recently studied
          </h2>
          {recent && recent.length > 0 && (
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>

        {error && <ErrorAlert message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
        {!error && recent === null && <LoadingState message="Loading your recent lessons..." />}
        {!error && recent?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-navy-600 p-8 text-center">
            <p className="text-slate-300">You have not studied anything yet.</p>
            <p className="mt-1 text-sm text-slate-400">Pick a subject above to create your first lesson.</p>
          </div>
        )}
        {!error && recent && recent.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recent.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  to={`/history/${lesson.id}`}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-navy-700 bg-navy-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                  <span className="text-xs font-medium text-cyan-300">{formatDate(lesson.created_at)}</span>
                  <span className="text-base font-semibold text-white">{lesson.topic}</span>
                  <span className="line-clamp-2 text-sm leading-[1.5] text-slate-400">{lesson.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
