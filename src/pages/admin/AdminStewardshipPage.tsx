import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePlatformMission, useStewardship, useContinuityTriggers, useForkExitProtocols } from "@/hooks/usePlatformStewardship";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sunset,
  Shield,
  Power,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Building,
  Target,
  Compass,
} from "lucide-react";

export default function AdminStewardshipPage() {
  const { currentMission, isLoading: missionLoading, fetchCurrentMission } = usePlatformMission();
  const { entities, isLoading: stewardsLoading, fetchActiveStewards } = useStewardship();
  const { triggers, isLoading: triggersLoading, fetchAllTriggers } = useContinuityTriggers();
  const { protocols, isLoading: protocolsLoading, fetchApprovedProtocols } = useForkExitProtocols();
  const [activeTab, setActiveTab] = useState("mission");

  const loading = missionLoading || stewardsLoading || triggersLoading || protocolsLoading;

  useEffect(() => {
    fetchCurrentMission();
    fetchActiveStewards();
    fetchAllTriggers();
    fetchApprovedProtocols();
  }, []);

  const activeTriggers = triggers.filter(t => t.status === 'activated');

  const stats = {
    activeStewards: entities.length,
    activeTriggers: activeTriggers.length,
    activeProtocols: protocols.length,
    missionVersion: currentMission?.version_number || 0,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const refetch = () => {
    fetchCurrentMission();
    fetchActiveStewards();
    fetchAllTriggers();
    fetchApprovedProtocols();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sunset className="h-6 w-6" />
              Platform Stewardship
            </h1>
            <p className="text-muted-foreground">
              Mission, stewards, continuity triggers, and exit protocols
            </p>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Triggers Alert */}
        {activeTriggers.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Active Continuity Triggers</AlertTitle>
            <AlertDescription>
              {activeTriggers.length} continuity trigger(s) are currently activated and require attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">v{stats.missionVersion}</p>
                  <p className="text-sm text-muted-foreground">Mission Version</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeStewards}</p>
                  <p className="text-sm text-muted-foreground">Active Stewards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeTriggers}</p>
                  <p className="text-sm text-muted-foreground">Active Triggers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Power className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeProtocols}</p>
                  <p className="text-sm text-muted-foreground">Exit Protocols</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="mission">Mission</TabsTrigger>
            <TabsTrigger value="stewards">Stewards</TabsTrigger>
            <TabsTrigger value="triggers">Continuity Triggers</TabsTrigger>
            <TabsTrigger value="protocols">Exit Protocols</TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Platform Mission
                </CardTitle>
                <CardDescription>
                  The core purpose and principles guiding the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentMission ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Mission Statement</h4>
                      <p className="text-muted-foreground">{currentMission.mission_statement}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Core Principles</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentMission.core_principles?.map((principle, i) => (
                          <Badge key={i} variant="secondary">{principle}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Non-Negotiables</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentMission.non_negotiables?.map((item, i) => (
                          <Badge key={i} variant="destructive">{item}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Adopted: {new Date(currentMission.adopted_at).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No mission statement defined yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Stewardship Entities
                </CardTitle>
                <CardDescription>
                  Organizations responsible for platform governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No stewardship entities defined</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Mandate</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((entity) => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">{entity.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entity.entity_type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{entity.mandate}</TableCell>
                          <TableCell>
                            <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
                              {entity.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Continuity Triggers
                </CardTitle>
                <CardDescription>
                  Automated responses to platform-threatening events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {triggers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No continuity triggers defined</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {triggers.map((trigger) => (
                        <TableRow key={trigger.id} className={trigger.status === 'activated' ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium">{trigger.trigger_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="max-w-md truncate">{trigger.predefined_response}</TableCell>
                          <TableCell>
                            <Badge variant={trigger.status === 'activated' ? 'destructive' : trigger.status === 'dormant' ? 'secondary' : 'default'}>
                              {trigger.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Fork & Exit Protocols
                </CardTitle>
                <CardDescription>
                  Predefined paths for graceful platform transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {protocols.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Power className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No exit protocols defined</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {protocols.map((protocol) => (
                      <Card key={protocol.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{protocol.protocol_name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{protocol.conditions}</p>
                            </div>
                            <Badge variant="outline">{protocol.protocol_type.replace(/_/g, ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {protocol.is_active ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {protocol.approved_at && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved {new Date(protocol.approved_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
