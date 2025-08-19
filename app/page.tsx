import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Shield, Stethoscope, Users, MapPin, Video } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg shadow-sm">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                HealthCare Connect
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-emerald-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent mb-6">
            Find Healthcare Providers Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with qualified doctors in your area, book appointments, and manage your healthcare with video
            consultations and location-based services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient/book">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Find Doctors Near Me
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-emerald-200 hover:bg-emerald-50"
              >
                <Video className="mr-2 h-5 w-5" />
                Video Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform connects you with healthcare providers in your area with modern technology and intuitive
              design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <MapPin className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Location-Based Booking</CardTitle>
                <CardDescription>
                  Find and book appointments with doctors near your location with real-time availability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Video className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Video Consultations</CardTitle>
                <CardDescription>
                  Connect with healthcare providers through secure video calls from anywhere
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Users className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Patient & Doctor Portals</CardTitle>
                <CardDescription>
                  Dedicated dashboards for seamless communication and comprehensive health management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>
                  Communicate securely with your healthcare providers and access consultation records
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Shield className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>HIPAA Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security ensuring your medical data remains private and protected
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Calendar className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Automated appointment reminders and intelligent rescheduling based on doctor availability
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Ready to Connect with Healthcare Providers?</h2>
          <p className="text-emerald-100 mb-8">
            Join thousands of patients who use HealthCare Connect to find and connect with qualified doctors in their
            area.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg">
              Start Finding Doctors Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="font-serif font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  HealthCare Connect
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting patients with healthcare providers through modern technology and location-based services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Patients</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/patient/book" className="hover:text-foreground">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link href="/patient" className="hover:text-foreground">
                    Patient Portal
                  </Link>
                </li>
                <li>
                  <Link href="/patient/history" className="hover:text-foreground">
                    Medical History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Doctors</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/doctor" className="hover:text-foreground">
                    Doctor Portal
                  </Link>
                </li>
                <li>
                  <Link href="/doctor/patients" className="hover:text-foreground">
                    Patient Management
                  </Link>
                </li>
                <li>
                  <Link href="/doctor/appointments" className="hover:text-foreground">
                    Appointments
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 HealthCare Connect. All rights reserved. HIPAA Compliant Healthcare Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
