"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: "patient" | "doctor" | "admin"
  // Doctor specific fields
  specialization?: string
  licenseNumber?: string
  currentHospital?: string
  currentCity?: string
  isOnline?: boolean
  // Patient specific fields
  dateOfBirth?: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  updateLocation: (hospital: string, city: string) => void
  setOnlineStatus: (status: boolean) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "patient@demo.com",
    name: "John Smith",
    role: "patient",
    dateOfBirth: "1990-05-15",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY",
  },
  {
    id: "2",
    email: "doctor@demo.com",
    name: "Dr. Sarah Johnson",
    role: "doctor",
    specialization: "Cardiology",
    licenseNumber: "MD12345",
    currentHospital: "City General Hospital",
    currentCity: "New York",
    isOnline: true,
  },
  {
    id: "3",
    email: "admin@demo.com",
    name: "Admin User",
    role: "admin",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("healthai_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.role === role)

    if (foundUser && password === "demo123") {
      setUser(foundUser)
      localStorage.setItem("healthai_user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("healthai_user")
    router.push("/auth/login")
  }

  const updateLocation = (hospital: string, city: string) => {
    if (user && user.role === "doctor") {
      const updatedUser = { ...user, currentHospital: hospital, currentCity: city }
      setUser(updatedUser)
      localStorage.setItem("healthai_user", JSON.stringify(updatedUser))
    }
  }

  const setOnlineStatus = (status: boolean) => {
    if (user && user.role === "doctor") {
      const updatedUser = { ...user, isOnline: status }
      setUser(updatedUser)
      localStorage.setItem("healthai_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateLocation,
        setOnlineStatus,
        isLoading,
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
