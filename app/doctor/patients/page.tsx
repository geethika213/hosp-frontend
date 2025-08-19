import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorPatients } from "@/components/doctor/doctor-patients"

export default function DoctorPatientsPage() {
  return (
    <DashboardLayout title="Patients" subtitle="Manage your patient roster and medical records" userRole="doctor">
      <DoctorPatients />
    </DashboardLayout>
  )
}
