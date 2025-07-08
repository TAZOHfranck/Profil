import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider, useAdmin } from './contexts/AdminContext'
import { MessagesProvider } from './contexts/MessagesContext'
import Header from './components/Layout/Header'
import MobileNav from './components/Layout/MobileNav'
// import AdminLayout from './components/Admin/AdminLayout'
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
  const [error, setError] = React.useState<string | null>(null)
  const [showError, setShowError] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (loading) {
      timeoutId = setTimeout(() => {
        setError('Le chargement prend plus de temps que prévu. Veuillez rafraîchir la page.')
        setShowError(true)
      }, 5000) // 5 secondes timeout
    } else {
      setShowError(false)
      setError(null)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [loading])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
          {showError && error && (
            <div className="mt-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Rafraîchir la page
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50">
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
          <Route path="/profile/settings" element={<PrivateRoute><Profile activeTab="settings" /></PrivateRoute>} />
          <Route path="/profile/premium" element={<PrivateRoute><Profile activeTab="premium" /></PrivateRoute>} />
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
      <AdminProvider>
        <Router>
          <MessagesProvider>
            <AppContent />
          </MessagesProvider>
        </Router>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App