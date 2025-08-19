"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MessageSquare,
  Search,
  Play,
  Pause,
  Download,
  Eye,
  Clock,
  User,
  Stethoscope,
  Volume2,
  FileText,
  Mic,
  Upload,
} from "lucide-react"

const conversations = [
  {
    id: "1",
    patient: "John Smith",
    date: "March 8, 2024",
    duration: "28 minutes",
    type: "Follow-up Visit",
    hasAudio: true,
    hasTranscript: true,
    summary:
      "Discussed blood pressure management and medication adherence. Patient reports improved readings with current regimen.",
    keyTopics: ["Blood Pressure", "Medication Adherence", "Lifestyle Changes"],
    status: "completed",
  },
  {
    id: "2",
    patient: "Sarah Wilson",
    date: "March 10, 2024",
    duration: "45 minutes",
    type: "Annual Physical",
    hasAudio: true,
    hasTranscript: true,
    summary: "Comprehensive physical examination completed. Discussed preventive care measures and health maintenance.",
    keyTopics: ["Physical Exam", "Preventive Care", "Health Screening"],
    status: "completed",
  },
  {
    id: "3",
    patient: "Michael Chen",
    date: "March 5, 2024",
    duration: "22 minutes",
    type: "Consultation",
    hasAudio: false,
    hasTranscript: true,
    summary: "Patient consultation regarding chest pain symptoms. Ordered diagnostic tests for further evaluation.",
    keyTopics: ["Chest Pain", "Diagnostic Testing", "Cardiac Evaluation"],
    status: "pending-review",
  },
]

export function DoctorConversations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.keyTopics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  if (activeTab === "transcript" && selectedConv) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setActiveTab("list")}>
            ← Back to Conversations
          </Button>
          <div>
            <h2 className="font-serif text-xl font-semibold">{selectedConv.type}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedConv.patient} • {selectedConv.date}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Conversation Transcript</CardTitle>
                {selectedConv.hasAudio && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? "Pause" : "Play"} Audio
                    </Button>
                    <span className="text-sm text-muted-foreground">Duration: {selectedConv.duration}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Mock transcript content */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        <Stethoscope className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Doctor</span>
                        <span className="text-xs text-muted-foreground">00:00</span>
                      </div>
                      <p className="text-sm">Good morning, {selectedConv.patient}. How are you feeling today?</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Patient</span>
                        <span className="text-xs text-muted-foreground">00:03</span>
                      </div>
                      <p className="text-sm">
                        Good morning, Doctor. I'm doing much better since our last visit. My blood pressure readings
                        have been more stable.
                      </p>
                    </div>
                  </div>
                  {/* More transcript entries would go here */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Visit Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedConv.summary}</p>

                <div>
                  <h4 className="font-medium text-sm mb-2">Key Topics Discussed</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConv.keyTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    Generate SOAP Note
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download Transcript
                  </Button>
                  {selectedConv.hasAudio && (
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Volume2 className="h-4 w-4" />
                      Download Audio
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">Manage conversation recordings and transcripts from patient visits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Upload Audio
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations by patient, type, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Conversations ({filteredConversations.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{conversation.patient}</h3>
                      <Badge
                        variant={conversation.status === "completed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{conversation.type}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {conversation.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {conversation.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.hasAudio && (
                      <Badge variant="outline" className="text-xs">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Audio
                      </Badge>
                    )}
                    {conversation.hasTranscript && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Transcript
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{conversation.summary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {conversation.keyTopics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {conversation.keyTopics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{conversation.keyTopics.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {conversation.hasTranscript && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConversation(conversation.id)
                          setActiveTab("transcript")
                        }}
                        className="gap-2 bg-transparent"
                      >
                        <Eye className="h-3 w-3" />
                        View Transcript
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FileText className="h-3 w-3" />
                      Generate Note
                    </Button>
                    {conversation.hasAudio && (
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Play className="h-3 w-3" />
                        Play Audio
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {filteredConversations
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((conversation) => (
              <Card key={conversation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{conversation.patient}</h3>
                      <p className="text-sm text-muted-foreground">
                        {conversation.type} • {conversation.date}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedConversation(conversation.id)
                        setActiveTab("transcript")
                      }}
                      className="gap-2 bg-transparent"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredConversations
            .filter((c) => c.status === "pending-review")
            .map((conversation) => (
              <Card key={conversation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{conversation.patient}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Needs Review
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {conversation.type} • {conversation.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Review & Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
