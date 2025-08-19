"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Phone, Video, Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const appointments = {
  upcoming: [
    {
      id: "1",
      doctor: "Dr. Sarah Johnson",
      specialization: "Internal Medicine",
      date: "March 15, 2024",
      time: "9:00 AM - 9:30 AM",
      type: "Follow-up",
      status: "confirmed",
      location: "Downtown Medical Center",
      address: "123 Health Street, Room 205",
      appointmentType: "in-person",
      reason: "Blood pressure follow-up",
    },
    {
      id: "2",
      doctor: "Dr. Michael Chen",
      specialization: "Cardiology",
      date: "March 22, 2024",
      time: "2:30 PM - 3:00 PM",
      type: "Consultation",
      status: "pending",
      location: "Westside Health Clinic",
      address: "456 Medical Ave, Suite 301",
      appointmentType: "telemedicine",
      reason: "Heart palpitations consultation",
    },
    {
      id: "3",
      doctor: "Dr. Emily Rodriguez",
      specialization: "Dermatology",
      date: "March 28, 2024",
      time: "11:00 AM - 11:30 AM",
      type: "Checkup",
      status: "confirmed",
      location: "Central Hospital",
      address: "789 Care Blvd, Floor 3",
      appointmentType: "in-person",
      reason: "Skin examination",
    },
  ],
  past: [
    {
      id: "4",
      doctor: "Dr. Emily Rodriguez",
      specialization: "Internal Medicine",
      date: "March 8, 2024",
      time: "10:00 AM - 10:30 AM",
      type: "Physical Exam",
      status: "completed",
      location: "Central Hospital",
      address: "789 Care Blvd, Floor 2",
      appointmentType: "in-person",
      reason: "Annual physical examination",
      summary: "Overall health is good. Blood pressure slightly elevated.",
    },
    {
      id: "5",
      doctor: "Dr. Sarah Johnson",
      specialization: "Internal Medicine",
      date: "February 28, 2024",
      time: "3:00 PM - 3:30 PM",
      type: "Sick Visit",
      status: "completed",
      location: "Downtown Medical Center",
      address: "123 Health Street, Room 205",
      appointmentType: "in-person",
      reason: "Cold symptoms",
      summary: "Viral upper respiratory infection. Prescribed rest and fluids.",
    },
  ],
}

export function PatientAppointments() {
  const [activeTab, setActiveTab] = useState("upcoming")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      default:
        return "outline"
    }
  }

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: any; isPast?: boolean }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{appointment.doctor}</h3>
              <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                {appointment.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
            <p className="text-sm font-medium mt-1">{appointment.reason}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isPast && (
                <>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Cancel</DropdownMenuItem>
                  <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>View Details</DropdownMenuItem>
              {isPast && <DropdownMenuItem>View Summary</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {appointment.appointmentType === "telemedicine" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Phone className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="capitalize">{appointment.appointmentType}</span>
          </div>
        </div>

        {appointment.address && <p className="text-sm text-muted-foreground mb-4">{appointment.address}</p>}

        {isPast && appointment.summary && (
          <div className="p-3 bg-muted/30 rounded-lg mb-4">
            <p className="text-sm">{appointment.summary}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isPast && appointment.status === "confirmed" && (
            <>
              {appointment.appointmentType === "telemedicine" ? (
                <Button size="sm">Join Video Call</Button>
              ) : (
                <Button size="sm">Get Directions</Button>
              )}
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
            </>
          )}
          {isPast && (
            <>
              <Button variant="outline" size="sm">
                View Summary
              </Button>
              <Button variant="ghost" size="sm">
                Book Follow-up
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">You have {appointments.upcoming.length} upcoming appointments</p>
        </div>
        <Link href="/patient/book">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Appointments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({appointments.upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({appointments.past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {appointments.upcoming.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {appointments.past.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} isPast />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
