"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Monitor, 
  Palette, 
  Globe, 
  Code, 
  Shield, 
  Star,
  Clock,
  Bot,
  User,
  Send,
  Loader2
} from "lucide-react"

interface Era {
  period: string
  yearRange: string
  confidence: string
}

interface Platform {
  name: string
  type: string
  version: string | null
}

interface Design {
  colorScheme: string
  typography: string
  layoutStyle: string
  designParadigm: string
  notableElements: string[]
}

interface Cultural {
  historicalContext: string
  culturalSignificance: string
  userBehaviorPatterns: string
}

interface Technical {
  resolution: string | null
  browserIndicators: string | null
  technologyStack: string[]
  performanceNotes: string | null
}

interface Authenticity {
  assessment: string
  confidence: string
  reasoning: string
}

interface Significance {
  rating: number
  explanation: string
}

interface AnalysisResult {
  era: Era
  platform: Platform
  design: Design
  cultural: Cultural
  technical: Technical
  authenticity: Authenticity
  significance: Significance
  summary: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AnalysisReportProps {
  analysis: AnalysisResult
  imageUrl: string
}

export default function AnalysisReport({ analysis, imageUrl }: AnalysisReportProps) {
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAuthenticityBadgeVariant = (assessment: string) => {
    switch (assessment) {
      case "original":
        return "default"
      case "recreation":
        return "secondary"
      case "modern":
        return "outline"
      default:
        return "outline"
    }
  }

  // Function to convert markdown-like bold syntax to HTML
  const formatText = (text: string) => {
    // Convert **bold** to <strong>bold</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  // Function to render text with HTML formatting
  const FormattedText = ({ text }: { text: string }) => {
    const formattedText = formatText(text)
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      // Prepare context from the image analysis
      const context = `
Image Analysis Context:
Era: ${analysis.era.period} (${analysis.era.yearRange})
Platform: ${analysis.platform.name} (${analysis.platform.type})
Design: ${analysis.design.colorScheme}, ${analysis.design.typography}, ${analysis.design.layoutStyle}
Cultural Context: ${analysis.cultural.historicalContext}
Technical Details: ${analysis.technical.technologyStack.join(', ')}
Authenticity: ${analysis.authenticity.assessment}
Significance: ${analysis.significance.rating}/10 - ${analysis.significance.explanation}
`.trim()

      // Call the dedicated chat API
      const response = await fetch('/api/chat-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          context: context,
          analysisType: "image"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const result = await response.json()
      
      // Extract the answer from the response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Archaeological Report</h2>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </div>
      </Card>

      {/* Chat with AI Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chat with AI</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ask questions about your image analysis results
        </p>
        
        {showChat && (
          <div className="flex flex-col h-[400px] border rounded-lg">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mb-2" />
                  <p className="text-lg">Ask me anything about your image analysis</p>
                  <p className="text-sm">Get insights, clarification, or deeper analysis</p>
                  <div className="mt-4 text-left bg-background p-4 rounded-lg border max-w-md">
                    <p className="font-semibold mb-2">Try asking:</p>
                    <ul className="text-sm space-y-1">
                      <li>• What era does this image belong to?</li>
                      <li>• Can you explain the design elements?</li>
                      <li>• What cultural significance does this have?</li>
                      <li>• What technology was used to create this?</li>
                    </ul>
                  </div>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' ? (
                          <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold mb-1">
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            <FormattedText text={message.content} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-background border">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">AI Assistant</div>
                        <div className="text-sm flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Thinking...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form 
              onSubmit={handleChatSubmit}
              className="p-4 border-t flex gap-2"
            >
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about your image analysis..."
                className="flex-1 min-h-[60px]"
                disabled={isChatLoading}
              />
              <Button 
                type="submit"
                size="icon"
                disabled={isChatLoading || !chatInput.trim()}
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}
      </Card>

      {/* Era Identification */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold">Era Identification</h3>
              <Badge variant={getConfidenceBadgeVariant(analysis.era.confidence)}>
                {analysis.era.confidence} confidence
              </Badge>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Period:</span>{" "}
                <span className="text-muted-foreground">{analysis.era.period}</span>
              </div>
              <div>
                <span className="font-medium">Time Range:</span>{" "}
                <span className="text-muted-foreground">{analysis.era.yearRange}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Detection */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Platform Detection</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span>{" "}
                <span className="text-muted-foreground">{analysis.platform.name}</span>
              </div>
              <div>
                <span className="font-medium">Type:</span>{" "}
                <span className="text-muted-foreground">{analysis.platform.type}</span>
              </div>
              {analysis.platform.version && (
                <div>
                  <span className="font-medium">Version:</span>{" "}
                  <span className="text-muted-foreground">{analysis.platform.version}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Design Analysis */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Palette className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Design Analysis</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Color Scheme:</span>{" "}
                <span className="text-muted-foreground">{analysis.design.colorScheme}</span>
              </div>
              <div>
                <span className="font-medium">Typography:</span>{" "}
                <span className="text-muted-foreground">{analysis.design.typography}</span>
              </div>
              <div>
                <span className="font-medium">Layout Style:</span>{" "}
                <span className="text-muted-foreground">{analysis.design.layoutStyle}</span>
              </div>
              <div>
                <span className="font-medium">Design Paradigm:</span>{" "}
                <span className="text-muted-foreground">{analysis.design.designParadigm}</span>
              </div>
              <div>
                <span className="font-medium">Notable Elements:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.design.notableElements.map((element, index) => (
                    <Badge key={index} variant="secondary">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cultural Context */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Cultural Context</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium block mb-1">Historical Context:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.cultural.historicalContext}
                </p>
              </div>
              <Separator />
              <div>
                <span className="font-medium block mb-1">Cultural Significance:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.cultural.culturalSignificance}
                </p>
              </div>
              <Separator />
              <div>
                <span className="font-medium block mb-1">User Behavior Patterns:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.cultural.userBehaviorPatterns}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Observations */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Code className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Technical Observations</h3>
            <div className="space-y-3">
              {analysis.technical.resolution && (
                <div>
                  <span className="font-medium">Resolution:</span>{" "}
                  <span className="text-muted-foreground">{analysis.technical.resolution}</span>
                </div>
              )}
              {analysis.technical.browserIndicators && (
                <div>
                  <span className="font-medium">Browser Indicators:</span>{" "}
                  <span className="text-muted-foreground">{analysis.technical.browserIndicators}</span>
                </div>
              )}
              {analysis.technical.technologyStack.length > 0 && (
                <div>
                  <span className="font-medium">Technology Stack:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.technical.technologyStack.map((tech, index) => (
                      <Badge key={index} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.technical.performanceNotes && (
                <div>
                  <span className="font-medium block mb-1">Performance Notes:</span>
                  <p className="text-muted-foreground">{analysis.technical.performanceNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Authenticity Assessment */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold">Authenticity Assessment</h3>
              <Badge variant={getAuthenticityBadgeVariant(analysis.authenticity.assessment)}>
                {analysis.authenticity.assessment}
              </Badge>
              <Badge variant={getConfidenceBadgeVariant(analysis.authenticity.confidence)}>
                {analysis.authenticity.confidence} confidence
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.authenticity.reasoning}
            </p>
          </div>
        </div>
      </Card>

      {/* Historical Significance */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-500/10">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold">Historical Significance</h3>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < analysis.significance.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">
                  {analysis.significance.rating}/10
                </span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.significance.explanation}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}