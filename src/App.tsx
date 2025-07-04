import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Layout/Header'
import MobileNav from './components/Layout/MobileNav'
import Home from './pages/Home'
import LoginForm from './components/Auth/LoginForm'
import RegisterForm from './components/Auth/RegisterForm'
import Discover from './pages/Discover'
import Matches from './pages/Matches'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import SafetyCenter from './components/Safety/SafetyCenter'
import VerificationCenter from './components/Verification/VerificationCenter'
import CompatibilityTest from './components/Compatibility/CompatibilityTest'
import CommunityEvents from './components/Events/CommunityEvents'
import BlogSection from './components/Blog/BlogSection'
import AdminDashboard from './components/Admin/AdminDashboard'
import AuthDebugPanel from './components/Auth/AuthDebugPanel'

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

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth()
  
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
  
  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@afrointroductions.com'
  
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/discover" />
  
  return <>{children}</>
}

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
          <Route path="/verification" element={<PrivateRoute><VerificationCenter /></PrivateRoute>} />
          <Route path="/compatibility" element={<PrivateRoute><CompatibilityTest /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><CommunityEvents /></PrivateRoute>} />
          <Route path="/blog" element={<BlogSection />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      {user && <MobileNav />}
      
      {/* Debug Panel (uniquement en développement) */}
      <AuthDebugPanel />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App