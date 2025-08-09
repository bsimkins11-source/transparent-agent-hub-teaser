import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <nav className="hidden md:flex items-center space-x-6">
            {currentUser && userProfile && (
              <>
                {/* Agent Libraries - Always visible for authenticated users */}
                <div className="flex items-center space-x-6 border-r border-gray-200 pr-6">
                  <Link 
                    to="/agents" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      location.pathname === '/agents' 
                        ? 'text-brand-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Master Library</span>
                  </Link>
                  
                  <Link 
                    to={`/company/${userProfile.organizationId || 'company'}`}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/company/') 
                        ? 'text-brand-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>Company Library</span>
                  </Link>
                  
                  <Link 
                    to="/my-agents" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      location.pathname === '/my-agents' 
                        ? 'text-brand-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span>My Library</span>
                  </Link>
                </div>

                {/* Admin Links - Only show for admin roles */}
                {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                  <div className="flex items-center space-x-6 border-l border-gray-200 pl-6">
                    {userProfile.role === 'super_admin' && (
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
                    )}
                    {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && (
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
                    {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                      <Link 
                        to="/network-admin" 
                        className={`text-sm font-medium transition-colors ${
                          location.pathname === '/network-admin' 
                            ? 'text-brand-600' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Network Admin
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {currentUser && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && currentUser && userProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-b border-gray-200"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Agent Libraries */}
            <div className="border-b border-gray-200 pb-3 mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Agent Libraries</p>
              
              <Link
                to="/agents"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/agents'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>Master Library</span>
              </Link>
              
              <Link
                to={`/company/${userProfile.organizationId || 'company'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/company/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>Company Library</span>
              </Link>
              
              <Link
                to="/my-agents"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/my-agents'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
                <span>My Library</span>
              </Link>
            </div>

            {/* Admin Links */}
            {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && (
              <div className="border-b border-gray-200 pb-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Administration</p>
                
                {userProfile.role === 'super_admin' && (
                  <>
                    <Link
                      to="/super-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/super-admin'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Super Admin
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/admin'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Company Admin
                    </Link>
                  </>
                )}
                
                {userProfile.role === 'company_admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/admin'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Company Admin
                  </Link>
                )}
              </div>
            )}

            {/* User Info & Logout */}
            <div className="pt-3">
              <div className="flex items-center px-3 py-2">
                <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{currentUser.email}</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
