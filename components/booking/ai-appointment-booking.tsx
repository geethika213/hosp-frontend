"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AIBookingChat } from "./ai-booking-chat"
import { DoctorRecommendations } from "./doctor-recommendations"
import { BookingConfirmation } from "./booking-confirmation"
import { CalendarIcon, Clock, MessageSquare, Sparkles, X, MapPin } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface BookingData {
  patientName: string
  symptoms: string[]
  preferredDate: Date | undefined
  preferredTime: string
  urgency: "low" | "medium" | "high"
  additionalNotes: string
  preferredLocation: string
  preferredHospital: string
  maxDistance: string
}

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Chest Pain",
  "Shortness of Breath",
  "Abdominal Pain",
  "Nausea",
  "Fatigue",
  "Dizziness",
  "Back Pain",
  "Joint Pain",
  "Skin Rash",
  "Anxiety",
  "Depression",
  "Sleep Issues",
]

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
]

const locations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
]

const hospitals = [
  "City General Hospital",
  "Metropolitan Medical Center",
  "St. Mary's Hospital",
  "University Hospital",
  "Regional Medical Center",
  "Community Health Center",
  "Downtown Medical Plaza",
  "Northside Hospital",
  "Southside Medical Center",
  "Central Hospital",
]

export function AIAppointmentBooking() {
  const [step, setStep] = useState<"form" | "chat" | "recommendations" | "confirmation">("form")
  const [bookingData, setBookingData] = useState<BookingData>({
    patientName: "",
    symptoms: [],
    preferredDate: undefined,
    preferredTime: "",
    urgency: "medium",
    additionalNotes: "",
    preferredLocation: "",
    preferredHospital: "",
    maxDistance: "10",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSymptomToggle = (symptom: string) => {
    setBookingData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setStep("chat")
    }, 2000)
  }

  const handleChatComplete = () => {
    setStep("recommendations")
  }

  const handleDoctorSelected = () => {
    setStep("confirmation")
  }

  if (step === "confirmation") {
    return <BookingConfirmation bookingData={bookingData} onNewBooking={() => setStep("form")} />
  }

  if (step === "recommendations") {
    return (
      <DoctorRecommendations
        bookingData={bookingData}
        onDoctorSelected={handleDoctorSelected}
        onBack={() => setStep("chat")}
      />
    )
  }

  if (step === "chat") {
    return (
      <AIBookingChat
        bookingData={bookingData}
        onComplete={handleChatComplete}
        onBack={() => setStep("form")}
        onUpdateBooking={setBookingData}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Appointment Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="Enter patient's full name"
                value={bookingData.patientName}
                onChange={(e) => setBookingData((prev) => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>

            {/* Location Selection */}
            <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <Label className="text-base font-semibold text-emerald-800">Location Preferences</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred City/Location</Label>
                  <Select
                    value={bookingData.preferredLocation}
                    onValueChange={(value) => setBookingData((prev) => ({ ...prev, preferredLocation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Hospital (Optional)</Label>
                  <Select
                    value={bookingData.preferredHospital}
                    onValueChange={(value) => setBookingData((prev) => ({ ...prev, preferredHospital: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any hospital</SelectItem>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital} value={hospital}>
                          {hospital}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Distance</Label>
                <Select
                  value={bookingData.maxDistance}
                  onValueChange={(value) => setBookingData((prev) => ({ ...prev, maxDistance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                    <SelectItem value="10">Within 10 miles</SelectItem>
                    <SelectItem value="25">Within 25 miles</SelectItem>
                    <SelectItem value="50">Within 50 miles</SelectItem>
                    <SelectItem value="any">Any distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Symptoms Selection */}
            <div className="space-y-3">
              <Label>What symptoms are you experiencing?</Label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant={bookingData.symptoms.includes(symptom) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    {symptom}
                    {bookingData.symptoms.includes(symptom) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional symptoms or notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Describe any other symptoms or provide additional context..."
                value={bookingData.additionalNotes}
                onChange={(e) => setBookingData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <Label>How urgent is this appointment?</Label>
              <Select
                value={bookingData.urgency}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setBookingData((prev) => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Routine checkup or minor concern</SelectItem>
                  <SelectItem value="medium">Medium - Concerning symptoms, need attention soon</SelectItem>
                  <SelectItem value="high">High - Urgent symptoms, need immediate care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingData.preferredDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.preferredDate ? format(bookingData.preferredDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bookingData.preferredDate}
                      onSelect={(date) => setBookingData((prev) => ({ ...prev, preferredDate: date }))}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select
                  value={bookingData.preferredTime}
                  onValueChange={(value) => setBookingData((prev) => ({ ...prev, preferredTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isAnalyzing || !bookingData.preferredLocation}>
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Finding available doctors in your area...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Find Available Doctors
                </div>
              )}
            </Button>

            {!bookingData.preferredLocation && (
              <p className="text-sm text-muted-foreground text-center">
                Please select your preferred location to continue
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
