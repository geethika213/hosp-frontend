"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, Calendar, User, Stethoscope, Download, Share } from "lucide-react"

interface Summary {
  id: string
  patientName: string
  doctorName: string
  date: string
  type: "consultation" | "follow-up" | "emergency" | "routine"
  duration: string
  chiefComplaint: string
  diagnosis: string
  treatment: string
  medications: string[]
  followUp: string
  aiConfidence: number
  recordingId?: string
}

const mockSummaries: Summary[] = [
  {
    id: "1",
    patientName: "John Smith",
    doctorName: "Dr. Sarah Wilson",
    date: "2024-01-15",
    type: "consultation",
    duration: "30 min",
    chiefComplaint: "Chest pain and shortness of breath for 2 days",
    diagnosis: "Possible angina, requires further cardiac evaluation",
    treatment: "ECG performed, blood work ordered, nitroglycerin prescribed for acute episodes",
    medications: ["Nitroglycerin 0.4mg SL PRN", "Aspirin 81mg daily"],
    followUp: "Cardiology referral within 1 week, return if symptoms worsen",
    aiConfidence: 92,
    recordingId: "rec_001",
  },
  {
    id: "2",
    patientName: "Sarah Johnson",
    date: "2024-01-14",
    doctorName: "Dr. Michael Chen",
    type: "follow-up",
    duration: "20 min",
    chiefComplaint: "Hypertension follow-up, medication adjustment",
    diagnosis: "Hypertension, well-controlled on current regimen",
    treatment: "Blood pressure monitoring, lifestyle counseling continued",
    medications: ["Lisinopril 10mg daily", "Hydrochlorothiazide 25mg daily"],
    followUp: "Return in 3 months for routine BP check",
    aiConfidence: 96,
    recordingId: "rec_002",
  },
  {
    id: "3",
    patientName: "Robert Davis",
    date: "2024-01-13",
    doctorName: "Dr. Emily Rodriguez",
    type: "routine",
    duration: "25 min",
    chiefComplaint: "Annual physical examination",
    diagnosis: "Generally healthy, mild vitamin D deficiency noted",
    treatment: "Routine labs completed, vitamin D supplementation recommended",
    medications: ["Vitamin D3 2000 IU daily"],
    followUp: "Annual physical in 12 months, recheck vitamin D in 3 months",
    aiConfidence: 88,
    recordingId: "rec_003",
  },
]

export function SummaryViewer() {
  const [summaries, setSummaries] = useState<Summary[]>(mockSummaries)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      summary.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || summary.type === filterType

    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      case "routine":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Generated Visit Summaries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary List */}
        <div className="space-y-4">
          {filteredSummaries.map((summary) => (
            <Card
              key={summary.id}
              className={`cursor-pointer transition-colors ${
                selectedSummary?.id === summary.id ? "ring-2 ring-emerald-500" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedSummary(summary)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{summary.patientName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {summary.doctorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getTypeColor(summary.type)}>{summary.type}</Badge>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {summary.date}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Chief Complaint:</strong> {summary.chiefComplaint}
                  </p>
                  <p className="text-sm">
                    <strong>Diagnosis:</strong> {summary.diagnosis}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{summary.duration}</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(summary.aiConfidence)}`}>
                      AI Confidence: {summary.aiConfidence}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Summary View */}
        <div>
          {selectedSummary ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Visit Summary Details
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="treatment">Treatment</TabsTrigger>
                    <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Patient Information</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p>
                          <strong>Name:</strong> {selectedSummary.patientName}
                        </p>
                        <p>
                          <strong>Date:</strong> {selectedSummary.date}
                        </p>
                        <p>
                          <strong>Duration:</strong> {selectedSummary.duration}
                        </p>
                        <p>
                          <strong>Type:</strong>{" "}
                          <Badge className={getTypeColor(selectedSummary.type)}>{selectedSummary.type}</Badge>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Chief Complaint</h4>
                      <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedSummary.chiefComplaint}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Diagnosis</h4>
                      <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedSummary.diagnosis}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="treatment" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Treatment Plan</h4>
                      <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedSummary.treatment}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Medications</h4>
                      <div className="space-y-2">
                        {selectedSummary.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm">{med}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="follow-up" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Follow-up Instructions</h4>
                      <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedSummary.followUp}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm mb-2">
                          <strong>Confidence Level:</strong>
                          <span className={`ml-2 font-medium ${getConfidenceColor(selectedSummary.aiConfidence)}`}>
                            {selectedSummary.aiConfidence}%
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This summary was generated using AI analysis of the recorded conversation. High confidence
                          indicates strong alignment with medical terminology and context.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a summary to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
