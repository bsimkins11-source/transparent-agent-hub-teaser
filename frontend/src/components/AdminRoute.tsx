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
    return <Navigate to="/" replace />
  }
  
  // Check role hierarchy - super admin can access everything
  if (userProfile.role === 'super_admin') {
    return <>{children}</>
  }
  
  // Handle array of roles
  if (Array.isArray(requiredRole)) {
    const hasRequiredRole = requiredRole.some(role => {
      // Super admin can access everything
      if (userProfile.role === 'super_admin') return true
      
      // Company admin can access company and network admin
      if (userProfile.role === 'company_admin') {
        return role === 'company_admin' || role === 'network_admin'
      }
      
      // Network admin can only access network admin
      if (userProfile.role === 'network_admin') {
        return role === 'network_admin'
      }
      
      return false
    })
    
    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />
    }
  } else {
    // Handle single role
    const userRole = userProfile.role
    const requiredRoleStr = requiredRole as string
    
    // Super admin can access everything
    if (userRole === 'super_admin') {
      return <>{children}</>
    }
    
    // Company admin can access company and network admin
    if (userRole === 'company_admin') {
      if (requiredRoleStr !== 'company_admin' && requiredRoleStr !== 'network_admin') {
        return <Navigate to={fallbackPath} replace />
      }
    }
    
    // Network admin can only access network admin
    if (userRole === 'network_admin') {
      if (requiredRoleStr !== 'network_admin') {
        return <Navigate to={fallbackPath} replace />
      }
    }
    
    // User role can't access any admin routes
    if (userRole === 'user') {
      return <Navigate to={fallbackPath} replace />
    }
  }
  
  return <>{children}</>
}
