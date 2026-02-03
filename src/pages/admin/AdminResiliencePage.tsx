import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCivilizationalResilience } from "@/hooks/useCivilizationalResilience";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Shield, 
  DollarSign,
  Scale,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
  HardDrive,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { formatPKR } from "@/lib/currency";

export default function AdminResiliencePage() {
  const {
    dataCustodyNodes,
    checkpoints,
    fundingModels,
    endowmentFunds,
    ethicsReviews,
    accountabilityReports,
    communityChallenges,
    loading,
    getResilienceScore,
    getResilienceStats,
  } = useCivilizationalResilience();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const resilienceScore = getResilienceScore();
  const stats = getResilienceStats();

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case "primary": return <Badge className="bg-green-500/10 text-green-500">Primary</Badge>;
      case "backup": return <Badge className="bg-blue-500/10 text-blue-500">Backup</Badge>;
      case "archive": return <Badge className="bg-purple-500/10 text-purple-500">Archive</Badge>;
      case "escrow": return <Badge className="bg-amber-500/10 text-amber-500">Escrow</Badge>;
      case "offline": return <Badge variant="secondary">Offline</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getChallengeStatusBadge = (status: string) => {
    switch (status) {
      case "submitted": return <Badge className="bg-blue-500/10 text-blue-500">Submitted</Badge>;
      case "under_review": return <Badge className="bg-yellow-500/10 text-yellow-500">Under Review</Badge>;
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Resolved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "escalated": return <Badge className="bg-red-500/10 text-red-500">Escalated</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Civilizational Resilience</h1>
            <p className="text-muted-foreground">
              Data custody, continuity, funding, and accountability
            </p>
          </div>
        </div>

        {/* Resilience Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Resilience Score
            </CardTitle>
            <CardDescription>
              Overall preparedness for long-term survival and failure scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-4xl font-bold text-primary">{resilienceScore.total}/100</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-32">Data Custody</span>
                  <Progress value={resilienceScore.breakdown.dataCustody * 3.33} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{resilienceScore.breakdown.dataCustody}/30</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-32">Continuity</span>
                  <Progress value={resilienceScore.breakdown.continuity * 5} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{resilienceScore.breakdown.continuity}/20</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-32">Funding</span>
                  <Progress value={resilienceScore.breakdown.funding * 5} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{resilienceScore.breakdown.funding}/20</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-32">Ethics</span>
                  <Progress value={resilienceScore.breakdown.ethics * 6.67} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{resilienceScore.breakdown.ethics}/15</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-32">Transparency</span>
                  <Progress value={resilienceScore.breakdown.transparency * 6.67} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{resilienceScore.breakdown.transparency}/15</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Custody Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offline Capable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.offlineCapableNodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified Checkpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedCheckpoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funding Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFundingModels}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Endowment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(stats.totalEndowment)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingChallenges}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="custody" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="custody">Data Custody</TabsTrigger>
            <TabsTrigger value="continuity">Continuity</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="ethics">Ethics Reviews</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="custody" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Custody Nodes
                </CardTitle>
                <CardDescription>
                  Distributed data storage for civilizational resilience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataCustodyNodes.length === 0 ? (
                  <div className="py-8 text-center">
                    <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Custody Nodes</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure distributed data custody for resilience
                    </p>
                    <Button>Add Custody Node</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dataCustodyNodes.map((node) => (
                      <div key={node.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{node.node_name}</h4>
                                {getNodeTypeBadge(node.node_type)}
                                {node.offline_capable && (
                                  <Badge variant="outline">Offline Capable</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {node.geographic_location} • {node.jurisdiction}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Encryption: {node.encryption_standard}</span>
                                {node.last_sync_at && (
                                  <span>Last sync: {formatDistanceToNow(new Date(node.last_sync_at), { addSuffix: true })}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {node.continuity_priority && (
                            <Badge variant="outline">Priority {node.continuity_priority}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="continuity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Continuity Checkpoints
                </CardTitle>
                <CardDescription>
                  Recovery points for disaster scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkpoints.length === 0 ? (
                  <div className="py-8 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Checkpoints</h3>
                    <p className="text-muted-foreground mb-4">
                      Create continuity checkpoints for recovery
                    </p>
                    <Button>Create Checkpoint</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checkpoints.map((checkpoint) => (
                      <div key={checkpoint.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{checkpoint.checkpoint_type}</Badge>
                              {checkpoint.verification_status === "verified" ? (
                                <Badge className="bg-green-500/10 text-green-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>
                              )}
                              {checkpoint.recovery_tested && (
                                <Badge variant="outline">Recovery Tested</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(checkpoint.checkpoint_date), "PPP")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Systems: {checkpoint.systems_included.join(", ")}
                            </p>
                          </div>
                          {checkpoint.recovery_time_objective && (
                            <span className="text-sm text-muted-foreground">
                              RTO: {checkpoint.recovery_time_objective}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Funding Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fundingModels.length === 0 ? (
                    <p className="text-muted-foreground">No funding models configured</p>
                  ) : (
                    <div className="space-y-3">
                      {fundingModels.map((model) => (
                        <div key={model.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{model.model_name}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{model.model_type}</p>
                            </div>
                            {model.is_active && (
                              <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Endowment Funds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {endowmentFunds.length === 0 ? (
                    <p className="text-muted-foreground">No endowment funds configured</p>
                  ) : (
                    <div className="space-y-3">
                      {endowmentFunds.map((fund) => (
                        <div key={fund.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{fund.fund_name}</h4>
                          <p className="text-sm text-muted-foreground">{fund.purpose}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{formatPKR(fund.current_amount)}</span>
                              {fund.target_amount && (
                                <span className="text-muted-foreground">/ {formatPKR(fund.target_amount)}</span>
                              )}
                            </div>
                            {fund.target_amount && (
                              <Progress value={(fund.current_amount / fund.target_amount) * 100} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ethics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Ethics Reviews
                </CardTitle>
                <CardDescription>
                  Independent ethical assessments and audits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ethicsReviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Ethics Reviews</h3>
                    <p className="text-muted-foreground">
                      Ethics reviews will be documented here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ethicsReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{review.subject}</h4>
                              {review.severity && (
                                <Badge variant={review.severity === "critical" ? "destructive" : "outline"}>
                                  {review.severity}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {review.review_type} review • {review.reviewer_type}
                            </p>
                            {review.public_summary && (
                              <p className="text-sm mt-2">{review.public_summary}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Community Challenges
                </CardTitle>
                <CardDescription>
                  User-submitted challenges to platform decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {communityChallenges.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Challenges</h3>
                    <p className="text-muted-foreground">
                      Community challenges will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communityChallenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{challenge.challenge_title}</h4>
                              {getChallengeStatusBadge(challenge.status)}
                              {challenge.urgency === "critical" && (
                                <Badge variant="destructive">Critical</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {challenge.challenge_type} • {challenge.target_entity_type}
                            </p>
                            <p className="text-sm mt-2">{challenge.challenge_description}</p>
                            {challenge.resolution && (
                              <p className="text-sm text-green-600 mt-2">
                                Resolution: {challenge.resolution}
                              </p>
                            )}
                          </div>
                          {challenge.status !== "resolved" && challenge.status !== "rejected" && (
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          )}
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
