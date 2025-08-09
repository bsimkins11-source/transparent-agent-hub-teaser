import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY",
  authDomain: "ai-agent-hub-web-portal-79fb0.firebaseapp.com",
  projectId: "ai-agent-hub-web-portal-79fb0",
  storageBucket: "ai-agent-hub-web-portal-79fb0.firebasestorage.app",
  messagingSenderId: "72861076114",
  appId: "1:72861076114:web:1ea856ad05ef5f0eeef44b",
  measurementId: "G-JHLXTCXEDR"
}

// Initialize Firebase
console.log('🔥 Initializing Firebase with config:', firebaseConfig.projectId)
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
console.log('🔐 Firebase Auth initialized')

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
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>
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
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    try {
      console.log('🔐 Attempting Google login...')
      console.log('🔥 Firebase Auth object:', auth)
      console.log('🌐 Current domain:', window.location.hostname)
      console.log('📝 Google provider configured:', provider)
      
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      console.log('✅ Google login successful:', user.email)
      
      // Create or update user profile
      await createOrUpdateUserProfile(user)
      
      return result
    } catch (error: any) {
      console.error('❌ Google login error:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Full error object:', error)
      
      // More detailed error logging
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login was cancelled. Please try again.')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups and try again.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another login attempt is in progress.')
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('🚨 Google sign-in is not enabled in Firebase Console. Please enable it!')
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('🚨 This domain is not authorized in Firebase Console. Please add it!')
      } else {
        throw new Error(`Login failed: ${error.code} - ${error.message}`)
      }
    }
  }

  async function createOrUpdateUserProfile(user: User) {
    if (!user.email) {
      console.error('❌ No email found in user object')
      return
    }
    
    console.log('👤 Creating user profile for:', user.email)
    
    // Extract organization from email domain
    const emailDomain = user.email.split('@')[1]
    const organizationId = emailDomain.replace('.', '-')
    
    // Bootstrap: Check if this is the first user in the system
    const role = await determineUserRole(user.email, user.uid)
    
    console.log('🔑 Assigned role:', role, 'for user:', user.email)
    
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
    
    console.log('✅ User profile created:', profile)
    setUserProfile(profile)
  }

  async function determineUserRole(email: string, uid: string): Promise<'super_admin' | 'company_admin' | 'user'> {
    console.log('🔍 Determining role for email:', email)
    
    // Hardcoded super admin emails
    const superAdminEmails = ['bryan.simkins@transparent.partners']
    if (superAdminEmails.includes(email)) {
      console.log('👑 Super admin detected:', email)
      return 'super_admin'
    }

    // For now, skip the bootstrap API call since we don't have backend yet
    // Just return user role for other emails
    console.log('👤 Assigning user role to:', email)
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

  async function loginWithEmail(email: string, password: string) {
    try {
      console.log('🔐 Attempting email/password login for:', email)
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      console.log('✅ Email/password login successful:', user.email)
      
      // Create or update user profile
      await createOrUpdateUserProfile(user)
      
      return result
    } catch (error: any) {
      console.error('❌ Email/password login error:', error)
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.')
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.')
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.')
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.')
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.')
      } else {
        throw new Error(`Login failed: ${error.message}`)
      }
    }
  }

  async function registerWithEmail(email: string, password: string, displayName: string) {
    try {
      console.log('🔐 Attempting email/password registration for:', email)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName
      })
      
      console.log('✅ Email/password registration successful:', user.email)
      
      // Create or update user profile
      await createOrUpdateUserProfile(user)
      
      return result
    } catch (error: any) {
      console.error('❌ Email/password registration error:', error)
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.')
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.')
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.')
      } else {
        throw new Error(`Registration failed: ${error.message}`)
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
    loginWithEmail,
    registerWithEmail,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
