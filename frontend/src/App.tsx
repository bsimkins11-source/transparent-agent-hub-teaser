import { Routes, Route, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CompanyBrandingProvider } from './contexts/CompanyBrandingContext'
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
import CompanySelectionPage from './pages/CompanySelectionPage'
import CompanyAgentLibrary from './pages/CompanyAgentLibrary'
import NetworkAdminDashboard from './pages/NetworkAdminDashboard'
import AdminRoute from './components/AdminRoute'
import AdminRouteHandler from './components/AdminRouteHandler'
import LoginPage from './pages/LoginPage'

// Wrapper component to provide company branding context with route params
function CompanyAdminWrapper() {
  const { companyId } = useParams<{ companyId: string }>();
  return (
    <CompanyBrandingProvider companyId={companyId}>
      <CompanyAdminDashboard />
    </CompanyBrandingProvider>
  );
}

// Wrapper for company agent library routes
function CompanyAgentLibraryWrapper() {
  const { companySlug } = useParams<{ companySlug: string }>();
  return (
    <CompanyBrandingProvider companyId={companySlug}>
      <CompanyAgentLibrary />
    </CompanyBrandingProvider>
  );
}

// Wrapper for network admin routes
function NetworkAdminWrapper() {
  const { companyId } = useParams<{ companyId: string }>();
  return (
    <CompanyBrandingProvider companyId={companyId}>
      <NetworkAdminDashboard />
    </CompanyBrandingProvider>
  );
}

// Wrapper for standalone network admin route (needs company context from user profile)
function StandaloneNetworkAdminWrapper() {
  const { userProfile } = useAuth();
  return (
    <CompanyBrandingProvider companyId={userProfile?.organizationId}>
      <NetworkAdminDashboard />
    </CompanyBrandingProvider>
  );
}

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
            <Route path="company/:companySlug" element={<CompanyAgentLibraryWrapper />} />
            <Route path="company/:companySlug/network/:networkSlug" element={<CompanyAgentLibraryWrapper />} />
            
            {/* Network Admin Routes */}
            <Route 
              path="network-admin" 
              element={
                <AdminRoute requiredRole={['super_admin', 'company_admin', 'network_admin']}>
                  <StandaloneNetworkAdminWrapper />
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
                <AdminRoute requiredRole={['super_admin', 'company_admin']}>
                  <AdminRouteHandler />
                </AdminRoute>
              } 
            />
            <Route 
              path="admin/company/:companyId" 
              element={
                <AdminRoute requiredRole={['super_admin', 'company_admin']}>
                  <CompanyAdminWrapper />
                </AdminRoute>
              } 
            />
            <Route 
              path="admin/network/:companyId/:networkId" 
              element={
                <AdminRoute requiredRole={['super_admin', 'company_admin', 'network_admin']}>
                  <NetworkAdminWrapper />
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
