import { useState, useEffect, useRef } from 'react'
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
  XMarkIcon,
  ChevronDownIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLibrariesDropdownOpen, setIsLibrariesDropdownOpen] = useState(false)
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false)
  const librariesDropdownRef = useRef<HTMLDivElement>(null)
  const adminDropdownRef = useRef<HTMLDivElement>(null)

  // Determine if we're in a company environment
  const isCompanyEnvironment = userProfile && 
    userProfile.organizationId !== 'unassigned' && 
    userProfile.organizationId !== 'pending-assignment'

  // Get company branding colors
  const getCompanyColors = () => {
    if (!isCompanyEnvironment) return null
    
    // Default Transparent Partners colors
    if (userProfile?.organizationId === 'transparent-partners') {
      return {
        primary: '#043C46',     // transparent teal
        secondary: '#0f766e',   // teal-700
        accent: '#14b8a6',      // teal-500
        light: '#5eead4',       // teal-300
        text: '#ffffff'         // white text for contrast
      }
    }
    
    // For other companies, could load from localStorage or API
    const savedBranding = localStorage.getItem(`company-branding-${userProfile?.organizationId}`)
    if (savedBranding) {
      const branding = JSON.parse(savedBranding)
      return {
        primary: branding.primaryColor || '#043C46',
        secondary: branding.secondaryColor || '#0f766e',
        accent: branding.accentColor || '#14b8a6',
        light: branding.lightColor || '#5eead4',
        text: '#ffffff'
      }
    }
    
    return null
  }

  const companyColors = getCompanyColors()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (librariesDropdownRef.current && !librariesDropdownRef.current.contains(event.target as Node)) {
        setIsLibrariesDropdownOpen(false)
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
      className={`header-global fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${
        isCompanyEnvironment 
          ? 'border-white/20' 
          : 'border-transparent'
      }`}
      style={isCompanyEnvironment ? {
        background: `linear-gradient(90deg, ${companyColors?.primary} 0%, ${companyColors?.primary} 66%, ${companyColors?.secondary} 100%)`,
      } : {
        background: 'linear-gradient(90deg, #043C46 0%, #043C46 66%, #0F5F6B 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/transparent-partners-logo-white.png" 
              alt="Transparent Partners" 
              className="h-8 w-auto"
            />
            <span className={`text-xl font-semibold ${
              isCompanyEnvironment ? 'text-white' : 'text-white'
            }`}>
              Agent Hub
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentUser && userProfile && (
              <>
                {/* Libraries Dropdown */}
                <div className="relative" ref={librariesDropdownRef}>
                  <button
                    onClick={() => setIsLibrariesDropdownOpen(!isLibrariesDropdownOpen)}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      isCompanyEnvironment 
                        ? 'text-white/80 hover:text-white' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Libraries</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {isLibrariesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      {/* All Agents - Always available */}
                      <Link
                        to="/agents"
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                          location.pathname === '/agents' ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <BookOpenIcon className="w-4 h-4 text-gray-600" />
                        <span>All Agents</span>
                      </Link>
                      
                      {/* Company Library - Only if user has company access */}
                      {userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                        <Link
                          to={`/company/${userProfile.organizationId}`}
                          onClick={() => setIsLibrariesDropdownOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                            location.pathname.startsWith('/company/') ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />
                          <span>{userProfile.organizationName || 'Company'}</span>
                        </Link>
                      )}
                      
                      {/* Network Library - Only if user is part of a network */}
                      {userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                        <Link
                          to={`/company/${userProfile.organizationId}/network/main`}
                          onClick={() => setIsLibrariesDropdownOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                            location.pathname.includes('/network/') ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <UserGroupIcon className="w-4 h-4 text-gray-600" />
                          <span>Network</span>
                        </Link>
                      )}
                      
                      {/* My Library - Always available for authenticated users */}
                      <Link
                        to="/my-agents"
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                          location.pathname === '/my-agents' ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <UserIcon className="w-4 h-4 text-gray-600" />
                        <span>My Library</span>
                      </Link>
                      
                      {/* Access Status Indicator for pending users */}
                      {(userProfile.organizationId === 'pending-assignment' || userProfile.organizationId === 'unassigned') && (
                        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <span>Company access pending</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Dropdown - Only show for admin roles */}
                {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                        isCompanyEnvironment 
                          ? 'text-white/80 hover:text-white' 
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Admin</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        {/* Super Admin - Only for super_admin role */}
                        {userProfile.role === 'super_admin' && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                              location.pathname === '/super-admin' ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span className="text-accent-500">👑</span>
                            <div>
                              <div className="font-medium">Super Admin</div>
                              <div className="text-xs text-gray-500">Global management</div>
                            </div>
                          </Link>
                        )}
                        
                        {/* Company Admin - ONLY for super_admin and company_admin roles */}
                        {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && 
                         userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                              location.pathname === '/admin' ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="font-medium">Company Admin</div>
                              <div className="text-xs text-gray-500">{userProfile.organizationName}</div>
                            </div>
                          </Link>
                        )}
                        
                        {/* Network Admin - For network_admin role OR higher roles accessing networks */}
                        {userProfile.role === 'network_admin' && 
                         userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                          <Link
                            to="/network-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                              location.pathname === '/network-admin' ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <UserGroupIcon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="font-medium">Network Admin</div>
                              <div className="text-xs text-gray-500">Team management</div>
                            </div>
                          </Link>
                        )}
                        
                        {/* Network Management - For super_admin and company_admin to access specific networks */}
                        {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && 
                         userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                          <Link
                            to={`/admin/company/${userProfile.organizationId}`}
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                              location.pathname.includes('/admin/company/') ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <UserGroupIcon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="font-medium">Manage Networks</div>
                              <div className="text-xs text-gray-500">Network oversight</div>
                            </div>
                          </Link>
                        )}
                        
                        {/* Role Badge */}
                        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span>Current Role:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              userProfile.role === 'super_admin' ? 'bg-accent-100 text-accent-800' :
                              userProfile.role === 'company_admin' ? 'bg-transparent-100 text-transparent-800' :
                              userProfile.role === 'network_admin' ? 'bg-transparent-100 text-transparent-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {userProfile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                      </div>
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
                className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50"
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
                <div className="flex items-center space-x-2 text-sm text-white/90">
                  <UserIcon className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-white/80 hover:text-white transition-colors"
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
          className="md:hidden border-b border-white/20 bg-white"
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
                    ? 'bg-transparent-50 text-transparent-700'
                    : 'text-gray-700 hover:bg-transparent-50'
                }`}
              >
                <BookOpenIcon className="w-4 h-4 nav-icon" />
                <span>Master Library</span>
              </Link>
              
              <Link
                to={`/company/${userProfile.organizationId || 'company'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/company/')
                    ? 'bg-transparent-50 text-transparent-700'
                    : 'text-gray-700 hover:bg-transparent-50'
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4 nav-icon" />
                <span>Company Library</span>
              </Link>
              
              <Link
                to="/my-agents"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/my-agents'
                    ? 'bg-transparent-50 text-transparent-700'
                    : 'text-gray-700 hover:bg-transparent-50'
                }`}
              >
                <UserGroupIcon className="w-4 h-4 nav-icon" />
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
                          ? 'bg-transparent-50 text-transparent-700'
                          : 'text-gray-700 hover:bg-transparent-50'
                      }`}
                    >
                      Super Admin
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/admin'
                          ? 'bg-transparent-50 text-transparent-700'
                          : 'text-gray-700 hover:bg-transparent-50'
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
                        ? 'bg-transparent-50 text-transparent-700'
                        : 'text-gray-700 hover:bg-transparent-50'
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