import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { QuizQuestionCard } from "../components/QuizQuestionCard";
import { TopicForm } from "../components/TopicForm";
import { generateQuiz } from "../lib/aiClient";
import type { QuizQuestion } from "../types/learning";

const QUESTION_COUNTS = [3, 5, 8, 10];

type Status = "idle" | "loading" | "ready" | "error";

function resultMessage(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return "Perfect score. You really understand this topic.";
  if (ratio >= 0.6) return "Well done. Review the explanations for the ones you missed.";
  return "Keep going. Read the lesson again and try another quiz.";
}

export function QuizPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get("topic")?.trim() ?? "";

  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const startedTopicRef = useRef("");

  async function generate(nextTopic: string, nextCount: number) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setError("");
    setTopic(nextTopic);
    setQuestions([]);
    setAnswers({});

    try {
      const created = await generateQuiz(nextTopic, nextCount);
      if (requestId !== requestIdRef.current) return;
      setQuestions(created);
      setStatus("ready");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!topicParam || startedTopicRef.current === topicParam) return;
    startedTopicRef.current = topicParam;
    generate(topicParam, count);
    // Only auto-start when the topic in the URL changes; count is chosen in the form.
  }, [topicParam]);

  function handleSubmit(nextTopic: string) {
    startedTopicRef.current = nextTopic;
    setSearchParams({ topic: nextTopic });
    generate(nextTopic, count);
  }

  function selectAnswer(questionIndex: number, optionIndex: number) {
    setAnswers((current) => (current[questionIndex] !== undefined ? current : { ...current, [questionIndex]: optionIndex }));
  }

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce(
    (total, question, index) => (answers[index] === question.answerIndex ? total + 1 : total),
    0,
  );
  const finished = status === "ready" && questions.length > 0 && answeredCount === questions.length;

  return (
    <div>
      <PageHeader
        eyebrow="Quiz Generator"
        title="Test what you know"
        description="Generate multiple-choice questions on any topic, pick your answers, and see your final score."
      />

      <div className="mb-10 max-w-3xl space-y-4">
        <TopicForm
          initialValue={topicParam}
          placeholder="Which topic should the quiz cover?"
          submitLabel="Generate quiz"
          disabled={status === "loading"}
          onSubmit={handleSubmit}
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-300">Number of questions</span>
          <div className="flex gap-2" role="group" aria-label="Number of questions">
            {QUESTION_COUNTS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={count === option}
                onClick={() => setCount(option)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  count === option
                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                    : "border-navy-600 text-slate-300 hover:border-navy-500 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {status === "idle" && (
        <div className="rounded-2xl border border-dashed border-navy-600 p-8 text-center">
          <p className="text-slate-300">Enter a topic to create your quiz.</p>
          <p className="mt-1 text-sm text-slate-400">Each answer is checked right away, with an explanation.</p>
        </div>
      )}

      {status === "loading" && <LoadingState message={`Creating questions about "${topic}"...`} />}

      {status === "error" && (
        <ErrorAlert message={error} onRetry={topic ? () => generate(topic, count) : undefined} />
      )}

      {status === "ready" && (
        <div className="space-y-6">
          {finished && (
            <section className="animate-fade-up rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-navy-800 p-6 sm:p-8">
              <p className="text-sm font-medium text-cyan-200">Final score</p>
              <p className="mt-2 text-4xl font-bold text-white sm:text-5xl">
                {score} / {questions.length}
              </p>
              <p className="mt-3 text-base leading-[1.5] text-slate-100">{resultMessage(score, questions.length)}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => generate(topic, count)}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-navy-900 transition-all duration-200 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  New quiz on {topic}
                </button>
              </div>
            </section>
          )}

          {!finished && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>
                  Answered {answeredCount} of {questions.length}
                </span>
                <span>Score so far: {score}</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-navy-700"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={questions.length}
                aria-valuenow={answeredCount}
              >
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {questions.map((question, index) => (
            <QuizQuestionCard
              key={`${index}-${question.question}`}
              index={index}
              question={question}
              selected={answers[index]}
              onSelect={(optionIndex) => selectAnswer(index, optionIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
