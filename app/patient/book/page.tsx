import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AIAppointmentBooking } from "@/components/booking/ai-appointment-booking"

export default function BookAppointmentPage() {
  return (
    <DashboardLayout
      title="Book Appointment"
      subtitle="Let our AI assistant help you find the perfect doctor and time slot"
      userRole="patient"
    >
      <AIAppointmentBooking />
    </DashboardLayout>
  )
}
