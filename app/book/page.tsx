import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Stethoscope, ArrowLeft } from "lucide-react"
import { AIAppointmentBooking } from "@/components/booking/ai-appointment-booking"

export default function PublicBookingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">HealthAI</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Book Your Appointment</h1>
          <p className="text-muted-foreground">
            Our AI assistant will help you find the right doctor and schedule your visit
          </p>
        </div>

        <AIAppointmentBooking />
      </main>
    </div>
  )
}
