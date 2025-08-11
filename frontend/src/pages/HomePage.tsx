import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpenIcon,
  UserIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function HomePage() {
  const { currentUser, login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true)
    setLoginError('')
    
    try {
      await loginWithGoogle()
      // Redirect to personal library after successful login
      window.location.href = '/my-agents'
    } catch (error) {
      setLoginError('Google sign-in failed. Please try again.')
    } finally {
      setIsGoogleLoggingIn(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')
    
    try {
      await login(email, password)
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Your Team with{' '}
              <span className="text-brand-600">
                Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Drive meaningful productivity gains with our curated collection of AI agents. 
              Built for transparency, designed for results, optimized for your business success.
            </p>
            
            {/* Login Box for Non-Authenticated Users */}
            {!currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign In to Get Started</h3>
                
                {/* Google OAuth Button */}
                <div className="mb-6">
                  <button
                    onClick={async () => {
                      try {
                        setIsGoogleLoggingIn(true)
                        await loginWithGoogle()
                      } catch (error) {
                        console.error('Google login error:', error)
                        setLoginError('Failed to sign in with Google. Please try again.')
                      } finally {
                        setIsGoogleLoggingIn(false)
                      }
                    }}
                    disabled={isGoogleLoggingIn}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      {isGoogleLoggingIn ? 'Signing in...' : 'Continue with Google'}
                    </span>
                  </button>
                </div>
                
                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                  {loginError && (
                    <p className="text-red-600 text-sm">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoggingIn ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <Link to="/login" className="text-sm text-brand-600 hover:text-brand-700">
                    Need help signing in?
                  </Link>
                </div>
                
                {/* Browse Agents Button for Non-Authenticated Users */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to="/agent-library"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BuildingLibraryIcon className="w-5 h-5" />
                    <span className="font-medium">Browse Agents (Read-Only)</span>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Explore our agent library without signing in
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Solutions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              We Can Help You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your business operations with intelligent AI agents designed 
              to accelerate progress and drive meaningful results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Agent Library Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <Link to="/agents" className="block group">
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                  <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center mb-6">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Explore Our Agent Library
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Access a curated collection of specialized AI agents designed to maximize 
                    productivity across marketing, operations, and strategic initiatives.
                  </p>
                  <div className="flex items-center text-brand-600 font-medium group-hover:text-brand-700 transition-colors">
                    Browse All Agents
                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* My Agents Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              {currentUser ? (
                <Link to="/my-agents" className="block group">
                  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full hover:shadow-medium transition-all duration-200">
                    <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mb-6">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Manage Your Agent Team
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Build and optimize your personal AI workforce. Track performance, 
                      manage integrations, and accelerate your path to operational excellence.
                    </p>
                    <div className="flex items-center text-primary-700 font-medium group-hover:text-primary-800 transition-colors">
                      Access Dashboard
                      <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 h-full">
                  <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mb-6">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Get Started Today
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Sign in to access your personal AI agent library and start building 
                    your intelligent workforce for maximum productivity.
                  </p>
                  <div className="text-primary-700 font-medium">
                    Sign in above to continue
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Agents?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with transparency, reliability, and performance in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparent AI',
                description: 'Clear, explainable AI decisions with full visibility into how agents work.',
                icon: '🔍'
              },
              {
                title: 'Enterprise Ready',
                description: 'Built for scale with security, compliance, and reliability at the core.',
                icon: '🏢'
              },
              {
                title: 'Easy Integration',
                description: 'Simple APIs and SDKs to integrate agents into your existing workflows.',
                icon: '⚡'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
