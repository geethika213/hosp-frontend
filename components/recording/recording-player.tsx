"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

interface RecordingPlayerProps {
  recordingId: string
  patientName: string
  date: string
  duration: string
  transcript: string
  audioUrl?: string
}

export function RecordingPlayer({
  recordingId,
  patientName,
  date,
  duration,
  transcript,
  audioUrl,
}: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{patientName}</h3>
            <p className="text-sm text-muted-foreground">
              {date} • {duration}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Controls */}
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" onClick={skipBackward}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={skipForward}>
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Slider value={[currentTime]} max={100} step={1} className="w-full" />
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-20" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {duration}
        </div>

        {/* Transcript */}
        <div>
          <h4 className="font-medium mb-2">Transcript</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="text-sm leading-relaxed">{transcript}</p>
          </div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}
