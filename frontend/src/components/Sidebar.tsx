import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  UserIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const { currentUser, userProfile, logout } = useAuth()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [sidebarTimeout, setSidebarTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeout) {
      clearTimeout(sidebarTimeout)
      setSidebarTimeout(null)
    }
    setIsHovered(true)
    // Dispatch custom event for layout adjustment
    window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: { expanded: true } }))
  }

  const handleSidebarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false)
      // Dispatch custom event for layout adjustment
      window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: { expanded: false } }))
    }, 150) // Small delay to prevent flickering
    setSidebarTimeout(timeout)
  }

  // Cleanup sidebar timeout on unmount
  useEffect(() => {
    return () => {
      if (sidebarTimeout) {
        clearTimeout(sidebarTimeout)
      }
    }
  }, [sidebarTimeout])

  // Don't render sidebar for non-authenticated users
  if (!currentUser || !userProfile) {
    return null;
  }

  // Base navigation items that are always available
  const baseNavigationItems = [
    {
      name: 'Global Library',
      href: '/agents',
      icon: GlobeAltIcon,
      current: location.pathname === '/agents',
      description: 'Browse all available agents'
    }
  ];

  // Navigation items that require authentication
  const authenticatedNavigationItems = [
    {
      name: 'Dashboard',
      href: '/my-agents',
      icon: UserIcon,
      current: location.pathname === '/my-agents',
      description: 'Your personal agent library'
    },
    {
      name: 'Account Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      current: location.pathname === '/settings',
      description: 'Manage your account preferences'
    }
  ];

  // Admin navigation items - grouped together
  const adminNavigationItems = [
    {
      name: 'Company Management',
      href: '/company-admin',
      icon: BuildingLibraryIcon,
      current: location.pathname === '/company-admin',
      description: 'Manage company agents and users',
      requiresRole: ['company_admin', 'super_admin'],
      requiresPermission: 'canManageCompany',
      category: 'admin'
    },
    {
      name: 'Network Management',
      href: '/network-admin',
      icon: UserGroupIcon,
      current: location.pathname === '/network-admin',
      description: 'Manage network-level access',
      requiresRole: ['network_admin', 'super_admin'],
      requiresPermission: 'canManageNetwork',
      category: 'admin'
    },
    {
      name: 'System Administration',
      href: '/super-admin',
      icon: ShieldCheckIcon,
      current: location.pathname === '/super-admin',
      description: 'System-wide administration',
      requiresRole: ['super_admin'],
      category: 'admin'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: location.pathname === '/admin/users',
      description: 'Manage user accounts and permissions',
      requiresRole: ['company_admin', 'network_admin', 'super_admin'],
      requiresPermission: 'canManageUsers',
      category: 'admin'
    },
    {
      name: 'Analytics Dashboard',
      href: '/analytics',
      icon: ChartBarIcon,
      current: location.pathname === '/analytics',
      description: 'View system and usage analytics',
      requiresRole: ['company_admin', 'network_admin', 'super_admin'],
      requiresPermission: 'canViewAnalytics',
      category: 'admin'
    }
  ];

  // Creator portal - separate from admin
  const creatorNavigationItems = [
    {
      name: 'Creator Portal',
      href: '/creator-portal',
      icon: SparklesIcon,
      current: location.pathname === '/creator-portal',
      description: 'Submit and manage your agents',
      requiresRole: ['creator', 'super_admin'],
      requiresPermission: 'canSubmitAgents',
      category: 'creator'
    }
  ];

  // Get visible navigation items based on user permissions
  const getVisibleNavigationItems = () => {
    let items = [...baseNavigationItems];
    
    if (currentUser && userProfile) {
      // Add authenticated items
      items.push(...authenticatedNavigationItems);
      
      // Add creator items
      creatorNavigationItems.forEach(item => {
        const hasRole = !item.requiresRole || item.requiresRole.includes(userProfile.role);
        const hasPermission = !item.requiresPermission || userProfile.permissions[item.requiresPermission];
        
        if (hasRole && hasPermission) {
          items.push(item);
        }
      });
    }
    
    return items;
  };

  // Get visible admin items
  const getVisibleAdminItems = () => {
    if (!currentUser || !userProfile) return [];

    return adminNavigationItems.filter(item => {
      const hasRole = !item.requiresRole || item.requiresRole.includes(userProfile.role);
      const hasPermission = !item.requiresPermission || userProfile.permissions[item.requiresPermission];
      return hasRole && hasPermission;
    });
  };

  const navigationItems = getVisibleNavigationItems();
  const adminItems = getVisibleAdminItems();
  const hasAdminAccess = adminItems.length > 0;

  const shouldShow = isExpanded || isHovered

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-[9998]">
        <button
          onClick={() => {
            const newExpanded = !isExpanded
            setIsExpanded(newExpanded)
            // Dispatch custom event for layout adjustment
            window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: { expanded: newExpanded } }))
          }}
          className="p-2 rounded-lg bg-white shadow-md border border-gray-200"
        >
          {isExpanded ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Hover trigger area - small strip that's always visible */}
      <div 
        className="fixed left-0 top-16 w-2 h-full z-[9997] lg:block hidden"
        onMouseEnter={handleSidebarMouseEnter}
      >
        {/* Subtle visual indicator */}
        <motion.div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-r-full pointer-events-none"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: isHovered ? 0.6 : 0.2 }}
          transition={{ duration: 0.3 }}
          whileHover={{ opacity: 0.8, scale: 1.1 }}
        />
        
        {/* Small hint text */}
        <motion.div 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 font-medium pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Menu
        </motion.div>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9996] lg:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-16 h-full w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 z-[9995] transition-all duration-300 ${
              isHovered ? 'shadow-2xl' : 'shadow-xl'
            }`}
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    Account
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsExpanded(false)
                    setIsHovered(false)
                    // Dispatch custom event for layout adjustment
                    window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: { expanded: false } }))
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close sidebar"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </motion.div>

              {/* User Info */}
              <motion.div 
                className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium capitalize mt-1">
                      {userProfile.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <motion.nav 
                className="sidebar-nav flex-1 px-4 py-4 space-y-1 overflow-y-auto" 
                style={{ 
                  msOverflowStyle: 'none'
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {/* Main Navigation */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    {navigationItems.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                        >
                          <Link
                            to={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              item.current
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                            }`}
                            title={item.description}
                          >
                            <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                              item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                            }`} />
                            {item.name}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Admin Section */}
                {hasAdminAccess && (
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2 mb-3 px-3">
                      <ShieldCheckIcon className="w-4 h-4 text-red-600" />
                      <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                        Administration
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {adminItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                          >
                            <Link
                              to={item.href}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                item.current
                                  ? 'bg-red-50 text-red-700 border-r-2 border-red-700 shadow-sm'
                                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700 hover:shadow-sm'
                              }`}
                              title={item.description}
                            >
                              <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                                item.current ? 'text-red-700' : 'text-gray-400 group-hover:text-red-500'
                              }`} />
                              {item.name}
                              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full opacity-60"></span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    <Link
                      to="/agent-submission"
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:shadow-sm"
                    >
                      <SparklesIcon className="mr-3 h-5 w-5 text-green-500 group-hover:text-green-600 transition-colors duration-200" />
                      Submit Agent
                    </Link>
                    <Link
                      to="/new-agent-request"
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:shadow-sm"
                    >
                      <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                      Request Agent
                    </Link>
                  </div>
                </motion.div>
              </motion.nav>

              {/* Logout */}
              <motion.div 
                className="px-4 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 hover:shadow-sm"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                  Sign Out
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
