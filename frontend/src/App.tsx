import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AgentLibraryPage from './pages/AgentLibraryPage'
import MyAgentsPage from './pages/MyAgentsPage'
import AgentPage from './pages/AgentPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminRoute from './components/AdminRoute'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="agents" element={<AgentLibraryPage />} />
            <Route path="my-agents" element={<MyAgentsPage />} />
            <Route path="agents/:agentId" element={<AgentPage />} />
            <Route 
              path="admin" 
              element={
                <AdminRoute requiredRole="company_admin">
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="admin/users" 
              element={
                <AdminRoute requiredRole="company_admin">
                  <AdminUserManagement />
                </AdminRoute>
              } 
            />
            <Route path="admin/legacy" element={<AdminPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
