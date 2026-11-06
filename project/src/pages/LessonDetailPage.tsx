import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";
import { ErrorAlert } from "../components/ErrorAlert";
import { LessonView } from "../components/LessonView";
import { LoadingState } from "../components/LoadingState";
import { getLesson } from "../lib/lessonStore";
import { formatDate } from "../lib/format";
import type { SavedLesson } from "../types/learning";

export function LessonDetailPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<SavedLesson | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!lessonId) return;
    let active = true;
    setState("loading");
    setError("");
    getLesson(lessonId)
      .then((found) => {
        if (!active) return;
        if (found) {
          setLesson(found);
          setState("ready");
        } else {
          setLesson(null);
          setState("missing");
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [lessonId, reloadKey]);

  return (
    <div className="space-y-8">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to history
      </Link>

      {state === "loading" && <LoadingState message="Opening your lesson..." />}

      {state === "error" && <ErrorAlert message={error} onRetry={() => setReloadKey((key) => key + 1)} />}

      {state === "missing" && (
        <div className="rounded-2xl border border-dashed border-navy-600 p-8 text-center">
          <p className="text-slate-300">This lesson could not be found.</p>
          <Link to="/history" className="mt-3 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Return to your history
          </Link>
        </div>
      )}

      {state === "ready" && lesson && (
        <>
          <p className="text-sm text-slate-400">Created {formatDate(lesson.created_at)}</p>
          <LessonView topic={lesson.topic} lesson={lesson.content} />
        </>
      )}
    </div>
  );
}
