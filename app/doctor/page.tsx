import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout
      title="Doctor Dashboard"
      subtitle="Welcome back, Dr. Johnson! Here's your practice overview"
      userRole="doctor"
    >
      <DoctorDashboard />
    </DashboardLayout>
  )
}
