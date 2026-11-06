import type { ComponentType } from "react";
import { BookIcon, ChatIcon, QuizIcon } from "../components/icons";

type SubjectGroup = {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  topics: string[];
};

export const SUGGESTED_SUBJECTS: SubjectGroup[] = [
  { name: "Mathematics", Icon: QuizIcon, topics: ["Fractions", "Algebra basics", "Percentages"] },
  { name: "Science", Icon: BookIcon, topics: ["Photosynthesis", "Newton's laws of motion", "States of matter"] },
  { name: "History", Icon: BookIcon, topics: ["The Roman Empire", "The Industrial Revolution"] },
  { name: "Programming", Icon: ChatIcon, topics: ["Variables in Python", "What is an API?"] },
  { name: "Languages", Icon: ChatIcon, topics: ["Parts of speech", "Present tense in English"] },
  { name: "Economics", Icon: BookIcon, topics: ["Supply and demand", "Inflation"] },
];
