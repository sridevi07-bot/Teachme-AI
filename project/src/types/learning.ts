export type LessonSection = {
  heading: string;
  explanation: string;
  example: string;
};

export type Lesson = {
  title: string;
  introduction: string;
  sections: LessonSection[];
  steps: string[];
  summary: string;
};

export type SavedLesson = {
  id: string;
  topic: string;
  title: string;
  content: Lesson;
  created_at: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};
