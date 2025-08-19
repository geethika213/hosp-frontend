"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, MapPin, User, FileText, Home } from "lucide-react"
import Link from "next/link"

interface BookingConfirmationProps {
  bookingData: any
  onNewBooking: () => void
}

export function BookingConfirmation({ bookingData, onNewBooking }: BookingConfirmationProps) {
  const appointmentDetails = {
    confirmationNumber: "APT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    doctor: "Dr. Sarah Johnson",
    specialization: "Internal Medicine",
    date: "Tomorrow, March 15, 2024",
    time: "9:00 AM - 9:30 AM",
    location: "Downtown Medical Center",
    address: "123 Health Street, Medical District",
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-serif text-2xl text-primary">Appointment Confirmed!</CardTitle>
          <p className="text-muted-foreground">Your appointment has been successfully scheduled</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation Number */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
            <p className="font-mono text-lg font-bold">{appointmentDetails.confirmationNumber}</p>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Appointment Details</h3>

            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{appointmentDetails.doctor}</p>
                  <p className="text-sm text-muted-foreground">{appointmentDetails.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{appointmentDetails.date}</p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{appointmentDetails.time}</p>
                  <p className="text-sm text-muted-foreground">Duration: 30 minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{appointmentDetails.location}</p>
                  <p className="text-sm text-muted-foreground">{appointmentDetails.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Symptoms Discussed
            </h3>
            <div className="flex flex-wrap gap-2">
              {bookingData.symptoms.map((symptom: string) => (
                <Badge key={symptom} variant="outline">
                  {symptom}
                </Badge>
              ))}
            </div>
            {bookingData.additionalNotes && (
              <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">{bookingData.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You'll receive a confirmation email with appointment details</li>
              <li>• A reminder will be sent 24 hours before your appointment</li>
              <li>• Please arrive 15 minutes early for check-in</li>
              <li>• Bring a valid ID and insurance card</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/patient" className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button onClick={onNewBooking} className="flex-1 gap-2">
              <Calendar className="h-4 w-4" />
              Book Another Appointment
            </Button>
          </div>

          {/* Support */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              Need to reschedule or have questions?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
