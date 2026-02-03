import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Sparkles, Target, Lightbulb, TrendingUp, Search, FileText,
  MessageSquare, Wand2, Bot, ChevronRight, RefreshCw, AlertTriangle,
  CheckCircle, Clock, Loader2, Zap, BarChart3, Eye, Copy, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIMatching, useAIContentGeneration, useAICareerCoaching, usePredictiveAnalytics, useSmartRecommendations, useAIDocumentAnalysis } from "@/hooks/useAIIntelligenceSimple";

// AI Match Explorer
export function AIMatchExplorer() {
  const { candidates, filters, setFilters, refreshMatches } = useAIMatching();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Match Explorer
        </CardTitle>
        <CardDescription>
          Intelligent matching based on skills, trust, and success patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Filter by skill..." className="flex-1" />
          <Button variant="outline" size="icon" onClick={refreshMatches}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-80">
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium">{candidate.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{candidate.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          candidate.availability === "available" ? "border-emerald-500 text-emerald-500" :
                          candidate.availability === "limited" ? "border-amber-500 text-amber-500" : "border-muted"
                        )}>
                          {candidate.availability}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Trust: {candidate.trustScore}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{candidate.matchScore}%</div>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Match Factors</p>
                  {candidate.matchReasons.slice(0, 2).map((reason, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Progress value={reason.weight * 100} className="h-1 flex-1" />
                      <span className="text-xs text-muted-foreground w-24 truncate">{reason.factor}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    {candidate.predictedSuccess}% predicted success
                  </div>
                  <Button size="sm" className="gap-1">
                    Connect <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// AI Content Generator
export function AIContentGenerator() {
  const { isGenerating, suggestions, generateContent } = useAIContentGeneration();
  const [contentType, setContentType] = useState<"bio" | "proposal" | "message">("bio");
  const [purpose, setPurpose] = useState("");

  const handleGenerate = () => {
    generateContent(contentType, {
      purpose: purpose || "Professional profile",
      audience: "Potential collaborators",
      keywords: ["AI", "Data Science", "Research"],
      maxLength: 200,
      style: "professional",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate professional content with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="bio">Bio</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Input
            placeholder="What's the purpose? (e.g., job application, project pitch)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <Button onClick={handleGenerate} className="w-full gap-2" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Generated Content</h4>
            {suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="capitalize">{suggestion.type}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </div>
                </div>
                <p className="text-sm">{suggestion.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost">Use This</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AI Career Coach Panel
export function AICareerCoachPanel() {
  const { advice, analysis, refreshAnalysis } = useAICareerCoaching();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Career Coach
        </CardTitle>
        <CardDescription>
          Personalized career guidance and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Career Score</span>
            <Badge variant={analysis.trajectory === "accelerating" ? "default" : "secondary"}>
              {analysis.trajectory}
            </Badge>
          </div>
          <div className="text-3xl font-bold">{analysis.overallScore}/100</div>
          <Progress value={analysis.overallScore} className="mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <h4 className="text-xs font-medium text-emerald-600 mb-2">Strengths</h4>
            {analysis.strengths.slice(0, 2).map((s, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {s}</p>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-xs font-medium text-amber-600 mb-2">Gaps</h4>
            {analysis.gaps.slice(0, 2).map((g, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {g}</p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
          <div className="space-y-2">
            {advice.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                    {item.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
                </div>
                <h5 className="font-medium text-sm">{item.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">{item.recommendation}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {item.expectedImpact}
                  <Clock className="h-3 w-3 ml-2" />
                  {item.timeToImplement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Predictive Analytics Dashboard
export function PredictiveAnalyticsDashboard() {
  const { predictions } = usePredictiveAnalytics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Predictive Analytics
        </CardTitle>
        <CardDescription>
          AI-powered forecasts for your career metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{prediction.type}</Badge>
                <span className="text-xs text-muted-foreground">{prediction.timeframe}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(prediction.confidence * 100)}% confidence
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-xl font-bold">{prediction.currentValue.toLocaleString()}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Predicted</p>
                <p className="text-xl font-bold text-primary">{prediction.predictedValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Scenarios</p>
              {prediction.scenarios.map((scenario, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span>{scenario.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{Math.round(scenario.probability * 100)}%</span>
                    <span className="font-medium">{scenario.outcome.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Smart Recommendations Panel
export function SmartRecommendationsPanel() {
  const { recommendations, dismissRecommendation } = useSmartRecommendations();

  const getIcon = (category: string) => {
    switch (category) {
      case "opportunity": return Target;
      case "connection": return MessageSquare;
      case "skill": return Lightbulb;
      case "action": return Zap;
      default: return Star;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>
          AI-curated actions to boost your career
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = getIcon(rec.category);
              return (
                <div key={rec.id} className="p-3 rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      rec.category === "opportunity" ? "bg-emerald-500/10" :
                      rec.category === "connection" ? "bg-blue-500/10" :
                      rec.category === "skill" ? "bg-purple-500/10" : "bg-amber-500/10"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        rec.category === "opportunity" ? "text-emerald-500" :
                        rec.category === "connection" ? "text-blue-500" :
                        rec.category === "skill" ? "text-purple-500" : "text-amber-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize text-xs">{rec.category}</Badge>
                        <span className="text-xs text-muted-foreground">{rec.matchScore}% match</span>
                      </div>
                      <h4 className="font-medium text-sm mt-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" className="h-7 text-xs">Take Action</Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs"
                          onClick={() => dismissRecommendation(rec.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// AI Document Analyzer
export function AIDocumentAnalyzer() {
  const { analyses, isAnalyzing, analyzeDocument } = useAIDocumentAnalysis();
  const [documentName, setDocumentName] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          AI Document Analyzer
        </CardTitle>
        <CardDescription>
          Analyze contracts, proposals, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste document or upload..."
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => analyzeDocument(documentName || "Document", "Content...")}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>

        {analyses.length > 0 && (
          <div className="space-y-3">
            {analyses.slice(0, 2).map((analysis) => (
              <div key={analysis.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{analysis.documentName}</h4>
                    <Badge variant="outline" className="capitalize mt-1">{analysis.documentType}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-medium">{Math.round(analysis.confidence * 100)}%</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{analysis.summary}</p>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium mb-1">Key Points</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keyPoints.slice(0, 3).map((point, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{point}</Badge>
                      ))}
                    </div>
                  </div>

                  {analysis.risks.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Risks Identified</h5>
                      {analysis.risks.map((risk, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className={cn(
                            "h-3 w-3 mt-0.5",
                            risk.level === "critical" || risk.level === "high" ? "text-destructive" : "text-amber-500"
                          )} />
                          <span className="text-muted-foreground">{risk.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Combined AI Intelligence Dashboard
export function AIIntelligenceDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <AIMatchExplorer />
        <AICareerCoachPanel />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <AIContentGenerator />
        <PredictiveAnalyticsDashboard />
        <SmartRecommendationsPanel />
      </div>
      <AIDocumentAnalyzer />
    </div>
  );
}
