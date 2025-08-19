"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Square, Play, Pause, Save, Trash2, Download } from "lucide-react"

interface Recording {
  id: string
  patientName: string
  date: string
  duration: string
  transcript: string
  audioUrl?: string
  status: "recording" | "completed" | "transcribing"
}

export function ConversationRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [patientName, setPatientName] = useState("")
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: "1",
      patientName: "John Smith",
      date: "2024-01-15",
      duration: "15:30",
      transcript: "Patient reports chest pain for the past 2 days. Pain is sharp, located in the center of chest...",
      status: "completed",
    },
    {
      id: "2",
      patientName: "Sarah Johnson",
      date: "2024-01-14",
      duration: "22:15",
      transcript: "Follow-up visit for hypertension. Patient reports taking medication as prescribed...",
      status: "completed",
    },
  ])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        // Handle audio data
        console.log("[v0] Audio data available:", event.data.size)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setCurrentTranscript("")
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    setIsRecording(false)
    setIsPaused(false)
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const saveRecording = () => {
    if (!patientName.trim()) {
      alert("Please enter patient name")
      return
    }

    const newRecording: Recording = {
      id: Date.now().toString(),
      patientName: patientName.trim(),
      date: new Date().toISOString().split("T")[0],
      duration: formatTime(recordingTime),
      transcript: currentTranscript,
      status: "completed",
    }

    setRecordings((prev) => [newRecording, ...prev])
    setPatientName("")
    setCurrentTranscript("")
    setRecordingTime(0)
    stopRecording()
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Conversation Recorder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name">Patient Name</Label>
              <Input
                id="patient-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                disabled={isRecording}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-mono font-bold text-emerald-600">{formatTime(recordingTime)}</div>
              {isRecording && (
                <Badge variant={isPaused ? "secondary" : "default"} className="animate-pulse">
                  {isPaused ? "Paused" : "Recording"}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="bg-emerald-600 hover:bg-emerald-700">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button onClick={pauseRecording} variant="outline">
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Button onClick={saveRecording} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>

          {/* Live Transcript */}
          {isRecording && (
            <div>
              <Label htmlFor="live-transcript">Live Transcript</Label>
              <Textarea
                id="live-transcript"
                value={currentTranscript}
                onChange={(e) => setCurrentTranscript(e.target.value)}
                placeholder="Transcript will appear here as you speak..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You can edit the transcript in real-time as the conversation progresses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording History */}
      <Card>
        <CardHeader>
          <CardTitle>Recording History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div key={recording.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{recording.patientName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {recording.date} • {recording.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={recording.status === "completed" ? "default" : "secondary"}>
                      {recording.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteRecording(recording.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Transcript Preview</Label>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recording.transcript}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
