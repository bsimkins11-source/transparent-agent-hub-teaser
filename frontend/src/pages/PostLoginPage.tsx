import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  BookOpenIcon,
  UserIcon,
  BuildingLibraryIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function PostLoginPage() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {userProfile?.displayName || currentUser.email}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You're now signed in to the Transparent AI Agent Hub. Where would you like to go?
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Agent Libraries Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <Link to="/agent-library" className="block h-full">
              <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BuildingLibraryIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Explore Agent Libraries
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Browse our comprehensive collection of AI agents. Discover new tools, 
                  explore company libraries, and find the perfect agents for your needs.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                  Browse Libraries
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Personal Library Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group"
          >
            <Link to="/my-agents" className="block h-full">
              <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpenIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  My Personal Library
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access your personal collection of AI agents. Manage your team, 
                  track performance, and optimize your AI workforce.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  Go to My Library
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 mb-4">Quick Actions</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/agent-library"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BuildingLibraryIcon className="w-4 h-4 mr-2" />
              Browse All Agents
            </Link>
            <Link
              to="/my-agents"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BookOpenIcon className="w-4 h-4 mr-2" />
              My Agents
            </Link>
            {userProfile?.role === 'company_admin' && (
              <Link
                to="/company-admin"
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <BuildingLibraryIcon className="w-4 h-4 mr-2" />
                Company Admin
              </Link>
            )}
            {userProfile?.role === 'super_admin' && (
              <Link
                to="/super-admin"
                className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <BuildingLibraryIcon className="w-4 h-4 mr-2" />
                Super Admin
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
