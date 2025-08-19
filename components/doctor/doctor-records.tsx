"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Upload, Mic, Save, Send, Calendar, Pill, Activity } from "lucide-react"

const recentRecords = [
  {
    id: "1",
    patient: "John Smith",
    date: "March 8, 2024",
    type: "Progress Note",
    diagnosis: "Hypertension - Follow-up",
    status: "completed",
    summary: "Patient's blood pressure improved with medication adjustment. Continue current regimen.",
  },
  {
    id: "2",
    patient: "Sarah Wilson",
    date: "March 10, 2024",
    type: "Initial Consultation",
    diagnosis: "Annual Physical Exam",
    status: "completed",
    summary: "Comprehensive physical examination completed. All systems within normal limits.",
  },
  {
    id: "3",
    patient: "Michael Chen",
    date: "March 5, 2024",
    type: "Consultation Note",
    diagnosis: "Chest Pain - Rule out CAD",
    status: "pending",
    summary: "Patient reports intermittent chest discomfort. EKG ordered, awaiting results.",
  },
]

export function DoctorRecords() {
  const [activeTab, setActiveTab] = useState("create")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [recordType, setRecordType] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const [recordData, setRecordData] = useState({
    chiefComplaint: "",
    historyOfPresentIllness: "",
    physicalExam: "",
    assessment: "",
    plan: "",
    medications: "",
    followUp: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setRecordData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveRecord = () => {
    // Save record logic here
    console.log("Saving record:", recordData)
  }

  if (activeTab === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Create Medical Record</h2>
            <p className="text-muted-foreground">Document patient visit and create comprehensive medical records</p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab("recent")} className="bg-transparent">
            View Recent Records
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Record Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient and Visit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Visit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john-smith">John Smith</SelectItem>
                        <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
                        <SelectItem value="michael-chen">Michael Chen</SelectItem>
                        <SelectItem value="emily-rodriguez">Emily Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Record Type</Label>
                    <Select value={recordType} onValueChange={setRecordType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress-note">Progress Note</SelectItem>
                        <SelectItem value="initial-consultation">Initial Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                        <SelectItem value="procedure-note">Procedure Note</SelectItem>
                        <SelectItem value="discharge-summary">Discharge Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOAP Note */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">SOAP Note</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`gap-2 ${isRecording ? "bg-red-50 text-red-600" : "bg-transparent"}`}
                  >
                    <Mic className="h-4 w-4" />
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Upload Audio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subjective */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Subjective</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chief-complaint">Chief Complaint</Label>
                      <Input
                        id="chief-complaint"
                        placeholder="Patient's primary concern or reason for visit"
                        value={recordData.chiefComplaint}
                        onChange={(e) => handleInputChange("chiefComplaint", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hpi">History of Present Illness</Label>
                      <Textarea
                        id="hpi"
                        placeholder="Detailed description of the patient's current symptoms and their progression"
                        rows={4}
                        value={recordData.historyOfPresentIllness}
                        onChange={(e) => handleInputChange("historyOfPresentIllness", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Objective */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Objective</h3>
                  <div>
                    <Label htmlFor="physical-exam">Physical Examination</Label>
                    <Textarea
                      id="physical-exam"
                      placeholder="Vital signs, physical examination findings, and diagnostic test results"
                      rows={4}
                      value={recordData.physicalExam}
                      onChange={(e) => handleInputChange("physicalExam", e.target.value)}
                    />
                  </div>
                </div>

                {/* Assessment */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Assessment</h3>
                  <div>
                    <Label htmlFor="assessment">Clinical Assessment & Diagnosis</Label>
                    <Textarea
                      id="assessment"
                      placeholder="Clinical impression, differential diagnosis, and assessment of patient's condition"
                      rows={3}
                      value={recordData.assessment}
                      onChange={(e) => handleInputChange("assessment", e.target.value)}
                    />
                  </div>
                </div>

                {/* Plan */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan">Treatment Plan</Label>
                      <Textarea
                        id="plan"
                        placeholder="Treatment recommendations, interventions, and next steps"
                        rows={3}
                        value={recordData.plan}
                        onChange={(e) => handleInputChange("plan", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medications">Medications</Label>
                      <Textarea
                        id="medications"
                        placeholder="Prescribed medications, dosages, and instructions"
                        rows={3}
                        value={recordData.medications}
                        onChange={(e) => handleInputChange("medications", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="follow-up">Follow-up Instructions</Label>
                    <Textarea
                      id="follow-up"
                      placeholder="Follow-up appointments, monitoring instructions, and patient education"
                      rows={2}
                      value={recordData.followUp}
                      onChange={(e) => handleInputChange("followUp", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleSaveRecord} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Send className="h-4 w-4" />
                  Complete & Send
                </Button>
                <Button variant="ghost" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            {/* Patient Summary */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Patient Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">John Smith, 45M</p>
                    <p className="text-muted-foreground">Last visit: March 1, 2024</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Hypertension</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Pill className="h-4 w-4 text-muted-foreground" />
                      <span>2 medications</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Full Chart
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Annual Physical
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Follow-up Visit
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Hypertension Check
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Diabetes Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Recent Medical Records</h2>
          <p className="text-muted-foreground">View and manage patient medical records</p>
        </div>
        <Button onClick={() => setActiveTab("create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Record
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search records by patient name or diagnosis..." className="pl-10" />
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {recentRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{record.patient}</h3>
                      <Badge variant={record.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {record.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.type}</p>
                    <p className="text-sm font-medium mt-1">{record.diagnosis}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {record.date}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{record.summary}</p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <FileText className="h-4 w-4" />
                  View Full Record
                </Button>
                <Button size="sm" variant="ghost" className="gap-2">
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="gap-2">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
