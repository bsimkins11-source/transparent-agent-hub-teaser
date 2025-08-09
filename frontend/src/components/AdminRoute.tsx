import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRole?: 'super_admin' | 'company_admin' | 'network_admin' | string[]
  fallbackPath?: string
}

export default function AdminRoute({ 
  children, 
  requiredRole = 'company_admin',
  fallbackPath = '/'
}: AdminRouteProps) {
  const { currentUser, userProfile, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    )
  }
  
  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />
  }
  
  // Check role hierarchy
  const roleHierarchy = {
    'user': 0,
    'network_admin': 1,
    'company_admin': 2,
    'super_admin': 3
  }
  
  // Handle array of roles
  if (Array.isArray(requiredRole)) {
    const hasRequiredRole = requiredRole.some(role => {
      const requiredLevel = roleHierarchy[role] || 0
      const userRoleLevel = roleHierarchy[userProfile.role] || 0
      return userRoleLevel >= requiredLevel
    })
    
    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />
    }
  } else {
    // Handle single role
    const userRoleLevel = roleHierarchy[userProfile.role] || 0
    const requiredLevel = roleHierarchy[requiredRole as string] || 0
    
    if (userRoleLevel < requiredLevel) {
      return <Navigate to={fallbackPath} replace />
    }
  }
  
  return <>{children}</>
}
