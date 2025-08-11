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
import { createOrUpdateUserProfile as createUserProfileInFirestore } from '../services/userLibraryService'

// Types
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'user' | 'company_admin' | 'network_admin' | 'super_admin' | 'creator'
  organizationId: string
  organizationName: string
  networkId?: string  // Only populated for network_admin role
  networkName?: string  // Only populated for network_admin role
  
  // Creator-specific fields
  creatorProfile?: {
    id: string
    bio?: string
    website?: string
    github?: string
    linkedin?: string
    avatar?: string
    isVerified: boolean
    tier: 'basic' | 'verified' | 'premium' | 'enterprise'
  }
  
  permissions: {
    canCreateAgents: boolean
    canManageUsers: boolean
    canManageOrganization: boolean
    canViewAnalytics: boolean
    canManageCompany: boolean  // Only true for company_admin and super_admin
    canManageNetwork: boolean  // True for network_admin, company_admin, and super_admin
    
    // Creator-specific permissions
    canSubmitAgents: boolean
    canViewCreatorAnalytics: boolean
    canManageCreatorProfile: boolean
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
      
      // Determine user role based on specific email addresses
      const transparentAdminEmails = [
        'bryan.simkins@transparent.partners',
        'drankine@transparent.partners',
        'test@transparent.partners' // Test email for development
      ]
      
      // In development mode, allow any email to be super_admin for testing
      const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
      
      // Determine role - check for creators first, then admins
      let role: 'user' | 'company_admin' | 'network_admin' | 'super_admin' | 'creator' = 'user'
      
      if (transparentAdminEmails.includes(user.email || '') || isDevelopment) {
        role = 'super_admin'
      } else {
        // Check if user is a creator (for now, any non-admin user can be a creator)
        // In production, this would check against a creator registry or allow self-registration
        role = 'creator'
      }
      
      // Determine organization info - only Bryan and Darren get automatic Transparent Partners access
      let organizationId = 'unassigned'
      let organizationName = 'Unassigned'
      
      if (transparentAdminEmails.includes(user.email || '') || isDevelopment) {
        organizationId = 'transparent-partners'
        organizationName = 'Transparent Partners'
      } else {
        // Other users (including other @transparent.partners emails) need to request company access
        const emailDomain = user.email?.split('@')[1] || ''
        organizationId = 'pending-assignment'
        organizationName = `Pending Assignment (${emailDomain})`
      }
      
      // Create creator profile if user is a creator
      let creatorProfile = undefined
      if (role === 'creator') {
        creatorProfile = {
          id: `creator_${user.uid}`,
          bio: '',
          website: '',
          github: '',
          linkedin: '',
          avatar: '',
          isVerified: false,
          tier: 'basic' as const
        }
      }
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        organizationId,
        organizationName,
        creatorProfile,
        permissions: {
          canCreateAgents: role === 'super_admin',
          canManageUsers: ['super_admin', 'company_admin', 'network_admin'].includes(role),
          canManageOrganization: role === 'super_admin',  // Only super admin can manage organizations
          canViewAnalytics: role !== 'user',
          canManageCompany: ['super_admin', 'company_admin'].includes(role),  // Company-level management
          canManageNetwork: ['super_admin', 'company_admin', 'network_admin'].includes(role),  // Network-level management
          
          // Creator-specific permissions
          canSubmitAgents: ['creator', 'super_admin'].includes(role),
          canViewCreatorAnalytics: role === 'creator',
          canManageCreatorProfile: role === 'creator'
        },
        assignedAgents: ['gemini-chat-agent'] // Temporarily hardcode Gemini agent for testing
      }
      
      // Create user profile in Firestore
      console.log('📋 Creating user profile in Firestore:', profile);
      try {
        await createUserProfileInFirestore(
          user.uid,
          user.email || '',
          user.displayName || '',
          organizationId,
          organizationName,
          role
        );
        console.log('✅ User profile created in Firestore successfully');
        logger.info('User profile created in Firestore', { role, email: user.email }, 'Auth');
      } catch (error) {
        console.error('❌ Failed to create user profile in Firestore:', error);
        logger.warn('Failed to create user profile in Firestore, using local profile', error, 'Auth');
      }
      
      setUserProfile(profile)
      logger.info('User profile updated', { role, email: user.email }, 'Auth')
    } catch (error) {
      logger.error('Failed to create user profile', error, 'Auth')
      // Don't throw error - just create local profile
      console.log('⚠️ Creating fallback local user profile due to error');
      
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'user',
        organizationId: 'unassigned',
        organizationName: 'Unassigned',
        permissions: {
          canCreateAgents: false,
          canManageUsers: false,
          canManageOrganization: false,
          canViewAnalytics: false,
          canManageCompany: false,
          canManageNetwork: false,
          canSubmitAgents: true,
          canViewCreatorAnalytics: true,
          canManageCreatorProfile: true
        },
        assignedAgents: ['gemini-chat-agent'] // Include Gemini agent for testing
      }
      
      setUserProfile(fallbackProfile)
      logger.info('Fallback user profile created', { uid: user.uid }, 'Auth')
    }
  }, [])

  // Google authentication
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    console.log('🚀 Starting Google OAuth process...');
    
    try {
      const provider = new GoogleAuthProvider()
      console.log('✅ GoogleAuthProvider created');
      
      provider.addScope('email')
      provider.addScope('profile')
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      console.log('✅ Provider configured with scopes and parameters');
      
      console.log('🔥 About to call signInWithPopup...');
      const result = await signInWithPopup(auth, provider)
      console.log('✅ signInWithPopup successful:', result);
      
      const user = result.user
      console.log('👤 User object:', user);
      
      logger.authSuccess('Google authentication successful', { email: user.email })
      console.log('📋 Creating/updating user profile...');
      await createOrUpdateUserProfile(user)
      console.log('✅ User profile created/updated successfully');
    } catch (error) {
      console.error('❌ Google OAuth Error Details:', {
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorStack: error?.stack
      });
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
          
          // Get and store the ID token
          const token = await user.getIdToken()
          localStorage.setItem('authToken', token)
          
          await createOrUpdateUserProfile(user)
          setCurrentUser(user)
        } else {
          logger.info('User not authenticated', undefined, 'Auth')
          // Remove token on logout
          localStorage.removeItem('authToken')
          setCurrentUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        logger.error('Auth state change error', error, 'Auth')
        // Don't show toast here - let the login handlers manage user feedback
      } finally {
        setLoading(false)
      }
    })

    // Set up token refresh listener
    const tokenRefreshUnsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          localStorage.setItem('authToken', token)
        } catch (error) {
          logger.error('Failed to refresh token', error, 'Auth')
        }
      }
    })

    return () => {
      logger.componentUnmount('AuthProvider')
      unsubscribe()
      tokenRefreshUnsubscribe()
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
