import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorRecords } from "@/components/doctor/doctor-records"

export default function DoctorRecordsPage() {
  return (
    <DashboardLayout title="Medical Records" subtitle="Create and manage patient medical records" userRole="doctor">
      <DoctorRecords />
    </DashboardLayout>
  )
}
