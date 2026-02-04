import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  Activity, 
  Users, 
  Target,
  RefreshCw,
  Bell,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAmbientIntelligence } from "@/hooks/useAmbientIntelligence";
import { NudgeList, type Nudge } from "./NudgeCard";
import { DealHealthIndicator, DealHealthSummary } from "./DealHealthIndicator";
import { RelationshipEntropyList } from "./RelationshipEntropyCard";

interface AmbientDashboardProps {
  className?: string;
}

export function AmbientDashboard({ className }: AmbientDashboardProps) {
  const {
    nudges,
    dealHealth,
    relationshipEntropy,
    opportunityAlerts,
    loading,
    fetchAmbientData,
    dismissInsight,
    dismissAlert,
    unreadCount,
    highPriorityCount,
    atRiskDealsCount,
  } = useAmbientIntelligence();

  const handleDismiss = (id: string) => {
    // Determine if it's an insight or alert based on the nudge type
    const nudge = nudges.find(n => n.id === id);
    if (nudge?.type === "alert") {
      dismissAlert(id);
    } else {
      dismissInsight(id);
    }
  };

  const handleReconnect = (connectionId: string) => {
    // Navigate to messaging or open a compose dialog
    window.location.href = `/messages?to=${connectionId}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Ambient Intelligence
          </h2>
          <p className="text-muted-foreground">
            Proactive insights and opportunities surfaced just for you
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {highPriorityCount} urgent
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchAmbientData()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{nudges.length}</p>
                <p className="text-xs text-muted-foreground">Active Nudges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{opportunityAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                atRiskDealsCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
              )}>
                <Activity className={cn(
                  "h-5 w-5",
                  atRiskDealsCount > 0 ? "text-amber-500" : "text-emerald-500"
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dealHealth.length}</p>
                <p className="text-xs text-muted-foreground">
                  Deals ({atRiskDealsCount} at risk)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {relationshipEntropy.filter(r => r.entropy_score >= 60).length}
                </p>
                <p className="text-xs text-muted-foreground">Cooling Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="nudges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nudges" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            Nudges
            {nudges.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {nudges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Deal Health
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nudges" className="space-y-4">
          {nudges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  No new insights or alerts at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <NudgeList
              nudges={nudges}
              onDismiss={handleDismiss}
              maxVisible={10}
            />
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {dealHealth.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No active deals</h3>
                <p className="text-sm text-muted-foreground">
                  Deal health metrics will appear when you have active deals
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <DealHealthSummary deals={dealHealth} />
              <div className="grid md:grid-cols-2 gap-4">
                {dealHealth.map((health) => (
                  <DealHealthIndicator
                    key={health.id}
                    health={health}
                    showDetails
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Relationship Health
              </CardTitle>
              <CardDescription>
                Connections that may need attention based on interaction patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relationshipEntropy.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No relationship data available yet</p>
                </div>
              ) : (
                <RelationshipEntropyList
                  relationships={relationshipEntropy}
                  onReconnect={handleReconnect}
                  maxVisible={8}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          {opportunityAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No opportunity alerts</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when high-match opportunities appear
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {opportunityAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant={alert.match_score >= 90 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {alert.match_score}% match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.alert_type.replace("_", " ")}
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-1">
                        {alert.opportunity?.title || "Opportunity"}
                      </h4>
                      
                      {alert.match_reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {alert.match_reasons.slice(0, 3).map((reason, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {alert.deadline_distance_days !== undefined && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Deadline in {alert.deadline_distance_days} days
                        </p>
                      )}

                      <Button size="sm" variant="default" className="w-full" asChild>
                        <a href={`/offers/${alert.opportunity_id}`}>
                          View Opportunity
                          <TrendingUp className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compact widget version for dashboards
interface AmbientWidgetProps {
  className?: string;
}

export function AmbientWidget({ className }: AmbientWidgetProps) {
  const { nudges, highPriorityCount } = useAmbientIntelligence();

  if (nudges.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Quick Insights
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {highPriorityCount} urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NudgeList nudges={nudges} compact maxVisible={3} />
      </CardContent>
    </Card>
  );
}
