import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { logger } from '../utils/logger'

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
  currentUser: UserProfile | null
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

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Create or update user profile locally
  const createOrUpdateUserProfile = useCallback(async (email: string, displayName: string): Promise<void> => {
    try {
      logger.debug('Creating/updating user profile', { email }, 'Auth')
      
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
      
      if (transparentAdminEmails.includes(email) || isDevelopment) {
        role = 'super_admin'
      } else {
        // Check if user is a creator (for now, any non-admin user can be a creator)
        // In production, this would check against a creator registry or allow self-registration
        role = 'creator'
      }
      
      // Determine organization info - only Bryan and Darren get automatic Transparent Partners access
      let organizationId = 'unassigned'
      let organizationName = 'Unassigned'
      
      if (transparentAdminEmails.includes(email) || isDevelopment) {
        // For development/testing, allow different organization IDs
        // You can change this to test different company libraries
        organizationId = 'coca-cola' // Change this to 'transparent-partners' or 'coca-cola' for testing
        organizationName = organizationId === 'coca-cola' ? 'Coca-Cola' : 'Transparent Partners'
      } else {
        // Other users (including other @transparent.partners emails) need to request company access
        const emailDomain = email.split('@')[1] || ''
        organizationId = 'pending-assignment'
        organizationName = `Pending Assignment (${emailDomain})`
      }
      
      // Create creator profile if user is a creator
      let creatorProfile = undefined
      if (role === 'creator') {
        creatorProfile = {
          id: `creator_${email}`,
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
        uid: email, // Use email as UID for local development
        email: email,
        displayName: displayName || '',
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
      
      console.log('📋 Creating user profile locally:', profile);
      setUserProfile(profile)
      setCurrentUser(profile)
      logger.info('User profile updated', { role, email }, 'Auth')
    } catch (error) {
      logger.error('Failed to create user profile', error, 'Auth')
      throw error
    }
  }, [])

  // Google authentication (simulated for local development)
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    console.log('🚀 Starting simulated Google OAuth process...');
    
    try {
      // Simulate Google OAuth for local development
      const email = 'test@transparent.partners'
      const displayName = 'Test User'
      
      console.log('✅ Simulated Google OAuth successful');
      logger.authSuccess('Google authentication successful', { email })
      
      console.log('📋 Creating/updating user profile...');
      await createOrUpdateUserProfile(email, displayName)
      console.log('✅ User profile created/updated successfully');
    } catch (error) {
      console.error('❌ Simulated Google OAuth Error:', error);
      throw new Error('Failed to authenticate with Google')
    }
  }, [createOrUpdateUserProfile])

  // Email/password login (simulated for local development)
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      logger.debug('Starting email authentication', { email }, 'Auth')
      
      // Simulate authentication for local development
      if (password === 'password' || password === 'test') {
        await createOrUpdateUserProfile(email, email.split('@')[0])
        logger.authSuccess('Email authentication successful', { email })
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      throw new Error('Invalid credentials')
    }
  }, [createOrUpdateUserProfile])

  // Email/password registration (simulated for local development)
  const registerWithEmail = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ): Promise<void> => {
    try {
      logger.debug('Starting email registration', { email }, 'Auth')
      
      // Simulate registration for local development
      await createOrUpdateUserProfile(email, displayName)
      
      logger.authSuccess('Email registration successful', { email })
    } catch (error) {
      throw new Error('Registration failed')
    }
  }, [createOrUpdateUserProfile])

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      logger.info('Starting logout', undefined, 'Auth')
      
      setCurrentUser(null)
      setUserProfile(null)
      
      logger.info('Logout successful', undefined, 'Auth')
    } catch (error) {
      logger.error('Logout failed', error, 'Auth')
      throw new Error('Failed to log out')
    }
  }, [])

  // Initialize with a default user for development
  useEffect(() => {
    logger.componentMount('AuthProvider')
    
    // For local development, create a default user
    const initializeDefaultUser = async () => {
      try {
        setLoading(true)
        
        // Create a default super admin user for development
        await createOrUpdateUserProfile('test@transparent.partners', 'Test User')
        
      } catch (error) {
        logger.error('Failed to initialize default user', error, 'Auth')
      } finally {
        setLoading(false)
      }
    }
    
    initializeDefaultUser()
    
    return () => {
      logger.componentUnmount('AuthProvider')
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
