import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PatientDashboard } from "@/components/patient/patient-dashboard"

export default function PatientDashboardPage() {
  return (
    <DashboardLayout title="Patient Dashboard" subtitle="Welcome back! Here's your health overview" userRole="patient">
      <PatientDashboard />
    </DashboardLayout>
  )
}
