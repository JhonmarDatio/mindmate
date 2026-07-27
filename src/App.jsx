import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import StudentDashboard from './pages/StudentDashboard'
import AssessmentPage from './pages/AssessmentPage'
import AssessmentResultPage from './pages/AssessmentResultPage'
import MoodTrackerPage from './pages/MoodTrackerPage'
import ChatPage from './pages/ChatPage'
import CopingStrategiesPage from './pages/CopingStrategiesPage'

// Counselor pages (previously "Admin")
import AdminDashboard from './pages/AdminDashboard'
import AdminAssessmentsPage from './pages/AdminAssessmentsPage'
import AdminRiskMonitoringPage from './pages/AdminRiskMonitoringPage'

// Super Admin pages
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminUsersPage from './pages/SuperAdminUsersPage'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, profile, user } = useAuth()

  // Not authenticated at all and done loading — send to login
  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />

  // Still loading but no user yet — show spinner only on initial cold load
  if (loading && !user) return <LoadingSpinner />

  // We have a user — get role from profile (DB) or fallback to JWT metadata
  const role = profile?.role || user?.user_metadata?.role || 'student'

  // Role check — only redirect if we're sure about the role (profile loaded)
  // If profile is still loading, render children optimistically to avoid flash
  if (requiredRole && profile && role !== requiredRole) {
    if (role === 'superadmin') return <Navigate to="/superadmin" replace />
    if (role === 'counselor') return <Navigate to="/counselor" replace />
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute requiredRole="student">
                <AssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment-result"
            element={
              <ProtectedRoute requiredRole="student">
                <AssessmentResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mood-tracker"
            element={
              <ProtectedRoute requiredRole="student">
                <MoodTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute requiredRole="student">
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coping-strategies"
            element={
              <ProtectedRoute requiredRole="student">
                <CopingStrategiesPage />
              </ProtectedRoute>
            }
          />

          {/* Counselor Routes (previously /admin) */}
          <Route
            path="/counselor"
            element={
              <ProtectedRoute requiredRole="counselor">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor/assessments"
            element={
              <ProtectedRoute requiredRole="counselor">
                <AdminAssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor/risk-monitoring"
            element={
              <ProtectedRoute requiredRole="counselor">
                <AdminRiskMonitoringPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy /admin redirects → /counselor */}
          <Route path="/admin" element={<Navigate to="/counselor" replace />} />
          <Route path="/admin/assessments" element={<Navigate to="/counselor/assessments" replace />} />
          <Route path="/admin/risk-monitoring" element={<Navigate to="/counselor/risk-monitoring" replace />} />

          {/* Super Admin Routes */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
