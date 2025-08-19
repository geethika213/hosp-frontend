"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Video, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/auth/login")
    }
  }, [isLoaded, user, router])

  if (!isLoaded || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground">Choose your role to access the appropriate portal</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <Users className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>Patient Portal</CardTitle>
              <CardDescription>Find doctors near you, book appointments, and manage your healthcare</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/patient/book">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Doctors Near Me
                  </Button>
                </Link>
                <Link href="/patient/video">
                  <Button variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 bg-transparent">
                    <Video className="mr-2 h-4 w-4" />
                    Video Consultation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <Calendar className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>Doctor Portal</CardTitle>
              <CardDescription>Manage your practice, update locations, and connect with patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/doctor/location">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    Update Location
                  </Button>
                </Link>
                <Link href="/doctor/appointments">
                  <Button variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Appointments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
