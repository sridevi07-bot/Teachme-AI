import { useState, type FormEvent } from "react";
import { ArrowRightIcon } from "./icons";

export const MAX_TOPIC_LENGTH = 200;

type TopicFormProps = {
  initialValue?: string;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  size?: "default" | "large";
  onSubmit: (topic: string) => void;
};

export function TopicForm({
  initialValue = "",
  placeholder,
  submitLabel,
  disabled = false,
  size = "default",
  onSubmit,
}: TopicFormProps) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  const canSubmit = !disabled && trimmed.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
  }

  const large = size === "large";

  return (
    <form onSubmit={handleSubmit} role="search" className="group w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-navy-600 bg-navy-850 p-1.5 shadow-lg shadow-black/20 transition-colors duration-200 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/15 ${
          large ? "sm:p-2" : ""
        }`}
      >
        <input
          type="text"
          value={value}
          maxLength={MAX_TOPIC_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`min-w-0 flex-1 bg-transparent px-3 text-white placeholder:text-slate-400 focus:outline-none ${
            large ? "py-3 text-base sm:text-lg" : "py-2.5 text-sm sm:text-base"
          }`}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 font-semibold text-navy-900 transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_24px_rgb(34_211_238/0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-navy-600 disabled:text-slate-400 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
            large ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm"
          }`}
        >
          <span className="hidden sm:inline">{submitLabel}</span>
          <ArrowRightIcon className="h-4 w-4 sm:hidden" />
          <span className="sr-only sm:hidden">{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
