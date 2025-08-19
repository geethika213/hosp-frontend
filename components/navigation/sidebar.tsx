"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Home,
  Settings,
  Menu,
  X,
  Stethoscope,
  UserCircle,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  userRole?: "patient" | "doctor" | "admin"
}

const navigationItems = {
  patient: [
    { name: "Dashboard", href: "/patient", icon: Home },
    { name: "Book Appointment", href: "/patient/book", icon: Calendar },
    { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Medical History", href: "/patient/history", icon: FileText },
    { name: "Conversations", href: "/patient/conversations", icon: MessageSquare },
  ],
  doctor: [
    { name: "Dashboard", href: "/doctor", icon: Home },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Conversations", href: "/doctor/conversations", icon: MessageSquare },
    { name: "Records", href: "/doctor/records", icon: FileText },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
    { name: "Patients", href: "/admin/patients", icon: Users },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

export function Sidebar({ userRole = "patient" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const items = navigationItems[userRole]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-sidebar-foreground">HealthAI</h1>
              <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
