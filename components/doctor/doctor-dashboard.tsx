"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Clock,
  Users,
  FileText,
  MessageSquare,
  Plus,
  AlertCircle,
  CheckCircle,
  Video,
  MapPin,
  Hospital,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

const todayAppointments = [
  {
    id: "1",
    patient: "John Smith",
    time: "9:00 AM",
    type: "Follow-up",
    status: "confirmed",
    reason: "Blood pressure check",
    duration: "30 min",
    appointmentType: "in-person",
    patientLocation: "New York, NY",
    bookedVia: "AI Assistant",
  },
  {
    id: "2",
    patient: "Sarah Wilson",
    time: "10:30 AM",
    type: "New Patient",
    status: "confirmed",
    reason: "Annual physical",
    duration: "45 min",
    appointmentType: "in-person",
    patientLocation: "Brooklyn, NY",
    bookedVia: "Direct Booking",
  },
  {
    id: "3",
    patient: "Michael Chen",
    time: "2:00 PM",
    type: "Consultation",
    status: "pending",
    reason: "Chest pain evaluation",
    duration: "30 min",
    appointmentType: "telemedicine",
    patientLocation: "Queens, NY",
    bookedVia: "AI Assistant",
  },
]

const shiftHistory = [
  {
    id: "1",
    hospital: "City General Hospital",
    city: "New York",
    startDate: "March 1, 2024",
    endDate: "March 7, 2024",
    patientsServed: 45,
    status: "completed",
  },
  {
    id: "2",
    hospital: "Brooklyn Medical Center",
    city: "Brooklyn",
    startDate: "March 8, 2024",
    endDate: "March 14, 2024",
    patientsServed: 38,
    status: "completed",
  },
  {
    id: "3",
    hospital: "City General Hospital",
    city: "New York",
    startDate: "March 15, 2024",
    endDate: "March 21, 2024",
    patientsServed: 12,
    status: "current",
  },
]

const recentPatients = [
  {
    id: "1",
    name: "Alice Johnson",
    lastVisit: "March 10, 2024",
    condition: "Hypertension",
    status: "stable",
    nextAppointment: "April 10, 2024",
  },
  {
    id: "2",
    name: "Robert Davis",
    lastVisit: "March 8, 2024",
    condition: "Diabetes Type 2",
    status: "monitoring",
    nextAppointment: "March 22, 2024",
  },
  {
    id: "3",
    name: "Lisa Brown",
    lastVisit: "March 5, 2024",
    condition: "Annual Physical",
    status: "healthy",
    nextAppointment: "March 2025",
  },
]

const practiceStats = [
  {
    label: "Today's Appointments",
    value: "8",
    change: "+2 from yesterday",
    icon: Calendar,
    color: "text-primary",
  },
  {
    label: "Active Patients",
    value: "247",
    change: "+12 this month",
    icon: Users,
    color: "text-secondary",
  },
  {
    label: "Pending Reviews",
    value: "5",
    change: "2 urgent",
    icon: FileText,
    color: "text-yellow-600",
  },
  {
    label: "Messages",
    value: "12",
    change: "3 unread",
    icon: MessageSquare,
    color: "text-blue-600",
  },
]

export function DoctorDashboard() {
  const { user, updateLocation, setOnlineStatus, logout } = useAuth()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [newHospital, setNewHospital] = useState("")
  const [newCity, setNewCity] = useState("")

  const handleLocationUpdate = () => {
    if (newHospital && newCity) {
      updateLocation(newHospital, newCity)
      setIsLocationModalOpen(false)
      setNewHospital("")
      setNewCity("")
    }
  }

  const toggleOnlineStatus = () => {
    setOnlineStatus(!user?.isOnline)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold">Welcome, {user?.name}</h2>
                <p className="text-muted-foreground">{user?.specialization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user?.currentHospital}, {user?.currentCity}
                  </span>
                  <Badge variant={user?.isOnline ? "default" : "secondary"} className="ml-2">
                    {user?.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsLocationModalOpen(true)}>
                <Hospital className="h-4 w-4 mr-2" />
                Update Location
              </Button>
              <Button variant="outline" onClick={toggleOnlineStatus}>
                {user?.isOnline ? "Go Offline" : "Go Online"}
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLocationModalOpen && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CardContent className="bg-background p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Current Location</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hospital">Hospital</Label>
                <Select value={newHospital} onValueChange={setNewHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City General Hospital">City General Hospital</SelectItem>
                    <SelectItem value="Brooklyn Medical Center">Brooklyn Medical Center</SelectItem>
                    <SelectItem value="Queens Healthcare">Queens Healthcare</SelectItem>
                    <SelectItem value="Manhattan Medical">Manhattan Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select value={newCity} onValueChange={setNewCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                    <SelectItem value="Queens">Queens</SelectItem>
                    <SelectItem value="Manhattan">Manhattan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLocationUpdate} className="flex-1">
                  Update
                </Button>
                <Button variant="outline" onClick={() => setIsLocationModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Current Shift</CardTitle>
            <CardDescription>March 15-21, 2024 • {user?.currentHospital}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Patients Served Today</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Appointments Remaining</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Shift Progress</span>
                <span className="font-semibold">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Shift History</CardTitle>
            <CardDescription>Recent hospital assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shiftHistory.slice(0, 3).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{shift.hospital}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.city} • {shift.startDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={shift.status === "current" ? "default" : "secondary"} className="text-xs">
                      {shift.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{shift.patientsServed} patients</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {practiceStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted/30 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Today's Schedule</CardTitle>
                <CardDescription>March 15, 2024 • {todayAppointments.length} appointments</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{appointment.patient}</h4>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {appointment.status}
                      </Badge>
                      {appointment.appointmentType === "telemedicine" && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        {appointment.bookedVia}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{appointment.time}</span>
                      <span>{appointment.duration}</span>
                      <span className="capitalize">{appointment.type}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.patientLocation}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {appointment.appointmentType === "telemedicine" ? (
                      <Button size="sm" className="gap-2">
                        <Video className="h-4 w-4" />
                        Join Call
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <FileText className="h-4 w-4" />
                        View Chart
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Recent Patients</CardTitle>
                <CardDescription>Patients seen in the last week</CardDescription>
              </div>
              <Link href="/doctor/patients">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{patient.name}</h4>
                      <Badge
                        variant={
                          patient.status === "stable"
                            ? "default"
                            : patient.status === "monitoring"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Last visit: {patient.lastVisit}</span>
                      <span>Next: {patient.nextAppointment}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View Chart
                    </Button>
                    <Button size="sm" variant="ghost">
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/doctor/patients/new">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add New Patient
                </Button>
              </Link>
              <Link href="/doctor/appointments/schedule">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              </Link>
              <Link href="/doctor/records/new">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <FileText className="h-4 w-4" />
                  Create Record
                </Button>
              </Link>
              <Link href="/doctor/conversations">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <MessageSquare className="h-4 w-4" />
                  View Conversations
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Practice Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Practice Performance</CardTitle>
              <CardDescription>This month's metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Patient Satisfaction</span>
                  <span className="text-sm font-semibold">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Appointment Completion</span>
                  <span className="text-sm font-semibold">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">On-time Performance</span>
                  <span className="text-sm font-semibold">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Pending Tasks</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab Results Review</p>
                  <p className="text-xs text-muted-foreground">3 results pending review</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Patient Messages</p>
                  <p className="text-xs text-muted-foreground">5 unread messages</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Prescription Renewals</p>
                  <p className="text-xs text-muted-foreground">2 prescriptions expiring soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">CME Credits Due</p>
                  <p className="text-xs text-muted-foreground">Complete by April 30, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-4 w-4 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">License Renewal</p>
                  <p className="text-xs text-muted-foreground">Renew by June 15, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
