"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, MapPin, Video, Plus, MoreHorizontal, FileText, MessageSquare, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

const appointments = {
  today: [
    {
      id: "1",
      patient: "John Smith",
      time: "9:00 AM - 9:30 AM",
      type: "Follow-up",
      status: "confirmed",
      reason: "Blood pressure check",
      appointmentType: "in-person",
      patientAge: 45,
      lastVisit: "Feb 15, 2024",
      notes: "Patient has been monitoring BP at home. Needs medication adjustment review.",
    },
    {
      id: "2",
      patient: "Sarah Wilson",
      time: "10:30 AM - 11:15 AM",
      type: "New Patient",
      status: "confirmed",
      reason: "Annual physical examination",
      appointmentType: "in-person",
      patientAge: 32,
      lastVisit: "New Patient",
      notes: "First visit. Complete physical exam and health history.",
    },
    {
      id: "3",
      patient: "Michael Chen",
      time: "2:00 PM - 2:30 PM",
      type: "Consultation",
      status: "in-progress",
      reason: "Chest pain evaluation",
      appointmentType: "telemedicine",
      patientAge: 38,
      lastVisit: "Jan 20, 2024",
      notes: "Patient reports intermittent chest discomfort. EKG ordered.",
    },
    {
      id: "4",
      patient: "Emily Rodriguez",
      time: "3:30 PM - 3:50 PM",
      type: "Follow-up",
      status: "waiting",
      reason: "Medication review",
      appointmentType: "in-person",
      patientAge: 28,
      lastVisit: "Mar 1, 2024",
      notes: "Review effectiveness of new antidepressant medication.",
    },
  ],
  upcoming: [
    {
      id: "5",
      patient: "Robert Davis",
      date: "March 16, 2024",
      time: "9:00 AM - 9:30 AM",
      type: "Follow-up",
      status: "confirmed",
      reason: "Diabetes management",
      appointmentType: "in-person",
      patientAge: 52,
      lastVisit: "Feb 16, 2024",
      notes: "Review A1C results and adjust insulin dosage if needed.",
    },
    {
      id: "6",
      patient: "Lisa Brown",
      date: "March 18, 2024",
      time: "11:00 AM - 11:30 AM",
      type: "Consultation",
      status: "confirmed",
      reason: "Skin rash evaluation",
      appointmentType: "telemedicine",
      patientAge: 41,
      lastVisit: "New Patient",
      notes: "Patient reports persistent rash on arms. Photos uploaded to portal.",
    },
  ],
}

export function DoctorAppointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState("list")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "in-progress":
        return "destructive"
      case "waiting":
        return "secondary"
      case "completed":
        return "outline"
      default:
        return "outline"
    }
  }

  const AppointmentCard = ({ appointment, showDate = false }: { appointment: any; showDate?: boolean }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{appointment.patient}</h3>
                <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                  {appointment.status}
                </Badge>
                {appointment.appointmentType === "telemedicine" && (
                  <Badge variant="outline" className="text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Age {appointment.patientAge} • Last visit: {appointment.lastVisit}
              </p>
              <p className="text-sm font-medium mt-1">{appointment.reason}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Patient Chart</DropdownMenuItem>
              <DropdownMenuItem>Start Visit</DropdownMenuItem>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {showDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.date}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{appointment.type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {appointment.appointmentType === "telemedicine" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="capitalize">{appointment.appointmentType}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3 bg-muted/30 rounded-lg mb-4">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {appointment.status === "confirmed" && (
            <>
              {appointment.appointmentType === "telemedicine" ? (
                <Button size="sm" className="gap-2">
                  <Video className="h-4 w-4" />
                  Start Video Call
                </Button>
              ) : (
                <Button size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Start Visit
                </Button>
              )}
            </>
          )}
          {appointment.status === "in-progress" && (
            <Button size="sm" variant="destructive" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Continue Visit
            </Button>
          )}
          {appointment.status === "waiting" && (
            <Button size="sm" variant="secondary" className="gap-2">
              <User className="h-4 w-4" />
              Call Patient
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            View Chart
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            You have {appointments.today.length} appointments today, {appointments.upcoming.length} upcoming
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Appointments */}
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today ({appointments.today.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({appointments.upcoming.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="mb-4">
            <h3 className="font-serif text-lg font-semibold mb-2">Today's Schedule - {format(new Date(), "PPPP")}</h3>
          </div>
          {appointments.today
            .filter((apt) => filterStatus === "all" || apt.status === filterStatus)
            .map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {appointments.upcoming
            .filter((apt) => filterStatus === "all" || apt.status === filterStatus)
            .map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} showDate />
            ))}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-semibold mb-4">
                    {selectedDate ? format(selectedDate, "PPPP") : "Select a date"}
                  </h3>
                  {selectedDate && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? (
                    <div className="space-y-4">
                      {appointments.today.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="text-sm font-medium w-20">{appointment.time.split(" - ")[0]}</div>
                          <div className="flex-1">
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                          <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No appointments scheduled for this date.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
