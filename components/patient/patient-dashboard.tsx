"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  TrendingUp,
  Heart,
  Activity,
  Thermometer,
  Weight,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"

const healthMetrics = [
  {
    label: "Blood Pressure",
    value: "128/82",
    unit: "mmHg",
    status: "elevated",
    icon: Heart,
    trend: "+5%",
  },
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    icon: Activity,
    trend: "-2%",
  },
  {
    label: "Temperature",
    value: "98.6",
    unit: "°F",
    status: "normal",
    icon: Thermometer,
    trend: "0%",
  },
  {
    label: "Weight",
    value: "165",
    unit: "lbs",
    status: "normal",
    icon: Weight,
    trend: "-1%",
  },
]

export function PatientDashboard() {
  const { user } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.getPatientDashboardStats()
      if (response.success) {
        setDashboardStats(response.stats)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingAppointments = dashboardStats?.upcomingAppointments || []
  const recentAppointments = dashboardStats?.recentAppointments || []

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      {user && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
          <h2 className="text-2xl font-serif font-bold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-muted-foreground">Here's your health overview for today</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/patient/book">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">Schedule with AI assistance</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/conversations">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">View Conversations</h3>
                <p className="text-sm text-muted-foreground">Access visit transcripts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/history">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Medical History</h3>
                <p className="text-sm text-muted-foreground">View health records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Link href="/patient/appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted/30 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{appointment.doctor}</h4>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              ))}
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Link href="/patient/book">
                    <Button className="mt-2">Book Your First Appointment</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Recent Visits</CardTitle>
                <CardDescription>Your latest medical consultations</CardDescription>
              </div>
              <Link href="/patient/history">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-muted/30 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentAppointments.length > 0 ? (
              {recentAppointments.map((visit) => (
                <div key={visit.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{visit.doctor}</h4>
                      <p className="text-sm text-muted-foreground">{visit.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <p className="font-medium text-sm">{visit.type}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Visit completed successfully</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Link href="/patient/conversations">
                      <Button variant="ghost" size="sm">
                        View Transcript
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent visits</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Health Metrics</CardTitle>
              <CardDescription>Latest vital signs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthMetrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.label} className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        metric.status === "normal"
                          ? "bg-primary/10 text-primary"
                          : metric.status === "elevated"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{metric.label}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold">
                            {metric.value} {metric.unit}
                          </span>
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{metric.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Health Score</CardTitle>
              <CardDescription>Overall wellness assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary mb-1">
                  {dashboardStats?.healthSummary?.score || 85}
                </div>
                <p className="text-sm text-muted-foreground">Good Health</p>
              </div>
              <Progress value={dashboardStats?.healthSummary?.score || 85} className="mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Regular checkups completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{dashboardStats?.healthSummary?.currentMedications || 0} active medications</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>{dashboardStats?.healthSummary?.medicalConditions || 0} medical conditions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Reminders</CardTitle>
              <CardDescription>Important health tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <AlertCircle className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Annual Physical Due</p>
                  <p className="text-xs text-muted-foreground">Schedule your yearly checkup</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg">
                <Clock className="h-4 w-4 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Medication Refill</p>
                  <p className="text-xs text-muted-foreground">Blood pressure medication expires in 5 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
