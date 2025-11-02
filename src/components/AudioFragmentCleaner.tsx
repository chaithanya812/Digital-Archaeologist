"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileAudio, Loader2, CheckCircle2, AlertCircle, ExternalLink, Send, Bot, User, Play } from 'lucide-react';

interface TranscriptionResult {
  transcription: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface ReconstructionResult {
  reconstructedText: string;
  keyTopics: string[];
  entities: string[];
  contextNotes: string;
  communicationStyle: string;
  sentimentAnalysis: string;
  actionItems: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ProcessingStage = 'idle' | 'uploading' | 'transcribing' | 'reconstructing' | 'searching' | 'complete' | 'error';

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

export default function AudioFragmentCleaner() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [reconstruction, setReconstruction] = useState<ReconstructionResult | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStage('idle');
      setError(null);
      setProgress(0);
      setTranscription(null);
      setReconstruction(null);
      setSources([]);
      setChatMessages([]);
      setShowChat(false);
    }
  };

  const processAudio = async () => {
    if (!file) return;

    try {
      setError(null);
      
      // Stage 1: Upload and Transcribe
      setStage('transcribing');
      setProgress(10);
      
      const formData = new FormData();
      formData.append('audio', file);
      
      const transcribeResponse = await fetch('/api/audio-transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Transcription failed');
      }
      
      const transcriptionData = await transcribeResponse.json();
      setTranscription(transcriptionData);
      setProgress(33);
      
      // Stage 2: Reconstruct Text
      setStage('reconstructing');
      
      const reconstructResponse = await fetch('/api/audio-reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: transcriptionData.transcription }),
      });
      
      if (!reconstructResponse.ok) {
        const errorData = await reconstructResponse.json();
        throw new Error(errorData.error || 'Reconstruction failed');
      }
      
      const reconstructionData = await reconstructResponse.json();
      setReconstruction(reconstructionData);
      setProgress(66);
      
      // Stage 3: Search for Context
      setStage('searching');
      
      const searchResponse = await fetch('/api/audio-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: reconstructionData.keyTopics,
          entities: reconstructionData.entities,
        }),
      });
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || 'Context search failed');
      }
      
      const searchData = await searchResponse.json();
      setSources(searchData.sources);
      setProgress(100);
      
      setStage('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStage('error');
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
      // Prepare context from the audio analysis
      const context = `
Audio Analysis Context:
Original Transcription: ${transcription?.transcription || 'Not available'}
Reconstructed Text: ${reconstruction?.reconstructedText || 'Not available'}
Key Topics: ${reconstruction?.keyTopics?.join(', ') || 'Not available'}
Important Entities: ${reconstruction?.entities?.join(', ') || 'Not available'}
Context Notes: ${reconstruction?.contextNotes || 'Not available'}
Communication Style: ${reconstruction?.communicationStyle || 'Not available'}
Sentiment Analysis: ${reconstruction?.sentimentAnalysis || 'Not available'}
Action Items: ${reconstruction?.actionItems || 'Not available'}
`.trim();

      // Call the dedicated chat API
      const response = await fetch('/api/chat-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          context: context
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

  const getStageMessage = () => {
    switch (stage) {
      case 'transcribing':
        return 'Transcribing audio with Gemini AI...';
      case 'reconstructing':
        return 'Reconstructing text and expanding context...';
      case 'searching':
        return 'Finding relevant sources and references...';
      case 'complete':
        return 'Processing complete!';
      default:
        return '';
    }
  };

  // Example audio files from the public folder
  const exampleAudios = [
    { name: "WhatsApp Audio 1", path: "/WhatsApp Audio 2025-10-17 at 12.26.09_5ad56a10.mp3" },
    { name: "WhatsApp Audio 2", path: "/WhatsApp Audio 2025-10-17 at 12.26.09_b7985c5b.mp3" },
    { name: "WhatsApp Audio 3", path: "/WhatsApp Audio 2025-10-17 at 15.59.22_a8f62f42.mp3" },
  ];

  const handleExampleAudioSelect = async (audioPath: string, audioName: string) => {
    try {
      // Fetch the audio and convert it to a File object
      const response = await fetch(audioPath);
      const blob = await response.blob();
      const file = new File([blob], audioName, { type: blob.type });
      setFile(file);
      setStage('idle');
      setError(null);
      setProgress(0);
      setTranscription(null);
      setReconstruction(null);
      setSources([]);
      setChatMessages([]);
      setShowChat(false);
    } catch (error) {
      console.error('Failed to load example audio:', error);
      // Fallback to just setting the file state with a placeholder
      setFile(new File([], audioName));
      setStage('idle');
      setError(null);
      setProgress(0);
      setTranscription(null);
      setReconstruction(null);
      setSources([]);
      setChatMessages([]);
      setShowChat(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Upload Section - Match text analysis style exactly */}
      <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="space-y-4">
          <div>
            <label htmlFor="audio-input" className="block text-lg font-semibold mb-2">
              Upload Audio Fragment
            </label>
            <CardDescription className="mb-4">
              Support for poor quality audio: background noise, fast speech, multiple speakers, damaged recordings
            </CardDescription>
            
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'error'}
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? 'Change Audio File' : 'Select Audio File'}
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileAudio className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Example Audio Files */}
          {!file && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-center">Or try with example audio files:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {exampleAudios.map((audio, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleExampleAudioSelect(audio.path, audio.name)}
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-xs truncate">{audio.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {file && stage === 'idle' && (
            <Button 
              onClick={processAudio} 
              className="w-full"
              size="lg"
            >
              Process Audio Fragment
            </Button>
          )}

          {stage !== 'idle' && stage !== 'complete' && stage !== 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">{getStageMessage()}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {stage === 'complete' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Audio processed successfully. View results below.
              </AlertDescription>
            </Alert>
          )}

          {stage === 'error' && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Chat with AI Section - Appears after processing is complete */}
      {stage === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Chat with AI</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </CardTitle>
            <CardDescription>
              Ask questions about your audio analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showChat && (
              <div className="flex flex-col h-[400px] border rounded-lg">
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50"
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-12 w-12 mb-2" />
                      <p className="text-lg">Ask me anything about your audio analysis</p>
                      <p className="text-sm">Get insights, clarification, or deeper analysis</p>
                      <div className="mt-4 text-left bg-background p-4 rounded-lg border max-w-md">
                        <p className="font-semibold mb-2">Try asking:</p>
                        <ul className="text-sm space-y-1">
                          <li>• What was the main topic of this recording?</li>
                          <li>• Can you explain the sentiment analysis?</li>
                          <li>• What are the key action items mentioned?</li>
                          <li>• What does this specific term mean in context?</li>
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
                    placeholder="Ask a question about your audio analysis..."
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
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {stage === 'complete' && transcription && reconstruction && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              Original transcription, reconstructed text, and contextual sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="reconstructed">Reconstructed</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Raw Transcription</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{transcription.transcription}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">File: {transcription.fileName}</Badge>
                  <Badge variant="outline">
                    Size: {(transcription.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                  <Badge variant="outline">Type: {transcription.mimeType}</Badge>
                </div>
              </TabsContent>

              <TabsContent value="reconstructed" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Reconstructed & Expanded Text</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      <FormattedText text={reconstruction.reconstructedText} />
                    </div>
                  </div>
                </div>
                {reconstruction.contextNotes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Context Notes</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">
                        <FormattedText text={reconstruction.contextNotes} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Key Themes</h3>
                  <div className="space-y-2">
                    {reconstruction.keyTopics.map((theme, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <FormattedText text={theme} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Important Entities</h3>
                  <div className="space-y-2">
                    {reconstruction.entities.map((entity, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <FormattedText text={entity} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {reconstruction.communicationStyle && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Communication Style</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">
                        <FormattedText text={reconstruction.communicationStyle} />
                      </div>
                    </div>
                  </div>
                )}
                
                {reconstruction.sentimentAnalysis && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Sentiment Analysis</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">
                        <FormattedText text={reconstruction.sentimentAnalysis} />
                      </div>
                    </div>
                  </div>
                )}
                
                {reconstruction.contextNotes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Contextual Insights</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">
                        <FormattedText text={reconstruction.contextNotes} />
                      </div>
                    </div>
                  </div>
                )}
                
                {reconstruction.actionItems && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Action Items</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">
                        <FormattedText text={reconstruction.actionItems} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sources" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Contextual References</h3>
                  {sources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sources found</p>
                  ) : (
                    <div className="space-y-3">
                      {sources.map((source, i) => (
                        <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium">
                              <FormattedText text={source.title} />
                            </h4>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-xs"
                            >
                              Visit
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            <FormattedText text={source.snippet} />
                          </p>
                          <p className="text-xs text-muted-foreground">{source.url}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}