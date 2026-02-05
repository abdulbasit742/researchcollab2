import { useState } from "react";
import { useProgressDashboard } from "@/hooks/useProgressDashboard";
import { useCareerCopilot, CareerInsight } from "@/hooks/useCareerCopilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Briefcase,
  DollarSign,
  Users,
  Sparkles,
  MessageCircle,
  Send,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Rocket,
   Mic,
} from "lucide-react";
 import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { formatPKR } from "@/lib/currency";
import { Link } from "react-router-dom";

export function ProgressDashboard() {
  const { data: progress, isLoading } = useProgressDashboard();
  const { askCopilot, getWeeklyInsights, loading: copilotLoading } = useCareerCopilot();
  const [question, setQuestion] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<any>(null);
  const [weeklyInsights, setWeeklyInsights] = useState<CareerInsight[] | null>(null);

  const handleAskCopilot = async () => {
    if (!question.trim()) return;
    const response = await askCopilot(question);
    setCopilotResponse(response);
    setQuestion("");
  };

  const handleGetInsights = async () => {
    const insights = await getWeeklyInsights();
    setWeeklyInsights(insights);
  };

  const getTrendIcon = (trend: "up" | "stable" | "down" | "improving" | "declining") => {
    if (trend === "up" || trend === "improving") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === "down" || trend === "declining") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getMomentumColor = (momentum: string) => {
    if (momentum === "accelerating") return "text-emerald-500";
    if (momentum === "slowing") return "text-amber-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Complete Your Profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start building your work history to see your professional progress.
          </p>
          <Button asChild>
            <Link to="/profile">Complete Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Momentum Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full bg-background flex items-center justify-center ${getMomentumColor(progress.overallMomentum)}`}>
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Professional Momentum: 
                  <span className={`ml-2 ${getMomentumColor(progress.overallMomentum)}`}>
                    {progress.overallMomentum === "accelerating" ? "Accelerating 🚀" : 
                     progress.overallMomentum === "slowing" ? "Needs Attention ⚠️" : "Steady 📊"}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Next Milestone: {progress.nextMilestone.name}
                </p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <Progress value={progress.nextMilestone.progress} className="w-32 mb-1" />
              <p className="text-xs text-muted-foreground">
                {progress.nextMilestone.estimatedDays > 0 
                  ? `~${progress.nextMilestone.estimatedDays} days remaining`
                  : "Goal achieved!"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="copilot">AI Co-pilot</TabsTrigger>
          <TabsTrigger value="insights">Weekly Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trust Trajectory */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Trust Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{progress.trustTrajectory.current}</span>
                  <span className="text-muted-foreground text-sm">/100</span>
                  {getTrendIcon(progress.trustTrajectory.trend)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Peak: {progress.trustTrajectory.peak} | Projected: {progress.trustTrajectory.projectedNextMonth}
                </p>
              </CardContent>
            </Card>

            {/* Opportunity Quality */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Opportunity Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <Badge variant={
                    progress.opportunityQuality.currentTier === "platinum" ? "default" :
                    progress.opportunityQuality.currentTier === "gold" ? "secondary" : "outline"
                  } className="capitalize text-lg px-3 py-1">
                    {progress.opportunityQuality.currentTier}
                  </Badge>
                  {getTrendIcon(progress.opportunityQuality.matchQualityTrend)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Match Quality: {progress.opportunityQuality.matchQuality}%
                </p>
              </CardContent>
            </Card>

            {/* Economic Outcomes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatPKR(progress.economicOutcomes.totalEarned)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg/project: {formatPKR(progress.economicOutcomes.averageProjectValue)}
                </p>
              </CardContent>
            </Card>

            {/* Relationships */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{progress.relationshipStrength.totalConnections}</span>
                  <span className="text-muted-foreground text-sm">connections</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {progress.relationshipStrength.activeCollaborators} active collaborators
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proven Skills</CardTitle>
              <CardDescription>Skills demonstrated through completed work</CardDescription>
            </CardHeader>
            <CardContent>
              {progress.skillMomentum.provenSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {progress.skillMomentum.provenSkills.map((skill) => (
                    <Badge key={skill.name} variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      {skill.name}
                      <span className="text-muted-foreground">({skill.projectsUsed})</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete projects to prove your skills. {progress.skillMomentum.recommendedNextSkill}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Trust Events */}
          {progress.trustTrajectory.recentEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Trust Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {progress.trustTrajectory.recentEvents.slice(0, 5).map((event, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{event.reason}</span>
                      <Badge variant={event.delta > 0 ? "default" : "destructive"}>
                        {event.delta > 0 ? "+" : ""}{event.delta}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="copilot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Career Co-pilot
              </CardTitle>
              <CardDescription>
                Ask questions about your career, opportunities, or how to improve your trust score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask: What should I work on next? Why is my trust not improving?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskCopilot()}
                   className="flex-1"
                />
                 <VoiceSearchButton
                   onTranscript={(text) => {
                     setQuestion(text);
                     // Auto-submit after voice input
                     setTimeout(() => {
                       if (text.trim()) {
                         askCopilot(text).then((response) => {
                           setCopilotResponse(response);
                         });
                       }
                     }, 100);
                   }}
                   className="shrink-0"
                 />
                <Button onClick={handleAskCopilot} disabled={copilotLoading || !question.trim()}>
                  {copilotLoading ? "..." : <Send className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuestion("What should I work on next?")}>
                  What next?
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuestion("Why is my trust score low?")}>
                  Improve trust
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuestion("What opportunities fit me?")}>
                  Best opportunities
                </Button>
              </div>

              {copilotResponse && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p>{copilotResponse.answer}</p>
                    </div>
                    
                    {copilotResponse.nextSteps && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                        <ul className="space-y-1">
                          {copilotResponse.nextSteps.map((step: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {copilotResponse.insights && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {copilotResponse.insights.map((insight: CareerInsight, i: number) => (
                          <Badge key={i} variant={insight.priority === "high" ? "destructive" : "secondary"}>
                            {insight.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Weekly Insights
                  </CardTitle>
                  <CardDescription>AI-generated recommendations based on your activity</CardDescription>
                </div>
                <Button onClick={handleGetInsights} disabled={copilotLoading}>
                  {copilotLoading ? "Loading..." : "Get Insights"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {weeklyInsights ? (
                <div className="space-y-3">
                  {weeklyInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        insight.type === "opportunity" ? "bg-emerald-500/10 text-emerald-500" :
                        insight.type === "risk" ? "bg-destructive/10 text-destructive" :
                        insight.type === "trust" ? "bg-primary/10 text-primary" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {insight.type === "opportunity" ? <Briefcase className="h-4 w-4" /> :
                         insight.type === "risk" ? <AlertTriangle className="h-4 w-4" /> :
                         insight.type === "trust" ? <Target className="h-4 w-4" /> :
                         <Lightbulb className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <Badge variant={insight.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        {insight.action && (
                          <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                            <Link to={insight.action.href}>{insight.action.label} →</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click "Get Insights" to receive personalized recommendations based on your work history.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
