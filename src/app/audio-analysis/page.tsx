"use client";

import AudioFragmentCleaner from "@/components/AudioFragmentCleaner";
import { Card } from "@/components/ui/card";
import { Waves, Sparkles, Search, Mic, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AudioAnalysisPage() {
  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Waves className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Audio Fragment Cleaner</h1>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3">
            <Mic className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Audio Fragment Cleaner
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Transform poor quality audio into clean, accurate transcriptions
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reconstruct fragmented audio content using Google Gemini AI. 
            Handle background noise, fast speech, accents, and damaged recordings with ease.
          </p>

          {/* Features Grid - Top 3 */}
          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Mic className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">AI Transcription</h3>
                <p className="text-sm text-muted-foreground">
                  Handles background noise, unclear speech, accents, and low-quality recordings
                </p>
              </div>
            </Card>
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Text Reconstruction</h3>
                <p className="text-sm text-muted-foreground">
                  Expands slang, corrects grammar, and provides full context for unclear references
                </p>
              </div>
            </Card>
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Globe className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Contextual Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Finds relevant web sources and references based on topics and entities mentioned
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Audio Fragment Cleaner Component - Centered with good spacing */}
        <div className="max-w-4xl mx-auto my-16">
          <AudioFragmentCleaner />
        </div>

        {/* Disclaimer Section */}
        <Card className="p-4 border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <span className="text-yellow-500 font-bold text-sm">DISCLAIMER:</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Processing larger audio files may take additional time. Please be patient while the AI analyzes your audio, 
              transcribes the content, and generates a comprehensive report. The process typically takes 30-60 seconds for 
              longer recordings.
            </p>
          </div>
        </Card>

        {/* Use Cases - Bottom 3 with good spacing */}
        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Old Voice Memos
              </div>
              <p className="text-sm text-muted-foreground">
                Recordings from 2008 with traffic noise, wind, and unclear speech
              </p>
            </Card>
            
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Fast/Unclear Speech
              </div>
              <p className="text-sm text-muted-foreground">
                Rapid speaking, heavy accents, mumbling, or speech impediments
              </p>
            </Card>
            
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Damaged Recordings
              </div>
              <p className="text-sm text-muted-foreground">
                Corrupted files, cassette artifacts, low bitrate audio
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}