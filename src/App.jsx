import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import AssessmentPage from './pages/AssessmentPage'
import AssessmentResultPage from './pages/AssessmentResultPage'
import MoodTrackerPage from './pages/MoodTrackerPage'
import ChatPage from './pages/ChatPage'
import CopingStrategiesPage from './pages/CopingStrategiesPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminAssessmentsPage from './pages/AdminAssessmentsPage'
import AdminRiskMonitoringPage from './pages/AdminRiskMonitoringPage'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, profile } = useAuth()

  console.log('ProtectedRoute:', { loading, isAuthenticated, profile, requiredRole })

  if (loading) {
    console.log('ProtectedRoute: Still loading...')
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    console.log('ProtectedRoute: Role mismatch. Required:', requiredRole, 'Actual:', profile?.role)
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute: Access granted, rendering children')
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
          <Route path="/forgot" element={<ForgotPasswordPage />} />

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

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assessments"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminAssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/risk-monitoring"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRiskMonitoringPage />
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
