import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CompanyBrandingProvider } from './contexts/CompanyBrandingContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AgentLibraryPage from './pages/AgentLibraryPage'
import MyAgentsPage from './pages/MyAgentsPage'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import CompanyAgentLibrary from './pages/CompanyAgentLibrary'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
// import AgentAdmin from './pages/AgentAdmin'
import CreatorPortal from './pages/CreatorPortal'
import AgentSubmissionPage from './pages/AgentSubmissionPage'
import NewAgentRequestPage from './pages/NewAgentRequestPage'
import UserSettingsPage from './pages/UserSettingsPage'

// Wrapper component for company routes that provides company branding context
function CompanyRouteWrapper({ children }: { children: React.ReactNode }) {
  const { companyId } = useParams<{ companyId: string }>();
  return (
    <CompanyBrandingProvider companyId={companyId}>
      {children}
    </CompanyBrandingProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/agents" element={
              <ProtectedRoute>
                <AgentLibraryPage />
              </ProtectedRoute>
            } />
            <Route path="/my-agents" element={
              <ProtectedRoute>
                <MyAgentsPage />
              </ProtectedRoute>
            } />
            {/* Company routes - require authentication */}
            <Route path="/company-admin" element={
              <ProtectedRoute>
                <Navigate to="/company-admin/transparent-partners" replace />
              </ProtectedRoute>
            } />
            <Route path="/company-admin/:companyId" element={
              <ProtectedRoute>
                <CompanyRouteWrapper>
                  <CompanyAdminDashboard />
                </CompanyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/company" element={
              <ProtectedRoute>
                <Navigate to="/company/transparent-partners" replace />
              </ProtectedRoute>
            } />
            <Route path="/company/:companyId" element={
              <ProtectedRoute>
                <CompanyRouteWrapper>
                  <CompanyAgentLibrary />
                </CompanyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/agent-admin" element={
              <ProtectedRoute requiredRole="super_admin">
                <div className="p-8 text-center">Agent Admin page coming soon...</div>
              </ProtectedRoute>
            } />
            <Route path="/super-admin" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/creator-portal" element={
              <ProtectedRoute requiredRole="creator">
                <CreatorPortal />
              </ProtectedRoute>
            } />
            <Route path="/agent-submission" element={
              <ProtectedRoute>
                <AgentSubmissionPage />
              </ProtectedRoute>
            } />
            <Route path="/new-agent-request" element={
              <ProtectedRoute>
                <NewAgentRequestPage />
              </ProtectedRoute>
            } />
            <Route path="/user-settings" element={
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <div className="p-8 text-center">Settings page coming soon...</div>
              </ProtectedRoute>
            } />
            <Route path="/about" element={<div className="p-8 text-center">About page coming soon...</div>} />
            <Route path="/contact" element={<div className="p-8 text-center">Contact page coming soon...</div>} />
            {/* Catch-all route - redirect to home page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
