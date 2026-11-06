import { useEffect, useState } from "react";
import { fetchAiStatus } from "../lib/aiClient";

export function SetupBanner() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetchAiStatus()
      .then((status) => {
        if (active) setConfigured(status.configured);
      })
      .catch(() => {
        if (active) setConfigured(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (configured !== false) return null;

  return (
    <div
      role="status"
      className="mb-6 animate-fade-up rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-[1.5] text-amber-100"
    >
      <p className="font-semibold text-amber-200">AI is not connected yet</p>
      <p className="mt-1 text-amber-100/90">
        TeachMe AI needs a Google Gemini API key before it can create lessons, answer questions, or make quizzes. Add
        your key as a server secret named GEMINI_API_KEY, then refresh this page. Your key is never shown in the
        browser.
      </p>
    </div>
  );
}
