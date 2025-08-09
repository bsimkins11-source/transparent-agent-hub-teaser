import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  })
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      console.log('🔐 Starting Google login process...')
      await loginWithGoogle()
      console.log('✅ Login successful, redirecting...')
      toast.success('Logged in successfully')
      navigate('/my-agents')
    } catch (error) {
      console.error('❌ Google login error details:', error)
      
      // Show specific error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to log in with Google'
      toast.error(errorMessage)
      
      // Additional debugging
      console.log('Error code:', error?.code)
      console.log('Error message:', error?.message)
      console.log('Full error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isRegistering) {
      // Registration validation
      if (!formData.email || !formData.password || !formData.displayName || !formData.confirmPassword) {
        toast.error('Please fill in all fields')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
    } else {
      // Login validation
      if (!formData.email || !formData.password) {
        toast.error('Please enter email and password')
        return
      }
    }

    try {
      setLoading(true)
      
      if (isRegistering) {
        console.log('🔐 Starting email registration...')
        await registerWithEmail(formData.email, formData.password, formData.displayName)
        toast.success('Account created successfully!')
      } else {
        console.log('🔐 Starting email login...')
        await loginWithEmail(formData.email, formData.password)
        toast.success('Logged in successfully!')
      }
      
      navigate('/my-agents')
    } catch (error) {
      console.error('❌ Email auth error:', error)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isRegistering ? 'register' : 'login'}`
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center relative group">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Agent Hub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {authMethod === 'google' ? 'Sign in with your Google account to access AI agents' : 
             isRegistering ? 'Create your account to access AI agents' : 
             'Sign in with your email and password'}
          </p>
        </div>

        <div className="card p-8">
          {/* Authentication Method Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMethod === 'google'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google OAuth
            </button>
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email & Password
            </button>
          </div>

          {authMethod === 'google' ? (
            /* Google OAuth Section */
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Secure authentication powered by Google
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </>
          ) : (
            /* Email/Password Section */
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setIsRegistering(false)}
                    className={`text-sm font-medium transition-colors ${
                      !isRegistering ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setIsRegistering(true)}
                    className={`text-sm font-medium transition-colors ${
                      isRegistering ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required={isRegistering}
                      className="input-field"
                      placeholder="John Doe"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                {isRegistering && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required={isRegistering}
                      className="input-field"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (isRegistering ? 'Creating Account...' : 'Signing In...') : 
                   (isRegistering ? 'Create Account' : 'Sign In')}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Multi-Authentication Support:</strong> Choose between Google OAuth for quick access or email/password for traditional authentication. Role-based access control active.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-brand-600 hover:text-brand-700">
              Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
