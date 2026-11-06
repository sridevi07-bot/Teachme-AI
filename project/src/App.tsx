import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AskPage } from "./pages/AskPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonDetailPage } from "./pages/LessonDetailPage";
import { QuizPage } from "./pages/QuizPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:lessonId" element={<LessonDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
