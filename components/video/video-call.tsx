"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings } from "lucide-react"

interface VideoCallProps {
  isDoctor?: boolean
  patientName?: string
  doctorName?: string
}

export default function VideoCall({ isDoctor = false, patientName, doctorName }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startCall = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsCallActive(true)
      setCallDuration(0)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      alert("Unable to access camera/microphone. Please check permissions.")
    }
  }

  const endCall = () => {
    // Stop all media tracks
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }

    setIsCallActive(false)
    setCallDuration(0)
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
      }
    }
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
      }
    }
  }

  if (!isCallActive) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Video className="h-5 w-5 text-emerald-600" />
            Video Consultation
          </CardTitle>
          <CardDescription>
            {isDoctor
              ? `Start video call with ${patientName || "patient"}`
              : `Start video call with Dr. ${doctorName || "Doctor"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`border-emerald-200 ${isVideoEnabled ? "bg-emerald-50" : "bg-red-50"}`}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`border-emerald-200 ${isAudioEnabled ? "bg-emerald-50" : "bg-red-50"}`}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            onClick={startCall}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
          >
            <Phone className="mr-2 h-4 w-4" />
            Start Call
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Call Header */}
      <div className="bg-black/80 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{isDoctor ? patientName || "Patient" : `Dr. ${doctorName || "Doctor"}`}</h3>
          <p className="text-sm text-gray-300">{formatDuration(callDuration)}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <video ref={remoteVideoRef} className="w-full h-full object-cover bg-gray-900" autoPlay playsInline />

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-black/80 p-6 flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full border-2 ${
            isVideoEnabled
              ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
              : "border-red-500 bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-full border-2 ${
            isAudioEnabled
              ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
              : "border-red-500 bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button onClick={endCall} className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white">
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
