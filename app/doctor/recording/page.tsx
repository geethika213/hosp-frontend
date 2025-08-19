import { ConversationRecorder } from "@/components/recording/conversation-recorder"

export default function RecordingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conversation Recording</h1>
        <p className="text-muted-foreground">Record and manage patient conversations during appointments</p>
      </div>

      <ConversationRecorder />
    </div>
  )
}
