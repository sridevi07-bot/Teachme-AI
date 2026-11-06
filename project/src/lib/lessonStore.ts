import { supabase } from "./supabase";
import type { Lesson, SavedLesson } from "../types/learning";

const RECENT_LIMIT = 6;

export async function saveLesson(topic: string, lesson: Lesson): Promise<SavedLesson> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({ topic, title: lesson.title, content: lesson })
    .select("id, topic, title, content, created_at")
    .single();

  if (error || !data) {
    throw new Error("Your lesson was created but could not be saved to history.");
  }
  return data as SavedLesson;
}

export async function listRecentLessons(limit = RECENT_LIMIT): Promise<SavedLesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, topic, title, content, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Could not load your learning history. Please refresh the page.");
  }
  return (data ?? []) as SavedLesson[];
}

export async function getLesson(id: string): Promise<SavedLesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, topic, title, content, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this lesson. Please try again.");
  }
  return (data as SavedLesson | null) ?? null;
}
