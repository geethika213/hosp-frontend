import { SummaryViewer } from "@/components/summary/summary-viewer"

export default function SummariesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Visit Summaries</h1>
        <p className="text-muted-foreground">AI-generated summaries of patient visits and conversations</p>
      </div>

      <SummaryViewer />
    </div>
  )
}
