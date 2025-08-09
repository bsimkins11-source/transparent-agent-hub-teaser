import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AgentLibraryPage from './pages/AgentLibraryPage'
import MyAgentsPage from './pages/MyAgentsPage'
import AgentPage from './pages/AgentPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserManagement from './pages/AdminUserManagement'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import CompanyAgentLibrary from './pages/CompanyAgentLibrary'
import NetworkAdminDashboard from './pages/NetworkAdminDashboard'
import AdminRoute from './components/AdminRoute'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="agents" element={<AgentLibraryPage />} />
            <Route path="my-agents" element={<MyAgentsPage />} />
            <Route path="agents/:agentId" element={<AgentPage />} />
            <Route path="company/:companySlug" element={<CompanyAgentLibrary />} />
            <Route path="company/:companySlug/network/:networkSlug" element={<CompanyAgentLibrary />} />
            
            {/* Network Admin Routes */}
            <Route 
              path="network-admin" 
              element={
                <AdminRoute requiredRole={['super_admin', 'company_admin', 'network_admin']}>
                  <NetworkAdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Super Admin Routes */}
            <Route 
              path="super-admin" 
              element={
                <AdminRoute requiredRole="super_admin">
                  <SuperAdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Company Admin Routes */}
            <Route 
              path="admin" 
              element={
                <AdminRoute requiredRole="company_admin">
                  <CompanyAdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Legacy routes for reference */}
            <Route 
              path="admin/users" 
              element={
                <AdminRoute requiredRole="company_admin">
                  <AdminUserManagement />
                </AdminRoute>
              } 
            />
            <Route path="admin/legacy" element={<AdminPage />} />
            <Route path="admin/legacy" element={<AdminPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
