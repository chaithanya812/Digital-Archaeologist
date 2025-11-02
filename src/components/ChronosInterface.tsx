"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle, Bot, User, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReconstructionReport from "./ReconstructionReport";

interface ReconstructionData {
  mostLikely: string;
  confidence: number;
  alternatives: Array<{ text: string; confidence: number }>;
  era: string;
  community: string;
  keyTerms: Array<{ original: string; expanded: string; meaning: string }>;
  reasoning: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  credibility: number;
  relevanceReason: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChronosInterface() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reconstructionData, setReconstructionData] = useState<ReconstructionData | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [originalText, setOriginalText] = useState("");
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const exampleFragments = [
    "lol ur so lame. asl?",
    "omg just posted a thirst trap on insta",
    "noob got pwned. git gud lmao",
    "smh at the top 8 drama. ppl need to chill. g2g, ttyl",
    "idk tbh ngl this is fire fr fr",
    "bump! does anyone know about this?",
  ];

  const handleReconstruct = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to reconstruct");
      return;
    }

    setLoading(true);
    setError("");
    setReconstructionData(null);
    setSources([]);
    setOriginalText(inputText);
    setChatMessages([]);
    setShowChat(false);

    const startTime = performance.now();

    try {
      // Step 1: Reconstruct text with Gemini
      const reconstructResponse = await fetch("/api/text-reconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!reconstructResponse.ok) {
        const errorData = await reconstructResponse.json();
        throw new Error(errorData.error || "Failed to reconstruct text");
      }

      const reconstructResult = await reconstructResponse.json();
      setReconstructionData(reconstructResult.data);

      // Step 2: Search for contextual sources
      // Search for the reconstructed text
      const searchResponse = await fetch("/api/text-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: reconstructResult.data.mostLikely,
          searchType: "main"
        }),
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        setSources(searchResult.sources || []);
      }

      const endTime = performance.now();
      setProcessingTime((endTime - startTime) / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Reconstruction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Prepare context from the text analysis
      const context = `
Text Analysis Context:
Original Text: ${originalText || 'Not available'}
Reconstructed Text: ${reconstructionData?.mostLikely || 'Not available'}
Confidence: ${reconstructionData?.confidence || 'Not available'}%
Era: ${reconstructionData?.era || 'Not available'}
Community: ${reconstructionData?.community || 'Not available'}
Key Terms: ${reconstructionData?.keyTerms?.map(term => `${term.original} → ${term.expanded}`).join(', ') || 'Not available'}
Reasoning: ${reconstructionData?.reasoning || 'Not available'}
`.trim();

      // Call the dedicated chat API
      const response = await fetch('/api/chat-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          context: context,
          analysisType: "text"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const result = await response.json();
      
      // Extract the answer from the response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const loadExample = (example: string) => {
    setInputText(example);
    setReconstructionData(null);
    setSources([]);
    setError("");
    setChatMessages([]);
    setShowChat(false);
  };

  // Function to convert markdown-like bold syntax to HTML
  const formatText = (text: string) => {
    // Convert **bold** to <strong>bold</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Function to render text with HTML formatting
  const FormattedText = ({ text }: { text: string }) => {
    const formattedText = formatText(text);
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="w-full space-y-8">
      {/* Input Section */}
      <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="space-y-4">
          <div>
            <label htmlFor="fragment-input" className="block text-lg font-semibold mb-2">
              Enter Fragmented Text
            </label>
            <Textarea
              id="fragment-input"
              placeholder="Type or paste fragmented internet text here... (e.g., 'omg ur so lame asl?')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] text-base font-mono"
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <p className="text-sm text-muted-foreground w-full mb-1">Quick examples:</p>
            {exampleFragments.map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => loadExample(example)}
                disabled={loading}
                className="text-xs"
              >
                {example}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleReconstruct}
            disabled={loading || !inputText.trim()}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reconstructing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Reconstruct Text
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chat with AI Section - Appears after processing is complete */}
      {reconstructionData && (
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
            Ask questions about your text analysis results
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
                    <p className="text-lg">Ask me anything about your text analysis</p>
                    <p className="text-sm">Get insights, clarification, or deeper analysis</p>
                    <div className="mt-4 text-left bg-background p-4 rounded-lg border max-w-md">
                      <p className="font-semibold mb-2">Try asking:</p>
                      <ul className="text-sm space-y-1">
                        <li>• What era does this text belong to?</li>
                        <li>• Can you explain the key terms used?</li>
                        <li>• What community or platform is this from?</li>
                        <li>• Why did you choose this reconstruction?</li>
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
                  placeholder="Ask a question about your text analysis..."
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
      )}

      {/* Results Display */}
      {reconstructionData && (
        <ReconstructionReport
          originalText={originalText}
          reconstructionData={reconstructionData}
          sources={sources}
          processingTime={processingTime}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Analyzing fragment...</p>
            <p className="text-sm text-muted-foreground">
              AI is reconstructing the text and searching for contextual sources
            </p>
          </div>
        </div>
      )}
    </div>
  );
}