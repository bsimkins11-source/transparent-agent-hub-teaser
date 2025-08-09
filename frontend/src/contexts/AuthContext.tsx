import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ai-agent-hub-web-portal-79fb0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: 'super_admin' | 'company_admin' | 'user'
  organizationId: string
  organizationName: string
  permissions: {
    canManageUsers: boolean
    canAssignAgents: boolean
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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Create or update user profile
      await createOrUpdateUserProfile(user)
      
      return result
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  async function createOrUpdateUserProfile(user: User) {
    if (!user.email) return
    
    // Extract organization from email domain
    const emailDomain = user.email.split('@')[1]
    const organizationId = emailDomain.replace('.', '-')
    
    // Bootstrap: Check if this is the first user in the system
    const role = await determineUserRole(user.email, user.uid)
    
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      role,
      organizationId,
      organizationName: emailDomain === 'transparent.partners' ? 'Transparent Partners' : emailDomain,
      permissions: getPermissionsForRole(role),
      assignedAgents: []
    }
    
    setUserProfile(profile)
  }

  async function determineUserRole(email: string, uid: string): Promise<'super_admin' | 'company_admin' | 'user'> {
    // Hardcoded super admin emails
    const superAdminEmails = ['bryan.simkins@transparent.partners']
    if (superAdminEmails.includes(email)) {
      return 'super_admin'
    }

    // Bootstrap: Check if this is the first user in the system
    try {
      const response = await fetch('/api/bootstrap/check-first-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.isFirstUser) {
          console.log('🎉 Bootstrap: First user detected, granting super admin access')
          return 'super_admin'
        }
      }
    } catch (error) {
      console.error('Bootstrap check failed:', error)
    }

    // Default role determination
    return 'user'
  }

  function getPermissionsForRole(role: 'super_admin' | 'company_admin' | 'user') {
    switch (role) {
      case 'super_admin':
        return {
          canManageUsers: true,
          canAssignAgents: true,
          canManageOrganization: true,
          canViewAnalytics: true
        }
      case 'company_admin':
        return {
          canManageUsers: true,
          canAssignAgents: true,
          canManageOrganization: false,
          canViewAnalytics: true
        }
      default:
        return {
          canManageUsers: false,
          canAssignAgents: false,
          canManageOrganization: false,
          canViewAnalytics: false
        }
    }
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        await createOrUpdateUserProfile(user)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    loginWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
