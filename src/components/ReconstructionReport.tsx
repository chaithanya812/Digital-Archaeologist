"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Sparkles, TrendingUp, Users, BookOpen, ExternalLink } from "lucide-react";

interface KeyTerm {
  original: string;
  expanded: string;
  meaning: string;
}

interface Alternative {
  text: string;
  confidence: number;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  credibility: number;
  relevanceReason: string;
}

interface ReconstructionData {
  mostLikely: string;
  confidence: number;
  alternatives: Alternative[];
  era: string;
  community: string;
  keyTerms: KeyTerm[];
  reasoning: string;
}

interface ReportProps {
  originalText: string;
  reconstructionData: ReconstructionData;
  sources: Source[];
  processingTime: number;
}

export default function ReconstructionReport({
  originalText,
  reconstructionData,
  sources,
  processingTime,
}: ReportProps) {
  const getStars = (count: number) => "⭐".repeat(count);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="border-4 border-primary/20 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">Reconstruction Report</h2>
        </div>
        <p className="text-muted-foreground">Digital Archaeological Analysis Complete</p>
      </div>

      {/* Original Fragment */}
      <Card className="p-6 border-2 border-muted">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">📋 Original Fragment</h3>
            <Separator className="mb-4" />
            <p className="text-lg font-mono bg-muted/50 p-4 rounded-lg border border-border">
              &ldquo;{originalText}&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* AI Reconstruction */}
      <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">✨ AI-Reconstructed Text</h3>
              <Badge variant="default" className="text-sm">
                {reconstructionData.confidence}% Confidence
              </Badge>
            </div>
            <Separator className="mb-4" />
            <p className="text-lg leading-relaxed bg-background p-4 rounded-lg border border-primary/20">
              &ldquo;{reconstructionData.mostLikely}&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis */}
      <Card className="p-6 border-2 border-muted">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">🎯 Analysis</h3>
            <Separator className="mb-4" />
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Era</p>
                  <p className="font-semibold text-lg">{reconstructionData.era}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Community</p>
                  <p className="font-semibold text-lg">{reconstructionData.community}</p>
                </div>
              </div>

              {reconstructionData.keyTerms && reconstructionData.keyTerms.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Key Terms Expanded:</p>
                  <div className="space-y-2">
                    {reconstructionData.keyTerms.map((term, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-background p-3 rounded-lg border border-border">
                        <span className="font-mono font-bold text-primary">{term.original}</span>
                        <span className="text-muted-foreground">→</span>
                        <div>
                          <span className="font-semibold">{term.expanded}</span>
                          <p className="text-sm text-muted-foreground">{term.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <p className="font-semibold mb-2">Reasoning:</p>
                <p className="text-sm leading-relaxed">{reconstructionData.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Alternative Interpretations */}
      {reconstructionData.alternatives && reconstructionData.alternatives.length > 0 && (
        <Card className="p-6 border-2 border-muted">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">🔄 Alternative Interpretations</h3>
              <Separator className="mb-4" />
              <div className="space-y-3">
                {reconstructionData.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Alternative {idx + 1}</span>
                      <Badge variant="outline">{alt.confidence}% confidence</Badge>
                    </div>
                    <p className="text-sm">&ldquo;{alt.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <Card className="p-6 border-2 border-muted">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">📚 Contextual Sources</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                {sources.map((source, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline flex items-center gap-2"
                      >
                        {source.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <span className="text-xl flex-shrink-0">{getStars(source.credibility)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{source.snippet}</p>
                    <p className="text-xs text-muted-foreground italic">
                      Why relevant: {source.relevanceReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Processing Time: {processingTime.toFixed(2)} seconds</span>
      </div>
    </div>
  );
}