import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
      toast.success('Logged in successfully')
      navigate('/my-agents')
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to log in with Google')
    } finally {
      setLoading(false)
    }
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
            Sign in with your Google account to access AI agents
          </p>
        </div>

        <div className="card p-8">
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

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Development Mode:</strong> Role-based access control and advanced features are being implemented. SSO integration available upon request.
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
