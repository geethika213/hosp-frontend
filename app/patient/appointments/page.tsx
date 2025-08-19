import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PatientAppointments } from "@/components/patient/patient-appointments"

export default function PatientAppointmentsPage() {
  return (
    <DashboardLayout title="My Appointments" subtitle="View and manage your scheduled appointments" userRole="patient">
      <PatientAppointments />
    </DashboardLayout>
  )
}
