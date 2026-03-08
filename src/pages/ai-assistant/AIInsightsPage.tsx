import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Lightbulb, Target, Users, TrendingUp, AlertTriangle, CheckCircle,
  Sparkles, RefreshCw, X
} from "lucide-react";
import {
  getSavedRecommendations, dismissRecommendation,
  getInsights, markInsightRead, generateRecommendations
} from "@/lib/ai/personalAssistant";
import { useAuth } from "@/contexts/AuthContext";

const TYPE_ICONS: Record<string, any> = {
  opportunity: Target,
  collaboration: Users,
  skill_gap: AlertTriangle,
  career: TrendingUp,
  project: Sparkles,
  info: Lightbulb,
  warning: AlertTriangle,
  success: CheckCircle,
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-600",
  warning: "bg-amber-500/10 text-amber-600",
  success: "bg-green-500/10 text-green-600",
  critical: "bg-red-500/10 text-red-600",
};

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getSavedRecommendations().then(setRecommendations).catch(() => {});
    getInsights().then(setInsights).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const recs = await generateRecommendations({
        user_id: user?.id,
        context: "general platform usage",
      });
      toast.success(`Generated ${recs.length} recommendations`);
      // Refresh from DB
      getSavedRecommendations().then(setRecommendations).catch(() => {});
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    }
    setIsGenerating(false);
  };

  const handleDismiss = async (id: string) => {
    await dismissRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleMarkRead = async (id: string) => {
    await markInsightRead(id);
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Insights & Recommendations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalized guidance to optimize your RCollab journey
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          Generate New
        </Button>
      </div>

      <Tabs defaultValue="recommendations">
        <TabsList>
          <TabsTrigger value="recommendations">
            Recommendations {recommendations.length > 0 && <Badge variant="secondary" className="ml-2">{recommendations.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights {insights.length > 0 && <Badge variant="secondary" className="ml-2">{insights.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Generate New" to get AI-powered suggestions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec) => {
                const Icon = TYPE_ICONS[rec.recommendation_type] || Lightbulb;
                return (
                  <Card key={rec.id} className="group">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">{rec.recommendation_type}</Badge>
                          {rec.relevance_score > 0 && (
                            <Badge variant="secondary" className="text-xs">{Math.round(rec.relevance_score * 100)}% match</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.summary}</p>
                      </div>
                      <Button
                        size="icon" variant="ghost"
                        className="opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={() => handleDismiss(rec.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No new insights</h3>
                <p className="text-sm text-muted-foreground">
                  Insights appear as the AI analyzes your activity patterns
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => {
                const Icon = TYPE_ICONS[insight.insight_type] || Lightbulb;
                const colorClass = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.info;
                return (
                  <Card key={insight.id}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.action_suggestion && (
                          <p className="text-sm text-primary mt-2">💡 {insight.action_suggestion}</p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleMarkRead(insight.id)}>
                        Mark Read
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
