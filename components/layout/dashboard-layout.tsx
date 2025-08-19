import type React from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  userRole?: "patient" | "doctor" | "admin"
}

export function DashboardLayout({ children, title, subtitle, userRole = "patient" }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} />

      <div className="md:ml-64">
        <Header title={title} subtitle={subtitle} />

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
