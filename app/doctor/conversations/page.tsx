import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorConversations } from "@/components/doctor/doctor-conversations"

export default function DoctorConversationsPage() {
  return (
    <DashboardLayout
      title="Conversation History"
      subtitle="Access and manage patient conversation transcripts and recordings"
      userRole="doctor"
    >
      <DoctorConversations />
    </DashboardLayout>
  )
}
