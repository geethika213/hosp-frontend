"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"

const conversations = [
  {
    id: "1",
    date: "March 8, 2024",
    doctor: "Dr. Emily Rodriguez",
    duration: "28 minutes",
    type: "Annual Physical",
    hasAudio: true,
    hasTranscript: true,
    summary:
      "Discussed overall health status, blood pressure concerns, and lifestyle modifications. Patient expressed interest in dietary changes and exercise routine.",
    keyTopics: ["Blood Pressure", "Diet", "Exercise", "Medication"],
    transcript: [
      {
        speaker: "doctor",
        time: "00:00",
        text: "Good morning! How are you feeling today?",
      },
      {
        speaker: "patient",
        time: "00:03",
        text: "Good morning, Dr. Rodriguez. I'm doing well, thank you. I've been monitoring my blood pressure as you suggested.",
      },
      {
        speaker: "doctor",
        time: "00:12",
        text: "That's excellent. What readings have you been getting at home?",
      },
      {
        speaker: "patient",
        time: "00:18",
        text: "They've been ranging from about 135 over 85 to 142 over 88, mostly in the mornings.",
      },
      {
        speaker: "doctor",
        time: "00:28",
        text: "Those readings confirm what we saw in your previous visits. Let's discuss some lifestyle modifications that can help bring those numbers down.",
      },
    ],
  },
  {
    id: "2",
    date: "February 28, 2024",
    doctor: "Dr. Sarah Johnson",
    duration: "15 minutes",
    type: "Sick Visit",
    hasAudio: false,
    hasTranscript: true,
    summary:
      "Patient presented with cold symptoms. Discussed symptom management and when to seek further care if symptoms worsen.",
    keyTopics: ["Cold Symptoms", "Symptom Management", "Recovery Timeline"],
    transcript: [
      {
        speaker: "doctor",
        time: "00:00",
        text: "I see you're here today because you're not feeling well. Can you tell me about your symptoms?",
      },
      {
        speaker: "patient",
        time: "00:05",
        text: "I've had a stuffy nose and sore throat for about three days now. Also a mild cough, but no fever.",
      },
      {
        speaker: "doctor",
        time: "00:15",
        text: "Any body aches or fatigue?",
      },
      {
        speaker: "patient",
        time: "00:18",
        text: "A little tired, but nothing too severe. I've been able to work from home.",
      },
    ],
  },
]

export function PatientConversations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              {selectedConv.doctor} • {selectedConv.date}
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
                  {selectedConv.transcript.map((message, index) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.speaker === "doctor" ? (
                            <Stethoscope className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium capitalize">{message.speaker}</span>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations by doctor, type, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.map((conversation) => (
          <Card key={conversation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{conversation.type}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {conversation.date}
                    </div>
                    <span>{conversation.doctor}</span>
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
                      className="gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      View Transcript
                    </Button>
                  )}
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
      </div>
    </div>
  )
}
