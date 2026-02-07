import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOperationsCenter } from "@/hooks/useOperationsCenter";
import {
  IncidentBoard,
  FeedbackTriagePanel,
  ChangeFreezeCard,
  OperatingCadencePanel,
  FounderDisciplinePanel,
  CoreMetricsPanel,
  PostLaunchRules,
} from "@/components/operations";
import { Shield, AlertTriangle, MessageSquare, Snowflake, Clock, Brain, BarChart3 } from "lucide-react";

export default function AdminOperationsPage() {
  const ops = useOperationsCenter();
  const [tab, setTab] = useState("rules");

  if (ops.loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Operations Center
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Post-Launch Operating System — Stability, Signal & Discipline
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ops.activeFreeze && (
              <Badge className="bg-blue-500/90 text-white">
                <Snowflake className="h-3 w-3 mr-1" /> Change Freeze Active
              </Badge>
            )}
            {ops.p0Incidents.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> {ops.p0Incidents.length} P0
              </Badge>
            )}
            {ops.untriaged.length > 0 && (
              <Badge variant="outline">
                {ops.untriaged.length} untriaged
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
            <TabsTrigger value="rules" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Incidents</span>
              {ops.openIncidents.length > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs ml-1">{ops.openIncidents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Feedback</span>
              {ops.untriaged.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">{ops.untriaged.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="freeze" className="gap-1">
              <Snowflake className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Freeze</span>
            </TabsTrigger>
            <TabsTrigger value="cadence" className="gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cadence</span>
            </TabsTrigger>
            <TabsTrigger value="discipline" className="gap-1">
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Discipline</span>
              {ops.coolingIdeas.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">{ops.coolingIdeas.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-6">
            <PostLaunchRules />
          </TabsContent>

          <TabsContent value="incidents" className="mt-6">
            <IncidentBoard
              incidents={ops.incidents}
              openIncidents={ops.openIncidents}
              p0Incidents={ops.p0Incidents}
              onCreateIncident={ops.createIncident}
              onUpdateStatus={ops.updateIncidentStatus}
            />
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <FeedbackTriagePanel
              feedback={ops.feedback}
              signalFeedback={ops.signalFeedback}
              untriaged={ops.untriaged}
              onTriage={ops.triageFeedback}
            />
          </TabsContent>

          <TabsContent value="freeze" className="mt-6">
            <ChangeFreezeCard
              freezePolicies={ops.freezePolicies}
              activeFreeze={ops.activeFreeze}
              onCreateFreeze={ops.createFreezePolicy}
            />
          </TabsContent>

          <TabsContent value="cadence" className="mt-6">
            <OperatingCadencePanel
              operatingLogs={ops.operatingLogs}
              onAddLog={ops.addLogEntry}
            />
          </TabsContent>

          <TabsContent value="discipline" className="mt-6">
            <FounderDisciplinePanel
              founderIdeas={ops.founderIdeas}
              coolingIdeas={ops.coolingIdeas}
              onSubmitIdea={ops.submitIdea}
              onDecideIdea={ops.decideIdea}
            />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <CoreMetricsPanel
              latestMetrics={ops.latestMetrics}
              metrics={ops.metrics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
