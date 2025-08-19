"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { socketService } from "@/lib/socket"

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: "patient" | "doctor" | "admin"
  phone?: string
  avatar?: string
  isActive: boolean
  isVerified: boolean
  lastLogin?: string
  // Doctor specific fields
  specialization?: string
  licenseNumber?: string
  experience?: number
  currentHospital?: string
  currentCity?: string
  isOnline?: boolean
  consultationFee?: number
  rating?: {
    average: number
    count: number
  }
  // Patient specific fields
  dateOfBirth?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  medicalHistory?: Array<{
    condition: string
    diagnosedDate: string
    status: string
  }>
  allergies?: string[]
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
    prescribedBy?: string
    startDate?: string
    endDate?: string
  }>
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  updateProfile: (profileData: any) => Promise<boolean>
  updateLocation: (hospital: string, city: string) => void
  setOnlineStatus: (status: boolean) => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('healthai_token')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await apiClient.getCurrentUser()
      
      if (response.success && response.user) {
        setUser(response.user)
        // Connect socket with token
        socketService.connect(token)
      } else {
        // Invalid token, clear it
        apiClient.clearToken()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      apiClient.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.login(email, password)
      
      if (response.success && response.user) {
        setUser(response.user)
        localStorage.setItem("healthai_user", JSON.stringify(response.user))
        
        // Connect socket
        if (response.token) {
          socketService.connect(response.token)
        }
        
        setIsLoading(false)
        return true
      } else {
        setError(response.message || 'Login failed')
        setIsLoading(false)
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed')
      setIsLoading(false)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.register(userData)
      
      if (response.success && response.user) {
        setUser(response.user)
        localStorage.setItem("healthai_user", JSON.stringify(response.user))
        
        // Connect socket
        if (response.token) {
          socketService.connect(response.token)
        }
        
        setIsLoading(false)
        return true
      } else {
        setError(response.message || 'Registration failed')
        setIsLoading(false)
        return false
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed')
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      socketService.disconnect()
      router.push("/auth/login")
    }
  }

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      setError(null)
      const response = await apiClient.updateProfile(profileData)
      
      if (response.success && response.user) {
        setUser(response.user)
        localStorage.setItem("healthai_user", JSON.stringify(response.user))
        return true
      } else {
        setError(response.message || 'Profile update failed')
        return false
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError(error.message || 'Profile update failed')
      return false
    }
  }

  const updateLocation = async (hospital: string, city: string) => {
    try {
      if (user && user.role === "doctor") {
        const response = await apiClient.updateLocation(hospital, city)
        
        if (response.success && response.user) {
          setUser(response.user)
          localStorage.setItem("healthai_user", JSON.stringify(response.user))
        }
      }
    } catch (error) {
      console.error('Location update error:', error)
    }
  }

  const setOnlineStatus = async (status: boolean) => {
    try {
      if (user && user.role === "doctor") {
        const response = await apiClient.updateOnlineStatus(status)
        
        if (response.success && response.user) {
          setUser(response.user)
          localStorage.setItem("healthai_user", JSON.stringify(response.user))
          
          // Update socket status
          socketService.updateOnlineStatus(status)
        }
      }
    } catch (error) {
      console.error('Online status update error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        updateLocation,
        setOnlineStatus,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
