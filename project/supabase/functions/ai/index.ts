const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.8-flash";

class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") {
    super(message);
  }
}

type ChatTurn = { role: "user" | "assistant"; content: string };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getConfig() {
  const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim() || "";
  const model = Deno.env.get("GEMINI_MODEL")?.trim() || DEFAULT_MODEL;
  return { apiKey, model };
}

function requireString(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `"${field}" is required.`, "invalid_input");
  }
  if (value.length > max) {
    throw new HttpError(400, `"${field}" must be ${max} characters or fewer.`, "invalid_input");
  }
  return value.trim();
}

function parseHistory(value: unknown): ChatTurn[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 20) {
    throw new HttpError(400, `"history" must be a list of up to 20 messages.`, "invalid_input");
  }
  return value.map((turn) => {
    const role = turn?.role;
    if (role !== "user" && role !== "assistant") {
      throw new HttpError(400, `Each history message needs a valid role.`, "invalid_input");
    }
    return { role, content: requireString(turn.content, "history.content", 4000) };
  });
}

async function callGemini(
  prompt: { system: string; turns: ChatTurn[] },
  options: { expectJson: boolean },
): Promise<string> {
  const { apiKey, model } = getConfig();
  if (!apiKey) {
    throw new HttpError(503, "The AI service is not configured yet.", "not_configured");
  }

  const body = {
    systemInstruction: { parts: [{ text: prompt.system }] },
    contents: prompt.turns.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    ...(options.expectJson ? { generationConfig: { responseMimeType: "application/json" } } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
    });
  } catch {
    throw new HttpError(502, "Could not reach the AI service. Please try again.", "upstream_unreachable");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const upstreamMessage: string = data?.error?.message ?? "Unknown error from the AI service.";
    if (response.status === 429) {
      throw new HttpError(429, "The AI service is busy right now. Please wait a moment and try again.", "rate_limited");
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new HttpError(502, `The AI service rejected the request: ${upstreamMessage}`, "upstream_rejected");
    }
    throw new HttpError(502, `The AI service failed: ${upstreamMessage}`, "upstream_error");
  }

  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new HttpError(502, "The AI service returned an empty answer. Please try again.", "empty_response");
  }
  return text;
}

function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through to the error below
  }
  throw new HttpError(502, "The AI returned an unexpected format. Please try again.", "bad_format");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function generateLesson(input: Record<string, unknown>) {
  const topic = requireString(input.topic, "topic", 200);

  const text = await callGemini(
    {
      system:
        "You are TeachMe AI, a patient personal teacher. Explain topics in simple, friendly language that a beginner can follow. " +
        "Respond ONLY with JSON matching this shape: " +
        '{"title": string, "introduction": string, "sections": [{"heading": string, "explanation": string, "example": string}], "steps": [string], "summary": string}. ' +
        "Use 3 to 5 sections. Each example must be concrete. Steps should explain the process step by step. Keep the summary to 2-3 sentences.",
      turns: [{ role: "user", content: `Create a structured beginner-friendly lesson on: ${topic}` }],
    },
    { expectJson: true },
  );

  const parsed = parseJsonObject(text);
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
        .map((section: Record<string, unknown>) => ({
          heading: asText(section?.heading),
          explanation: asText(section?.explanation),
          example: asText(section?.example),
        }))
        .filter((section) => section.heading && section.explanation)
    : [];
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.map((step) => asText(step)).filter(Boolean)
    : [];
  const lesson = {
    title: asText(parsed.title) || topic,
    introduction: asText(parsed.introduction),
    sections,
    steps,
    summary: asText(parsed.summary),
  };
  if (!lesson.introduction || sections.length === 0 || !lesson.summary) {
    throw new HttpError(502, "The AI returned an incomplete lesson. Please try again.", "bad_format");
  }
  return { lesson };
}

async function answerDoubt(input: Record<string, unknown>) {
  const topic = requireString(input.topic, "topic", 200);
  const question = requireString(input.question, "question", 1000);
  const history = parseHistory(input.history);

  const answer = await callGemini(
    {
      system:
        `You are TeachMe AI, a patient personal teacher. The student is studying: "${topic}". ` +
        "Answer follow-up questions in simple, beginner-friendly language. Use short paragraphs, " +
        "and a small example when it helps. If the question is unrelated to learning, gently steer back to the topic.",
      turns: [...history, { role: "user", content: question }],
    },
    { expectJson: false },
  );
  return { answer };
}

async function generateQuiz(input: Record<string, unknown>) {
  const topic = requireString(input.topic, "topic", 200);
  const rawCount = Number(input.count ?? 5);
  if (!Number.isInteger(rawCount) || rawCount < 3 || rawCount > 10) {
    throw new HttpError(400, `"count" must be a whole number from 3 to 10.`, "invalid_input");
  }

  const text = await callGemini(
    {
      system:
        "You are TeachMe AI. Create multiple-choice quiz questions that test understanding of the topic. " +
        "Respond ONLY with JSON in this shape: " +
        '{"questions": [{"question": string, "options": [string, string, string, string], "answerIndex": number, "explanation": string}]}. ' +
        "Each question has exactly 4 options, answerIndex is the zero-based index of the correct option, and the explanation is one or two simple sentences.",
      turns: [{ role: "user", content: `Create ${rawCount} multiple-choice questions on: ${topic}` }],
    },
    { expectJson: true },
  );

  const parsed = parseJsonObject(text);
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((q: Record<string, unknown>) => {
          const options = Array.isArray(q?.options) ? q.options.map((o) => asText(o)) : [];
          const answerIndex = Number(q?.answerIndex);
          return {
            question: asText(q?.question),
            options,
            answerIndex,
            explanation: asText(q?.explanation),
          };
        })
        .filter(
          (q) =>
            q.question &&
            q.options.length === 4 &&
            q.options.every(Boolean) &&
            Number.isInteger(q.answerIndex) &&
            q.answerIndex >= 0 &&
            q.answerIndex < 4,
        )
    : [];

  if (questions.length === 0) {
    throw new HttpError(502, "The AI returned an incomplete quiz. Please try again.", "bad_format");
  }
  return { questions };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      throw new HttpError(405, "Method not allowed.", "method_not_allowed");
    }

    const body = await req.json().catch(() => {
      throw new HttpError(400, "Request body must be valid JSON.", "invalid_input");
    });
    const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

    switch (input.action) {
      case "status": {
        const { apiKey, model } = getConfig();
        return json({ configured: apiKey.length > 0, model });
      }
      case "lesson":
        return json(await generateLesson(input));
      case "doubt":
        return json(await answerDoubt(input));
      case "quiz":
        return json(await generateQuiz(input));
      default:
        throw new HttpError(400, "Unknown action.", "invalid_input");
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, code: err.code }, err.status);
    }
    console.error("Unexpected AI function error", err);
    return json({ error: "Something went wrong on the server. Please try again.", code: "internal" }, 500);
  }
});
