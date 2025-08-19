"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Star, MapPin, Clock, Calendar, Stethoscope, Building2, Wifi } from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialization: string
  rating: number
  reviewCount: number
  location: string
  hospital: string
  distance: string
  availableSlots: string[]
  image?: string
  experience: string
  languages: string[]
  matchScore: number
  isOnline: boolean
  currentlyAt: string
}

interface DoctorRecommendationsProps {
  bookingData: any
  onDoctorSelected: () => void
  onBack: () => void
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Internal Medicine",
    rating: 4.9,
    reviewCount: 127,
    location: "New York, NY",
    hospital: "Metropolitan Medical Center",
    distance: "0.8 miles",
    availableSlots: ["Today 2:30 PM", "Tomorrow 9:00 AM", "Tomorrow 3:00 PM"],
    image: "/doctor-woman.png",
    experience: "15 years",
    languages: ["English", "Spanish"],
    matchScore: 98,
    isOnline: true,
    currentlyAt: "Metropolitan Medical Center",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialization: "Family Medicine",
    rating: 4.8,
    reviewCount: 89,
    location: "New York, NY",
    hospital: "City General Hospital",
    distance: "1.2 miles",
    availableSlots: ["Today 4:00 PM", "Tomorrow 10:30 AM", "Friday 2:00 PM"],
    image: "/asian-male-doctor.png",
    experience: "12 years",
    languages: ["English", "Mandarin"],
    matchScore: 95,
    isOnline: false,
    currentlyAt: "City General Hospital",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialization: "Internal Medicine",
    rating: 4.7,
    reviewCount: 156,
    location: "New York, NY",
    hospital: "St. Mary's Hospital",
    distance: "2.1 miles",
    availableSlots: ["Tomorrow 11:00 AM", "Friday 9:30 AM", "Friday 1:00 PM"],
    image: "/hispanic-woman-doctor.png",
    experience: "18 years",
    languages: ["English", "Spanish", "Portuguese"],
    matchScore: 92,
    isOnline: true,
    currentlyAt: "St. Mary's Hospital",
  },
  {
    id: "4",
    name: "Dr. Robert Wilson",
    specialization: "Cardiology",
    rating: 4.9,
    reviewCount: 203,
    location: "New York, NY",
    hospital: "University Hospital",
    distance: "3.5 miles",
    availableSlots: ["Tomorrow 2:00 PM", "Friday 10:00 AM", "Monday 9:00 AM"],
    image: "/senior-male-doctor.png",
    experience: "25 years",
    languages: ["English"],
    matchScore: 89,
    isOnline: true,
    currentlyAt: "University Hospital",
  },
]

export function DoctorRecommendations({ bookingData, onDoctorSelected, onBack }: DoctorRecommendationsProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const filteredDoctors = mockDoctors.filter((doctor) => {
    if (bookingData.preferredLocation && doctor.location !== bookingData.preferredLocation) {
      return false
    }
    if (
      bookingData.preferredHospital &&
      bookingData.preferredHospital !== "any" &&
      doctor.hospital !== bookingData.preferredHospital
    ) {
      return false
    }
    return true
  })

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedSlot) {
      onDoctorSelected()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="font-serif">Available Doctors in {bookingData.preferredLocation}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your symptoms: {bookingData.symptoms.join(", ")} •
              {bookingData.preferredHospital && bookingData.preferredHospital !== "any"
                ? ` ${bookingData.preferredHospital}`
                : ` Within ${bookingData.maxDistance} miles`}
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            {filteredDoctors.filter((d) => d.isOnline).length} doctors online
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`cursor-pointer transition-all ${
                selectedDoctor === doctor.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedDoctor(doctor.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        <Stethoscope className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    {doctor.isOnline && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Wifi className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-semibold">{doctor.name}</h3>
                          {doctor.isOnline && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {doctor.matchScore}% Match
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.experience} experience</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>
                          {doctor.hospital} • {doctor.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Currently at: {doctor.currentlyAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-muted-foreground">Languages:</span>
                      {doctor.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Available appointments:</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedDoctor === doctor.id && selectedSlot === slot ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDoctor(doctor.id)
                              setSelectedSlot(slot)
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDoctors.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                <p className="text-muted-foreground mb-4">
                  No doctors are currently available in {bookingData.preferredLocation}
                  {bookingData.preferredHospital && bookingData.preferredHospital !== "any"
                    ? ` at ${bookingData.preferredHospital}`
                    : ""}
                  .
                </p>
                <Button variant="outline" onClick={onBack}>
                  Adjust Search Criteria
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredDoctors.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDoctor || !selectedSlot}
                size="lg"
                className="px-8"
              >
                Book Appointment with{" "}
                {selectedDoctor ? filteredDoctors.find((d) => d.id === selectedDoctor)?.name : "Doctor"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
