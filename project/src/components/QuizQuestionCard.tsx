import { cn } from "../lib/cn";
import type { QuizQuestion } from "../types/learning";

type QuizQuestionCardProps = {
  index: number;
  question: QuizQuestion;
  selected: number | undefined;
  onSelect: (optionIndex: number) => void;
};

const LETTERS = ["A", "B", "C", "D"];

export function QuizQuestionCard({ index, question, selected, onSelect }: QuizQuestionCardProps) {
  const answered = selected !== undefined;
  const isCorrect = selected === question.answerIndex;

  return (
    <section className="animate-fade-up rounded-2xl border border-navy-700 bg-navy-850 p-5 sm:p-6">
      <p className="text-sm font-medium text-cyan-300">Question {index + 1}</p>
      <h3 className="mt-2 text-lg leading-[1.3] sm:text-xl">{question.question}</h3>

      <ul className="mt-5 grid gap-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isAnswer = question.answerIndex === optionIndex;

          let stateClass = "border-navy-600 bg-navy-900/60 text-slate-100 hover:border-cyan-400/70 hover:bg-navy-800";
          if (answered && isAnswer) {
            stateClass = "border-emerald-400 bg-emerald-400/15 text-emerald-50";
          } else if (answered && isSelected) {
            stateClass = "border-rose-400 bg-rose-400/15 text-rose-50";
          } else if (answered) {
            stateClass = "border-navy-700 bg-navy-900/40 text-slate-400";
          }

          return (
            <li key={`${optionIndex}-${option}`}>
              <button
                type="button"
                disabled={answered}
                onClick={() => onSelect(optionIndex)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-[1.5] transition-all duration-200 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-cyan-400",
                  stateClass,
                )}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy-700 text-xs font-semibold text-cyan-200">
                  {LETTERS[optionIndex]}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div
          role="status"
          className={cn(
            "mt-5 animate-fade-up rounded-xl border-l-4 p-4 text-[15px] leading-[1.5]",
            isCorrect ? "border-emerald-400 bg-emerald-400/10" : "border-rose-400 bg-rose-400/10",
          )}
        >
          <p className={cn("font-semibold", isCorrect ? "text-emerald-200" : "text-rose-200")}>
            {isCorrect
              ? "Correct!"
              : `Not quite. The correct answer is ${LETTERS[question.answerIndex]}: ${question.options[question.answerIndex]}`}
          </p>
          {question.explanation && <p className="mt-1 text-slate-200">{question.explanation}</p>}
        </div>
      )}
    </section>
  );
}
