import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider, useAdmin } from './contexts/AdminContext'
import Header from './components/Layout/Header'
import MobileNav from './components/Layout/MobileNav'
import AdminLayout from './components/Admin/AdminLayout'
import Home from './pages/Home'
import LoginForm from './components/Auth/LoginForm'
import RegisterForm from './components/Auth/RegisterForm'
import Discover from './pages/Discover'
import Matches from './pages/Matches'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import SafetyCenter from './components/Safety/SafetyCenter'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UserManagement from './pages/Admin/UserManagement'
import ReportsManagement from './pages/Admin/ReportsManagement'
import AdminSettings from './pages/Admin/AdminSettings'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }
  
  return user ? <Navigate to="/discover" /> : <>{children}</>
}

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Add more admin routes as needed */}
        </Route>

        {/* Public Routes */}
        <Route path="/*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
                <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
                <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/safety" element={<PrivateRoute><SafetyCenter /></PrivateRoute>} />
              </Routes>
            </main>
            {user && <MobileNav />}
          </>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App