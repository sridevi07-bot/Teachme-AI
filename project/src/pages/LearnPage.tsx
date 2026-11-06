import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorAlert } from "../components/ErrorAlert";
import { LessonView } from "../components/LessonView";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { TopicForm } from "../components/TopicForm";
import { generateLesson } from "../lib/aiClient";
import { saveLesson } from "../lib/lessonStore";
import type { Lesson } from "../types/learning";

type Status = "idle" | "loading" | "ready" | "error";

export function LearnPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get("topic")?.trim() ?? "";

  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState("");
  const [saveWarning, setSaveWarning] = useState("");

  const requestIdRef = useRef(0);
  const startedTopicRef = useRef("");

  async function generate(nextTopic: string) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setError("");
    setSaveWarning("");
    setLesson(null);
    setTopic(nextTopic);

    try {
      const created = await generateLesson(nextTopic);
      if (requestId !== requestIdRef.current) return;

      setLesson(created);
      setStatus("ready");

      try {
        await saveLesson(nextTopic, created);
      } catch (saveErr) {
        if (requestId !== requestIdRef.current) return;
        setSaveWarning(saveErr instanceof Error ? saveErr.message : "Could not save this lesson to history.");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!topicParam || startedTopicRef.current === topicParam) return;
    startedTopicRef.current = topicParam;
    generate(topicParam);
  }, [topicParam]);

  function handleSubmit(nextTopic: string) {
    startedTopicRef.current = nextTopic;
    setSearchParams({ topic: nextTopic });
    generate(nextTopic);
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Learning"
        title="Learn any topic"
        description="Type any subject and get a clear, step-by-step lesson with examples and a short summary."
      />

      <div className="mb-10 max-w-3xl">
        <TopicForm
          initialValue={topicParam}
          placeholder="What would you like to learn today?"
          submitLabel="Create lesson"
          disabled={status === "loading"}
          onSubmit={handleSubmit}
        />
      </div>

      {status === "loading" && <LoadingState message={`Writing a beginner-friendly lesson on "${topic}"...`} />}

      {status === "error" && (
        <ErrorAlert message={error} onRetry={topic ? () => generate(topic) : undefined} />
      )}

      {status === "idle" && (
        <div className="rounded-2xl border border-dashed border-navy-600 p-8 text-center">
          <p className="text-slate-300">Your lesson will appear here.</p>
          <p className="mt-1 text-sm text-slate-400">Try a topic like "How do plants make food?"</p>
        </div>
      )}

      {status === "ready" && lesson && (
        <div className="space-y-6">
          {saveWarning && <ErrorAlert message={saveWarning} />}
          <LessonView topic={topic} lesson={lesson} />
        </div>
      )}
    </div>
  );
}
