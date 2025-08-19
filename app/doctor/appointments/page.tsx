import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorAppointments } from "@/components/doctor/doctor-appointments"

export default function DoctorAppointmentsPage() {
  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Manage your appointment schedule and patient visits"
      userRole="doctor"
    >
      <DoctorAppointments />
    </DashboardLayout>
  )
}
