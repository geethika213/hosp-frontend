import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PatientConversations } from "@/components/patient/patient-conversations"

export default function PatientConversationsPage() {
  return (
    <DashboardLayout
      title="Conversation History"
      subtitle="Access transcripts and summaries from your medical visits"
      userRole="patient"
    >
      <PatientConversations />
    </DashboardLayout>
  )
}
