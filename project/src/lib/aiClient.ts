import type { Lesson, QuizQuestion } from "../types/learning";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class AiRequestError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AiRequestError";
    this.code = code;
  }
}

export type ChatHistoryTurn = { role: "user" | "assistant"; content: string };

type AiStatus = { configured: boolean; model: string };

async function callAi<T>(body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiRequestError("Could not connect to TeachMe AI. Check your internet connection and try again.", "network");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.";
    const code = typeof data?.code === "string" ? data.code : "http_error";
    throw new AiRequestError(message, code);
  }

  if (!data || typeof data !== "object") {
    throw new AiRequestError("The AI returned an unexpected response. Please try again.", "bad_format");
  }
  return data as T;
}

export async function fetchAiStatus(): Promise<AiStatus> {
  return callAi<AiStatus>({ action: "status" });
}

export async function generateLesson(topic: string): Promise<Lesson> {
  const data = await callAi<{ lesson?: Lesson }>({ action: "lesson", topic });
  if (!data.lesson) {
    throw new AiRequestError("The AI returned an incomplete lesson. Please try again.", "bad_format");
  }
  return data.lesson;
}

export async function askDoubt(
  topic: string,
  question: string,
  history: ChatHistoryTurn[],
): Promise<string> {
  const data = await callAi<{ answer?: string }>({ action: "doubt", topic, question, history });
  if (typeof data.answer !== "string" || data.answer.length === 0) {
    throw new AiRequestError("The AI returned an empty answer. Please try again.", "bad_format");
  }
  return data.answer;
}

export async function generateQuiz(topic: string, count: number): Promise<QuizQuestion[]> {
  const data = await callAi<{ questions?: QuizQuestion[] }>({ action: "quiz", topic, count });
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new AiRequestError("The AI returned an incomplete quiz. Please try again.", "bad_format");
  }
  return data.questions;
}
