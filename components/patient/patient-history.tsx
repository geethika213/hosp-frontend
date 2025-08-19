"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Pill,
  Activity,
  AlertTriangle,
} from "lucide-react"

const medicalHistory = [
  {
    id: "1",
    date: "March 8, 2024",
    doctor: "Dr. Emily Rodriguez",
    type: "Annual Physical",
    diagnosis: "Hypertension (Stage 1)",
    summary:
      "Patient presents for annual physical examination. Overall health is good with mild hypertension noted. Blood pressure readings consistently elevated over past 3 months. Recommended lifestyle modifications including diet and exercise. Follow-up in 3 months.",
    medications: ["Lisinopril 10mg daily"],
    vitals: {
      bloodPressure: "142/88",
      heartRate: "78",
      temperature: "98.6°F",
      weight: "165 lbs",
    },
    labResults: ["Complete Blood Count - Normal", "Lipid Panel - Elevated LDL"],
    hasTranscript: true,
    category: "checkup",
  },
  {
    id: "2",
    date: "February 28, 2024",
    doctor: "Dr. Sarah Johnson",
    type: "Sick Visit",
    diagnosis: "Viral Upper Respiratory Infection",
    summary:
      "Patient presents with 3-day history of nasal congestion, sore throat, and mild cough. No fever. Physical exam reveals mild erythema of throat, clear nasal discharge. Diagnosed as viral upper respiratory infection. Recommended supportive care with rest, fluids, and over-the-counter medications.",
    medications: ["Acetaminophen as needed", "Throat lozenges"],
    vitals: {
      bloodPressure: "128/82",
      heartRate: "72",
      temperature: "98.4°F",
      weight: "164 lbs",
    },
    hasTranscript: true,
    category: "illness",
  },
  {
    id: "3",
    date: "January 15, 2024",
    doctor: "Dr. Michael Chen",
    type: "Cardiology Consultation",
    diagnosis: "Palpitations - Benign",
    summary:
      "Patient referred for evaluation of intermittent palpitations. EKG shows normal sinus rhythm. Holter monitor revealed occasional premature ventricular contractions, benign in nature. No structural heart disease detected on echocardiogram. Reassured patient and recommended stress management techniques.",
    medications: [],
    vitals: {
      bloodPressure: "135/85",
      heartRate: "68",
      temperature: "98.6°F",
      weight: "166 lbs",
    },
    labResults: ["EKG - Normal sinus rhythm", "Echocardiogram - Normal"],
    hasTranscript: false,
    category: "specialist",
  },
]

const allergies = ["Penicillin - Rash", "Shellfish - Hives"]
const chronicConditions = ["Hypertension (Stage 1)", "Seasonal Allergies"]
const currentMedications = [
  { name: "Lisinopril", dosage: "10mg daily", prescribedBy: "Dr. Emily Rodriguez", startDate: "March 8, 2024" },
  { name: "Multivitamin", dosage: "1 tablet daily", prescribedBy: "Self-administered", startDate: "January 1, 2024" },
]

export function PatientHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("visits")

  const filteredHistory = medicalHistory.filter((record) => {
    const matchesSearch =
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === "all" || record.category === filterCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medical records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="checkup">Checkups</SelectItem>
            <SelectItem value="illness">Illness</SelectItem>
            <SelectItem value="specialist">Specialist</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Records
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="conditions">Conditions & Allergies</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          {filteredHistory.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">{record.type}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {record.date}
                      </div>
                      <span>{record.doctor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.hasTranscript && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Transcript
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs capitalize">
                      {record.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Diagnosis */}
                <div>
                  <h4 className="font-medium text-sm mb-1">Diagnosis</h4>
                  <p className="text-sm font-semibold text-primary">{record.diagnosis}</p>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-medium text-sm mb-1">Visit Summary</h4>
                  <p className="text-sm text-muted-foreground">{record.summary}</p>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-sm font-medium">{record.vitals.bloodPressure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-sm font-medium">{record.vitals.heartRate} bpm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-sm font-medium">{record.vitals.temperature}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">{record.vitals.weight}</p>
                  </div>
                </div>

                {/* Medications */}
                {record.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Medications Prescribed</h4>
                    <div className="flex flex-wrap gap-2">
                      {record.medications.map((med, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Pill className="h-3 w-3 mr-1" />
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Results */}
                {record.labResults && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Lab Results</h4>
                    <div className="space-y-1">
                      {record.labResults.map((result, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          • {result}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Eye className="h-3 w-3" />
                    View Full Report
                  </Button>
                  {record.hasTranscript && (
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-3 w-3" />
                      View Transcript
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Current Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMedications.map((med, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{med.name}</h4>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    <p className="text-xs text-muted-foreground">
                      Prescribed by {med.prescribedBy} • Started {med.startDate}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Chronic Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chronicConditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{condition}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm">{allergy}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
