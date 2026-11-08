import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { CgpaPage } from './pages/CgpaPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { TimetablePage } from './pages/TimetablePage';
import { ExpensePage } from './pages/ExpensePage';
import { ExamsPage } from './pages/ExamsPage';
import { NotesPage } from './pages/NotesPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { ResourceHubPage } from './pages/ResourceHubPage';
import { AiTutorPage } from './pages/AiTutorPage';
import { PdfSummarizerPage } from './pages/PdfSummarizerPage';
import { McqGeneratorPage } from './pages/McqGeneratorPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { ExamPrepPage } from './pages/ExamPrepPage';
import { AnswerGeneratorPage } from './pages/AnswerGeneratorPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Login / Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="cgpa" element={<CgpaPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="expenses" element={<ExpensePage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="study-planner" element={<StudyPlannerPage />} />
        <Route path="resource-hub" element={<ResourceHubPage />} />

        {/* AI Study Companion Suite */}
        <Route path="ai/tutor" element={<AiTutorPage />} />
        <Route path="ai/summarizer" element={<PdfSummarizerPage />} />
        <Route path="ai/mcq" element={<McqGeneratorPage />} />
        <Route path="ai/flashcards" element={<FlashcardsPage />} />
        <Route path="ai/exam-prep" element={<ExamPrepPage />} />
        <Route path="ai/answer-gen" element={<AnswerGeneratorPage />} />

        {/* Account & Administration */}
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
