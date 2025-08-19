"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  AlertTriangle,
  Activity,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const patients = [
  {
    id: "1",
    name: "John Smith",
    age: 45,
    gender: "Male",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    lastVisit: "March 8, 2024",
    nextAppointment: "March 22, 2024",
    condition: "Hypertension",
    status: "stable",
    riskLevel: "medium",
    medications: 2,
    allergies: ["Penicillin"],
    insurance: "Blue Cross Blue Shield",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    age: 32,
    gender: "Female",
    phone: "(555) 234-5678",
    email: "sarah.wilson@email.com",
    lastVisit: "March 10, 2024",
    nextAppointment: "April 10, 2024",
    condition: "Annual Physical",
    status: "healthy",
    riskLevel: "low",
    medications: 0,
    allergies: [],
    insurance: "Aetna",
  },
  {
    id: "3",
    name: "Michael Chen",
    age: 38,
    gender: "Male",
    phone: "(555) 345-6789",
    email: "michael.chen@email.com",
    lastVisit: "March 5, 2024",
    nextAppointment: "March 15, 2024",
    condition: "Chest Pain Evaluation",
    status: "monitoring",
    riskLevel: "high",
    medications: 1,
    allergies: ["Shellfish"],
    insurance: "United Healthcare",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    age: 28,
    gender: "Female",
    phone: "(555) 456-7890",
    email: "emily.rodriguez@email.com",
    lastVisit: "March 1, 2024",
    nextAppointment: "March 29, 2024",
    condition: "Depression",
    status: "improving",
    riskLevel: "medium",
    medications: 1,
    allergies: [],
    insurance: "Kaiser Permanente",
  },
  {
    id: "5",
    name: "Robert Davis",
    age: 52,
    gender: "Male",
    phone: "(555) 567-8901",
    email: "robert.davis@email.com",
    lastVisit: "February 28, 2024",
    nextAppointment: "March 16, 2024",
    condition: "Diabetes Type 2",
    status: "monitoring",
    riskLevel: "high",
    medications: 3,
    allergies: ["Sulfa"],
    insurance: "Medicare",
  },
]

export function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || patient.status === filterStatus
    const matchesRisk = filterRisk === "all" || patient.riskLevel === filterRisk

    return matchesSearch && matchesStatus && matchesRisk
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "default"
      case "healthy":
        return "outline"
      case "monitoring":
        return "secondary"
      case "improving":
        return "default"
      default:
        return "outline"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "high":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const PatientCard = ({ patient }: { patient: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {patient.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{patient.name}</h3>
                <Badge variant={getStatusColor(patient.status)} className="text-xs">
                  {patient.status}
                </Badge>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                  {patient.riskLevel} risk
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {patient.age} years old • {patient.gender}
              </p>
              <p className="text-sm font-medium mt-1">{patient.condition}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Full Chart</DropdownMenuItem>
              <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
              <DropdownMenuItem>Send Message</DropdownMenuItem>
              <DropdownMenuItem>Edit Information</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Last visit: {patient.lastVisit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Next: {patient.nextAppointment}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span>{patient.medications} medications</span>
          </div>
          {patient.allergies.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{patient.allergies.length} allergies</span>
            </div>
          )}
          <span className="text-muted-foreground">{patient.insurance}</span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            View Chart
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="improving">Improving</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{patients.filter((p) => p.riskLevel === "high").length}</p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {patients.filter((p) => p.status === "monitoring").length}
              </p>
              <p className="text-sm text-muted-foreground">Monitoring</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {patients.filter((p) => p.status === "stable" || p.status === "healthy").length}
              </p>
              <p className="text-sm text-muted-foreground">Stable/Healthy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Patients ({filteredPatients.length})</TabsTrigger>
          <TabsTrigger value="high-risk">
            High Risk ({patients.filter((p) => p.riskLevel === "high").length})
          </TabsTrigger>
          <TabsTrigger value="recent">Recent Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-4">
          {patients
            .filter((p) => p.riskLevel === "high")
            .map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {patients
            .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
            .slice(0, 10)
            .map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
