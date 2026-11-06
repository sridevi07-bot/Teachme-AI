import type { ChatMessage } from "../types/learning";

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex animate-fade-up justify-end">
        <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-cyan-400 px-4 py-3 text-[15px] leading-[1.5] text-navy-900 sm:max-w-[70%]">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-up gap-3">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-cyan-300">
        AI
      </span>
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border px-4 py-3 text-[15px] leading-[1.5] sm:max-w-[70%] ${
          message.isError
            ? "border-rose-400/40 bg-rose-400/10 text-rose-100"
            : "border-navy-700 bg-navy-850 text-slate-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
