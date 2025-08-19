"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
}

interface AIBookingChatProps {
  bookingData: any
  onComplete: () => void
  onBack: () => void
  onUpdateBooking: (data: any) => void
}

const aiResponses = [
  "I understand you're experiencing {symptoms}. Can you tell me when these symptoms started?",
  "Based on your symptoms, I'd recommend seeing a specialist. Have you had any similar issues before?",
  "I see this is marked as {urgency} priority. Are there any specific times that work better for you?",
  "Perfect! I've found several doctors who specialize in treating these symptoms. Let me show you the best matches.",
]

export function AIBookingChat({ bookingData, onComplete, onBack, onUpdateBooking }: AIBookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initial AI greeting
    const initialMessage: Message = {
      id: "1",
      type: "ai",
      content: `Hello! I'm your AI healthcare assistant. I see you're looking to book an appointment for ${bookingData.symptoms.join(", ").toLowerCase()}. Let me ask you a few questions to find the perfect doctor for you.`,
      timestamp: new Date(),
    }
    setMessages([initialMessage])

    // First follow-up question
    setTimeout(() => {
      addAIMessage(aiResponses[0].replace("{symptoms}", bookingData.symptoms.join(", ").toLowerCase()))
    }, 1500)
  }, [])

  const addAIMessage = (content: string) => {
    setIsTyping(true)
    setTimeout(
      () => {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, newMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    ) // Simulate typing delay
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")

    // Simulate AI response based on conversation flow
    setTimeout(() => {
      if (currentStep < aiResponses.length - 1) {
        const nextStep = currentStep + 1
        setCurrentStep(nextStep)
        let response = aiResponses[nextStep]

        if (response.includes("{urgency}")) {
          response = response.replace("{urgency}", bookingData.urgency)
        }
        if (response.includes("{symptoms}")) {
          response = response.replace("{symptoms}", bookingData.symptoms.join(", ").toLowerCase())
        }

        addAIMessage(response)
      } else {
        // Final message before moving to recommendations
        addAIMessage("Great! I have all the information I need. Let me find the best doctors for you.")
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-serif">AI Healthcare Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">Finding the perfect doctor for you</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-background border border-border"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.type === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-background border border-border p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your response..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping || !currentMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
