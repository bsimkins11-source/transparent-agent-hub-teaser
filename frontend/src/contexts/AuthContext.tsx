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

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
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
  const [loading, setLoading] = useState(true)

  function login(email: string, password: string) {
    // For testing purposes, allow any transparent.partners email (no password required)
    // In production, this should use proper Firebase authentication
    return new Promise<void>((resolve, reject) => {
      if (!email.endsWith('@transparent.partners')) {
        reject(new Error('Only transparent.partners emails are allowed'))
        return
      }
      
      // Simulate authentication success for transparent.partners emails
      const mockUser = {
        uid: 'test-user-id',
        email: email,
        displayName: email.split('@')[0],
        photoURL: null
      } as User
      
      setCurrentUser(mockUser)
      resolve()
    })
  }

  function loginWithGoogle() {
    // For testing purposes, simulate Google login for transparent.partners
    // In production, this should use proper Firebase Google authentication
    return new Promise<void>((resolve, reject) => {
      // Simulate Google login with transparent.partners email
      const mockUser = {
        uid: 'google-test-user-id',
        email: 'bryan.simkins@transparent.partners',
        displayName: 'Bryan Simkins',
        photoURL: null
      } as User
      
      setCurrentUser(mockUser)
      resolve()
    })
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
