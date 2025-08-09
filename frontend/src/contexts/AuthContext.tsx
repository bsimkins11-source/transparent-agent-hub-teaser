import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { logger } from '../utils/logger'

// Types
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'user' | 'company_admin' | 'network_admin' | 'super_admin'
  permissions: {
    canCreateAgents: boolean
    canManageUsers: boolean
    canManageOrganization: boolean
    canViewAnalytics: boolean
  }
  assignedAgents: string[]
}

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook with proper error handling
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth error handling utility
const handleAuthError = (error: AuthError, operation: string): Error => {
  logger.authError(`${operation} failed`, { code: error.code, message: error.message })
  
  const errorMessages: Record<string, string> = {
    // Google Auth errors
    'auth/popup-closed-by-user': 'Login was cancelled. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by browser. Please allow popups and try again.',
    'auth/cancelled-popup-request': 'Another login attempt is in progress.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
    'auth/unauthorized-domain': 'This domain is not authorized. Please contact support.',
    
    // Email Auth errors
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    
    // Generic fallback
    'default': `${operation} failed. Please try again.`
  }
  
  return new Error(errorMessages[error.code] || errorMessages.default)
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Create or update user profile in Firestore
  const createOrUpdateUserProfile = useCallback(async (user: User): Promise<void> => {
    try {
      logger.debug('Creating/updating user profile', { uid: user.uid }, 'Auth')
      
      // Determine user role based on email domain
      const role = user.email?.endsWith('@transparent.partners') ? 'super_admin' : 'user'
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        permissions: {
          canCreateAgents: role === 'super_admin',
          canManageUsers: ['super_admin', 'company_admin', 'network_admin'].includes(role),
          canManageOrganization: ['super_admin', 'company_admin'].includes(role),
          canViewAnalytics: role !== 'user'
        },
        assignedAgents: []
      }
      
      setUserProfile(profile)
      logger.info('User profile updated', { role, email: user.email }, 'Auth')
    } catch (error) {
      logger.error('Failed to create user profile', error, 'Auth')
      throw new Error('Failed to set up user profile')
    }
  }, [])

  // Google authentication
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    try {
      logger.debug('Starting Google authentication', undefined, 'Auth')
      
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      logger.authSuccess('Google authentication successful', { email: user.email })
      await createOrUpdateUserProfile(user)
    } catch (error) {
      throw handleAuthError(error as AuthError, 'Google login')
    }
  }, [createOrUpdateUserProfile])

  // Email/password login
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      logger.debug('Starting email authentication', { email }, 'Auth')
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      logger.authSuccess('Email authentication successful', { email: user.email })
      await createOrUpdateUserProfile(user)
    } catch (error) {
      throw handleAuthError(error as AuthError, 'Email login')
    }
  }, [createOrUpdateUserProfile])

  // Email/password registration
  const registerWithEmail = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ): Promise<void> => {
    try {
      logger.debug('Starting email registration', { email }, 'Auth')
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      await updateProfile(user, { displayName })
      
      logger.authSuccess('Email registration successful', { email: user.email })
      await createOrUpdateUserProfile(user)
    } catch (error) {
      throw handleAuthError(error as AuthError, 'Email registration')
    }
  }, [createOrUpdateUserProfile])

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      logger.info('Starting logout', undefined, 'Auth')
      
      await signOut(auth)
      setUserProfile(null)
      
      logger.info('Logout successful', undefined, 'Auth')
    } catch (error) {
      logger.error('Logout failed', error, 'Auth')
      throw new Error('Failed to log out')
    }
  }, [])

  // Auth state listener
  useEffect(() => {
    logger.componentMount('AuthProvider')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true)
        
        if (user) {
          logger.info('User authenticated', { email: user.email }, 'Auth')
          await createOrUpdateUserProfile(user)
          setCurrentUser(user)
        } else {
          logger.info('User not authenticated', undefined, 'Auth')
          setCurrentUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        logger.error('Auth state change error', error, 'Auth')
      } finally {
        setLoading(false)
      }
    })

    return () => {
      logger.componentUnmount('AuthProvider')
      unsubscribe()
    }
  }, [createOrUpdateUserProfile])

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
