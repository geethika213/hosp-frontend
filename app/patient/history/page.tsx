import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PatientHistory } from "@/components/patient/patient-history"

export default function PatientHistoryPage() {
  return (
    <DashboardLayout
      title="Medical History"
      subtitle="Your complete health records and visit summaries"
      userRole="patient"
    >
      <PatientHistory />
    </DashboardLayout>
  )
}
