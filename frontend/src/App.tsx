import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AgentLibraryPage from './pages/AgentLibraryPage'
import MyAgentsPage from './pages/MyAgentsPage'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CreatorPortal from './pages/CreatorPortal'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<div className="p-8 text-center">Login page coming soon...</div>} />
            <Route path="/agents" element={<AgentLibraryPage />} />
            <Route path="/my-agents" element={<MyAgentsPage />} />
            <Route path="/company-admin" element={<CompanyAdminDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/creator-portal" element={<CreatorPortal />} />
            <Route path="/company/:companyId" element={<div className="p-8 text-center">Company Library page coming soon...</div>} />
            <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
