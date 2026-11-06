import { Link } from "react-router-dom";
import type { Lesson } from "../types/learning";
import { ArrowRightIcon } from "./icons";

type LessonViewProps = {
  topic: string;
  lesson: Lesson;
};

export function LessonView({ topic, lesson }: LessonViewProps) {
  return (
    <article className="animate-fade-up space-y-8">
      <div className="space-y-4">
        <p className="text-sm font-medium text-cyan-300">Lesson on {topic}</p>
        <h2 className="text-2xl font-bold sm:text-3xl">{lesson.title}</h2>
        {lesson.introduction && (
          <p className="whitespace-pre-line text-base leading-[1.5] text-slate-200">{lesson.introduction}</p>
        )}
      </div>

      {lesson.sections.length > 0 && (
        <div className="space-y-5">
          {lesson.sections.map((section, index) => (
            <section
              key={`${section.heading}-${index}`}
              className="rounded-2xl border border-navy-700 bg-navy-850 p-5 transition-colors duration-200 hover:border-navy-600 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-sm font-semibold text-cyan-300">
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-3">
                  <h3 className="text-lg sm:text-xl">{section.heading}</h3>
                  <p className="whitespace-pre-line text-[15px] leading-[1.5] text-slate-200">
                    {section.explanation}
                  </p>
                  {section.example && (
                    <div className="rounded-xl border-l-4 border-cyan-400 bg-navy-900/70 p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">Example</p>
                      <p className="whitespace-pre-line text-[15px] leading-[1.5] text-slate-100">{section.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {lesson.steps.length > 0 && (
        <section className="rounded-2xl border border-navy-700 bg-navy-850 p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl">Step-by-step</h3>
          <ol className="mt-4 space-y-3">
            {lesson.steps.map((step, index) => (
              <li key={`${index}-${step}`} className="flex gap-3 text-[15px] leading-[1.5] text-slate-200">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-cyan-200">
                  {index + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {lesson.summary && (
        <section className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-navy-800 p-5 sm:p-6">
          <h3 className="text-lg text-white sm:text-xl">Summary</h3>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.5] text-slate-100">{lesson.summary}</p>
        </section>
      )}

      <div className="flex flex-col gap-3 border-t border-navy-700 pt-6 sm:flex-row">
        <Link
          to={`/ask?topic=${encodeURIComponent(topic)}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-navy-900 transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_24px_rgb(34_211_238/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          Ask a follow-up question
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          to={`/quiz?topic=${encodeURIComponent(topic)}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          Test yourself with a quiz
        </Link>
      </div>
    </article>
  );
}
