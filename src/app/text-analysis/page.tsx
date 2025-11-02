"use client";

import ChronosInterface from "@/components/ChronosInterface";
import { Card } from "@/components/ui/card";
import { Sparkles, Clock, Globe, Zap, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TextAnalysisPage() {

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Text Analysis</h1>
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
            <Clock className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Project Chronos
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The AI Archaeologist
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reconstruct fragmented historical web content using Google Gemini AI and contextual web searches. 
            Piece together digital artifacts from early internet to modern times.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h3 className="font-semibold">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Google Gemini reconstructs and expands fragmented text
                </p>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Globe className="w-8 h-8 text-primary" />
                <h3 className="font-semibold">Contextual Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Searches Wikipedia, Know Your Meme, and more
                </p>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Zap className="w-8 h-8 text-primary" />
                <h3 className="font-semibold">Era Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Identifies time period and community context
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Interface */}
        <ChronosInterface />

        {/* Disclaimer Section */}
        <Card className="p-4 border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <span className="text-yellow-500 font-bold text-sm">DISCLAIMER:</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Processing complex text fragments may take additional time. Please be patient while the AI analyzes your text, 
              reconstructs the content, and generates a comprehensive report. The process typically takes 20-40 seconds for 
              longer or more complex fragments.
            </p>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2">1. Input</div>
              <p className="text-sm text-muted-foreground">
                Enter fragmented text from old forums, chat rooms, or social media
              </p>
            </Card>
            
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2">2. Reconstruct</div>
              <p className="text-sm text-muted-foreground">
                AI expands abbreviations and completes phrases with confidence scores
              </p>
            </Card>
            
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2">3. Search</div>
              <p className="text-sm text-muted-foreground">
                Finds authoritative sources to provide cultural context
              </p>
            </Card>
            
            <Card className="p-4 border border-muted bg-background/80 backdrop-blur-sm">
              <div className="font-bold text-primary mb-2">4. Report</div>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive reconstruction report with sources
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}