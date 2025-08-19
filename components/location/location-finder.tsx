"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Search } from "lucide-react"

interface Location {
  latitude: number
  longitude: number
  city: string
  state: string
}

interface LocationFinderProps {
  onLocationSelect: (location: Location) => void
}

export default function LocationFinder({ onLocationSelect }: LocationFinderProps) {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [manualLocation, setManualLocation] = useState("")

  const getCurrentLocation = () => {
    setIsLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Mock reverse geocoding - in real app, use Google Maps API or similar
          const mockLocation: Location = {
            latitude,
            longitude,
            city: "Current City",
            state: "Current State",
          }

          setLocation(mockLocation)
          onLocationSelect(mockLocation)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
          alert("Unable to get your location. Please enter manually.")
        },
      )
    } else {
      setIsLoading(false)
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleManualLocation = () => {
    if (manualLocation.trim()) {
      // Mock geocoding - in real app, use Google Maps API
      const mockLocation: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        city: manualLocation.split(",")[0]?.trim() || manualLocation,
        state: manualLocation.split(",")[1]?.trim() || "State",
      }

      setLocation(mockLocation)
      onLocationSelect(mockLocation)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Find Your Location
        </CardTitle>
        <CardDescription>We'll help you find doctors near your location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Button */}
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
        >
          <Navigation className="mr-2 h-4 w-4" />
          {isLoading ? "Getting Location..." : "Use Current Location"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-emerald-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Manual Location Input */}
        <div className="space-y-2">
          <Label htmlFor="manual-location">Enter City, State</Label>
          <div className="flex gap-2">
            <Input
              id="manual-location"
              placeholder="e.g., New York, NY"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="border-emerald-200 focus:border-emerald-500"
            />
            <Button
              onClick={handleManualLocation}
              variant="outline"
              className="border-emerald-200 hover:bg-emerald-50 bg-transparent"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Location Display */}
        {location && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              📍 {location.city}, {location.state}
            </p>
            <p className="text-xs text-emerald-600">Searching for doctors in this area</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
