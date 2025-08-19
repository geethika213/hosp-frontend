"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

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
  updateLocation: (hospital: string, city: string) => Promise<boolean>
  setOnlineStatus: (status: boolean) => Promise<boolean>
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

      apiClient.setToken(token)
      const response = await apiClient.getCurrentUser()
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
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
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
        return true
      } else {
        setError(response.message || 'Login failed')
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.register(userData)
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
        return true
      } else {
        setError(response.message || 'Registration failed')
        return false
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      apiClient.clearToken()
      router.push("/auth/login")
    }
  }

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      setError(null)
      const response = await apiClient.updateProfile(profileData)
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
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

  const updateLocation = async (hospital: string, city: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await apiClient.updateLocation(hospital, city)
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
        return true
      } else {
        setError(response.message || 'Location update failed')
        return false
      }
    } catch (error: any) {
      console.error('Location update error:', error)
      setError(error.message || 'Location update failed')
      return false
    }
  }

  const setOnlineStatus = async (status: boolean): Promise<boolean> => {
    try {
      setError(null)
      const response = await apiClient.updateOnlineStatus(status)
      
      if (response.success && response.data) {
        setUser(response.data.user || response.data)
        return true
      } else {
        setError(response.message || 'Status update failed')
        return false
      }
    } catch (error: any) {
      console.error('Online status update error:', error)
      setError(error.message || 'Status update failed')
      return false
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
