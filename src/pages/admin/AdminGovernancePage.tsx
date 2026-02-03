import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePlatformGovernance } from "@/hooks/usePlatformGovernance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ScrollText, 
  Users, 
  Vote, 
  AlertTriangle,
  Shield,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function AdminGovernancePage() {
  const {
    charters,
    councils,
    memberships,
    decisions,
    emergencyProtocols,
    activeEmergencies,
    loading,
    getGovernanceStats,
  } = usePlatformGovernance();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = getGovernanceStats();

  const getDecisionBadge = (outcome: string | null) => {
    switch (outcome) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{outcome || "Unknown"}</Badge>;
    }
  };

  const getCouncilTypeColor = (type: string) => {
    switch (type) {
      case "operational": return "bg-blue-500/10 text-blue-500";
      case "oversight": return "bg-purple-500/10 text-purple-500";
      case "advisory": return "bg-green-500/10 text-green-500";
      case "ethics": return "bg-amber-500/10 text-amber-500";
      case "emergency": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Governance</h1>
            <p className="text-muted-foreground">
              Constitutional framework, councils, and emergency protocols
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Charter
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Council
            </Button>
          </div>
        </div>

        {/* Emergency Alert */}
        {activeEmergencies.length > 0 && (
          <Card className="border-red-500 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-500">Active Emergency Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeEmergencies.length} emergency protocol(s) currently active
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="ml-auto">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Charters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCharters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Councils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCouncils}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingDecisions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.activeEmergencies}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charters">Charters</TabsTrigger>
            <TabsTrigger value="councils">Councils</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Protocols</TabsTrigger>
          </TabsList>

          <TabsContent value="charters" className="space-y-4">
            {charters.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ScrollText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Charters</h3>
                  <p className="text-muted-foreground mb-4">
                    Platform charters define constitutional rules
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Charter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {charters.map((charter) => (
                  <Card key={charter.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <ScrollText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{charter.title}</h3>
                              <Badge variant="outline">v{charter.version}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {charter.charter_type.replace(/_/g, " ")} Charter
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Effective from {format(new Date(charter.effective_from), "PPP")}
                            </p>
                          </div>
                        </div>
                        <Badge className={charter.is_active ? "bg-green-500/10 text-green-500" : ""}>
                          {charter.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="councils" className="space-y-4">
            {councils.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Councils</h3>
                  <p className="text-muted-foreground mb-4">
                    Governance councils oversee platform operations
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Council
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {councils.map((council) => {
                  const councilMembers = memberships.filter((m) => m.council_id === council.id);
                  return (
                    <Card key={council.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{council.name}</h3>
                                <Badge className={getCouncilTypeColor(council.council_type)}>
                                  {council.council_type}
                                </Badge>
                              </div>
                              {council.description && (
                                <p className="text-sm text-muted-foreground">{council.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{councilMembers.length} members</span>
                                <span>Quorum: {council.quorum_requirement}%</span>
                                {council.term_length_months && (
                                  <span>Term: {council.term_length_months} months</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage Members
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            {decisions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Decisions</h3>
                  <p className="text-muted-foreground">
                    Council decisions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {decisions.map((decision) => (
                  <Card key={decision.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{decision.title}</h3>
                            {getDecisionBadge(decision.decision_outcome)}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize mb-2">
                            {decision.decision_type.replace(/_/g, " ")}
                            {decision.council && ` • ${decision.council.name}`}
                          </p>
                          <p className="text-sm">{decision.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-green-500">For: {decision.votes_for}</span>
                            <span className="text-red-500">Against: {decision.votes_against}</span>
                            <span className="text-muted-foreground">Abstain: {decision.votes_abstain}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Protocols</CardTitle>
                <CardDescription>
                  Pre-defined responses for crisis situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emergencyProtocols.length === 0 ? (
                  <div className="py-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Protocols Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Emergency protocols define automated crisis responses
                    </p>
                    <Button variant="destructive">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Protocol
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencyProtocols.map((protocol) => (
                      <div key={protocol.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{protocol.protocol_name}</h4>
                              <Badge variant={protocol.severity_level >= 4 ? "destructive" : "outline"}>
                                Severity {protocol.severity_level}
                              </Badge>
                            </div>
                            {protocol.time_limit_hours && (
                              <p className="text-sm text-muted-foreground">
                                Time limit: {protocol.time_limit_hours} hours
                              </p>
                            )}
                          </div>
                          <Button variant="destructive" size="sm">
                            Activate
                          </Button>
                        </div>
                      </div>
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
