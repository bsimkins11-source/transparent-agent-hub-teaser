import { useAuth } from '../contexts/AuthContext'
import { CompanyBrandingProvider } from '../contexts/CompanyBrandingContext'
import CompanyAdminDashboard from '../pages/CompanyAdminDashboard'
import CompanySelectionPage from '../pages/CompanySelectionPage'

export default function AdminRouteHandler() {
  const { userProfile } = useAuth()

  // Super admin sees company selection page
  if (userProfile?.role === 'super_admin') {
    return <CompanySelectionPage />
  }

  // Company admin goes directly to their company dashboard
  if (userProfile?.role === 'company_admin') {
    return (
      <CompanyBrandingProvider companyId={userProfile.organizationId}>
        <CompanyAdminDashboard />
      </CompanyBrandingProvider>
    )
  }

  // Fallback - shouldn't happen with proper route protection
  return (
    <CompanyBrandingProvider companyId={userProfile?.organizationId}>
      <CompanyAdminDashboard />
    </CompanyBrandingProvider>
  )
}
