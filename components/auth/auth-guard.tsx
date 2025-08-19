"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "patient" | "doctor" | "admin"
}

// Mock authentication state - in a real app, this would come from a context or state management
const mockAuth = {
  isAuthenticated: false,
  user: null as { id: string; email: string; role: "patient" | "doctor" | "admin" } | null,
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = () => {
      // In a real app, you'd check localStorage, cookies, or make an API call
      const token = localStorage.getItem("auth-token")
      const userRole = localStorage.getItem("user-role") as "patient" | "doctor" | "admin" | null

      if (token && userRole) {
        mockAuth.isAuthenticated = true
        mockAuth.user = {
          id: "mock-user-id",
          email: "user@example.com",
          role: userRole,
        }
      }

      // Check if user is authenticated
      if (!mockAuth.isAuthenticated) {
        router.push("/auth/login")
        return
      }

      // Check role-based access
      if (requiredRole && mockAuth.user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user's role
        switch (mockAuth.user?.role) {
          case "patient":
            router.push("/patient")
            break
          case "doctor":
            router.push("/doctor")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/auth/login")
        }
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
