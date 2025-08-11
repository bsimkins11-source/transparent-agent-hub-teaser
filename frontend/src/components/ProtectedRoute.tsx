import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  fallbackPath = '/'
}: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  if (!currentUser || !userProfile) {
    return <Navigate to={fallbackPath} replace />
  }
  
  return <>{children}</>
}
