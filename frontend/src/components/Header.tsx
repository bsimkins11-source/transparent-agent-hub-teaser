import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/transparent-partners-logo.png" 
              alt="Transparent Partners" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-gray-900">
              Agent Hub
            </span>
          </Link>

                  {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {currentUser && userProfile && (
            <>
              {userProfile.role === 'super_admin' && (
                <>
                  <Link 
                    to="/super-admin" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/super-admin' 
                        ? 'text-brand-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Super Admin
                  </Link>
                  <Link 
                    to="/admin" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/admin' 
                        ? 'text-brand-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Company Admin
                  </Link>
                </>
              )}
              {userProfile.role === 'company_admin' && (
                <Link 
                  to="/admin" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/admin' 
                      ? 'text-brand-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Company Admin
                </Link>
              )}
            </>
          )}
        </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <UserIcon className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="btn-primary text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
