import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ResumeAnalyzer from './pages/resume/ResumeAnalyzer';
import ResumeList from './pages/resume/ResumeList';
import ResumeTailor from './pages/resume/ResumeTailor';
import MockInterview from './pages/interview/MockInterview';
import InterviewHistory from './pages/interview/InterviewHistory';
import InterviewSession from './pages/interview/InterviewSession';
import SkillGap from './pages/SkillGap';
import Roadmap from './pages/roadmap/Roadmap';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="resume" element={<ResumeList />} />
        <Route path="resume/upload" element={<ResumeAnalyzer />} />
        <Route path="resume/tailor" element={<ResumeTailor />} />
        <Route path="interview" element={<MockInterview />} />
        <Route path="interview/history" element={<InterviewHistory />} />
        <Route path="interview/:id" element={<InterviewSession />} />
        <Route path="skills" element={<SkillGap />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="projects" element={<Projects />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />
    </AuthProvider>
  );
}
