import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatBubble } from "../components/ChatBubble";
import { ErrorAlert } from "../components/ErrorAlert";
import { PageHeader } from "../components/PageHeader";
import { SendIcon } from "../components/icons";
import { TopicForm } from "../components/TopicForm";
import { askDoubt, type ChatHistoryTurn } from "../lib/aiClient";
import type { ChatMessage } from "../types/learning";

const HISTORY_TURNS_SENT = 12;
const STARTER_PROMPTS = [
  "Can you explain this in even simpler words?",
  "Give me a real-life example.",
  "What are the most common mistakes students make?",
];

export function AskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topic = searchParams.get("topic")?.trim() ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [sendError, setSendError] = useState<{
    question: string;
    history: ChatHistoryTurn[];
    message: string;
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  function changeTopic(nextTopic: string) {
    if (nextTopic === topic) return;
    setMessages([]);
    setSendError(null);
    setSearchParams({ topic: nextTopic });
  }

  async function requestAnswer(question: string, history: ChatHistoryTurn[]) {
    setPending(true);
    try {
      const answer = await askDoubt(topic, question, history);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: answer }]);
    } catch (err) {
      setSendError({
        question,
        history,
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || !topic || pending) return;

    const history: ChatHistoryTurn[] = messages
      .filter((message) => !message.isError)
      .slice(-HISTORY_TURNS_SENT)
      .map((message) => ({ role: message.role, content: message.content }));

    setDraft("");
    setSendError(null);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: question }]);
    requestAnswer(question, history);
  }

  function handleComposerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(draft);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Ask AI"
        title="Ask a follow-up question"
        description="Ask anything about your topic. TeachMe AI remembers the topic and this conversation."
      />

      <div className="mb-6 max-w-3xl">
        <p className="mb-2 text-sm font-medium text-slate-300">
          {topic ? (
            <>
              Current topic: <span className="text-cyan-300">{topic}</span>
            </>
          ) : (
            "Choose the topic you are studying"
          )}
        </p>
        <TopicForm
          initialValue={topic}
          placeholder="For example: photosynthesis"
          submitLabel={topic ? "Change topic" : "Set topic"}
          onSubmit={changeTopic}
        />
      </div>

      <section
        aria-label="Conversation"
        className="flex min-h-[320px] flex-col gap-4 rounded-2xl border border-navy-700 bg-navy-950/60 p-4 sm:p-6"
      >
        {!topic && <p className="m-auto text-center text-slate-400">Set a topic above to start asking questions.</p>}

        {topic && messages.length === 0 && !pending && (
          <div className="m-auto w-full max-w-xl space-y-3 text-center">
            <p className="text-slate-300">Ask me anything about {topic}.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuestion(prompt)}
                  className="rounded-full border border-navy-600 px-3 py-1.5 text-left text-sm text-slate-200 transition-all duration-200 hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {pending && (
          <div role="status" className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-pulse-dot rounded-full bg-cyan-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            TeachMe AI is thinking...
          </div>
        )}

        {sendError && (
          <ErrorAlert
            message={sendError.message}
            onRetry={() => {
              const { question, history } = sendError;
              setSendError(null);
              requestAnswer(question, history);
            }}
          />
        )}
        <div ref={endRef} />
      </section>

      <form onSubmit={handleComposerSubmit} className="sticky bottom-20 mt-4 lg:bottom-4">
        <div className="flex items-center gap-2 rounded-2xl border border-navy-600 bg-navy-850 p-1.5 shadow-lg shadow-black/30 transition-colors focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/15">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!topic}
            maxLength={1000}
            placeholder={topic ? "Type your question..." : "Set a topic first"}
            aria-label="Your question"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed sm:text-base"
          />
          <button
            type="submit"
            disabled={!topic || pending || draft.trim().length === 0}
            aria-label="Send question"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400 text-navy-900 transition-all duration-200 hover:bg-cyan-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-navy-600 disabled:text-slate-400 focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
