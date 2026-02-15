import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useReproducibility } from "@/hooks/useReproducibility";
import {
  FlaskConical,
  GitBranch,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  RefreshCw,
  Eye,
  Link2,
} from "lucide-react";
import { format } from "date-fns";

const outcomeColors: Record<string, "default" | "secondary" | "destructive"> = {
  success: "default",
  partial: "secondary",
  failed: "destructive",
  blocked: "destructive",
};

const claimColors: Record<string, "default" | "secondary" | "destructive"> = {
  fully_reproducible: "default",
  partially_reproducible: "secondary",
  not_reproducible: "destructive",
  not_verified: "secondary",
};

export default function AdminReproducibilityPage() {
  const {
    artifacts,
    lineage,
    claims,
    verifications,
    loading,
    stats,
    refetch,
  } = useReproducibility();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Scientific Reproducibility</h1>
            <p className="text-muted-foreground">
              Artifact registry, provenance tracking, and verification status
            </p>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Artifacts</p>
                  <p className="text-2xl font-bold">{stats.totalArtifacts}</p>
                  <p className="text-xs text-green-600">
                    {stats.verifiedArtifacts} verified
                  </p>
                </div>
                <FlaskConical className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Claims</p>
                  <p className="text-2xl font-bold">{stats.totalClaims}</p>
                  <p className="text-xs text-green-600">
                    {stats.approvedClaims} approved
                  </p>
                </div>
                <FileCheck className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verifications</p>
                  <p className="text-2xl font-bold">{stats.totalVerifications}</p>
                  <p className="text-xs text-green-600">
                    {stats.successfulVerifications} successful
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.avgReproducibilityScore}%</p>
                </div>
                <GitBranch className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Health */}
        <Card>
          <CardHeader>
            <CardTitle>Research Integrity Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Verification Rate</span>
                  <span className="text-sm font-medium">
                    {stats.verifiedArtifacts}/{stats.totalArtifacts}
                  </span>
                </div>
                <Progress
                  value={stats.totalArtifacts > 0
                    ? (stats.verifiedArtifacts / stats.totalArtifacts) * 100
                    : 0}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Claim Approval Rate</span>
                  <span className="text-sm font-medium">
                    {stats.approvedClaims}/{stats.totalClaims}
                  </span>
                </div>
                <Progress
                  value={stats.totalClaims > 0
                    ? (stats.approvedClaims / stats.totalClaims) * 100
                    : 0}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Verification Success</span>
                  <span className="text-sm font-medium">
                    {stats.successfulVerifications}/{stats.totalVerifications}
                  </span>
                </div>
                <Progress
                  value={stats.totalVerifications > 0
                    ? (stats.successfulVerifications / stats.totalVerifications) * 100
                    : 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="artifacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="lineage">Provenance</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
          </TabsList>

          <TabsContent value="artifacts">
            <Card>
              <CardHeader>
                <CardTitle>Research Artifacts</CardTitle>
                <CardDescription>
                  Registered datasets, code, methods, and papers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {artifacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No artifacts registered</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {artifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{artifact.artifact_type}</Badge>
                                <Badge variant="outline">{artifact.visibility}</Badge>
                                <Badge
                                  variant={
                                    artifact.verification_status === "verified" ? "default" :
                                    artifact.verification_status === "pending" ? "secondary" :
                                    "outline"
                                  }
                                >
                                  {artifact.verification_status}
                                </Badge>
                              </div>
                              <h4 className="font-medium">{artifact.title}</h4>
                              {artifact.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {artifact.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>v{artifact.version}</span>
                                {artifact.doi && <span>DOI: {artifact.doi}</span>}
                                {artifact.license && <span>{artifact.license}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              {artifact.reproducibility_score !== null && (
                                <div className="text-center">
                                  <div className={`text-2xl font-bold ${
                                    artifact.reproducibility_score >= 70 ? "text-green-600" :
                                    artifact.reproducibility_score >= 40 ? "text-yellow-600" :
                                    "text-red-600"
                                  }`}>
                                    {artifact.reproducibility_score}
                                  </div>
                                  <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineage">
            <Card>
              <CardHeader>
                <CardTitle>Provenance Graph</CardTitle>
                <CardDescription>
                  Artifact relationships and derivations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lineage.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No lineage relationships documented</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {lineage.map((link) => {
                        const parent = artifacts.find(a => a.id === link.parent_artifact_id);
                        const child = artifacts.find(a => a.id === link.child_artifact_id);
                        return (
                          <div
                            key={link.id}
                            className="p-4 rounded-lg border flex items-center gap-4"
                          >
                            <div className="flex-1 text-right">
                              <p className="font-medium">{parent?.title || "Unknown"}</p>
                              <Badge variant="outline" className="text-xs">
                                {parent?.artifact_type}
                              </Badge>
                            </div>
                            <div className="flex flex-col items-center">
                              <Link2 className="h-5 w-5 text-muted-foreground" />
                              <Badge variant="secondary" className="text-xs mt-1">
                                {link.relationship}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{child?.title || "Unknown"}</p>
                              <Badge variant="outline" className="text-xs">
                                {child?.artifact_type}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Reproducibility Claims</CardTitle>
                <CardDescription>
                  Submitted claims about artifact reproducibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No claims submitted</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {claims.map((claim) => {
                        const artifact = artifacts.find(a => a.id === claim.artifact_id);
                        return (
                          <div
                            key={claim.id}
                            className="p-4 rounded-lg border"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={claimColors[claim.claim_type]}>
                                    {claim.claim_type.replace(/_/g, " ")}
                                  </Badge>
                                  <Badge variant="outline">{claim.claim_level}</Badge>
                                  <Badge
                                    variant={
                                      claim.review_status === "approved" ? "default" :
                                      claim.review_status === "rejected" ? "destructive" :
                                      "secondary"
                                    }
                                  >
                                    {claim.review_status}
                                  </Badge>
                                </div>
                                <p className="font-medium">{artifact?.title || "Unknown artifact"}</p>
                                {claim.limitations && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Limitations: {claim.limitations}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <p>{format(new Date(claim.submitted_at), "PP")}</p>
                                {claim.estimated_reproduction_time && (
                                  <p className="text-xs">Time: {claim.estimated_reproduction_time}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Verification Attempts</CardTitle>
                <CardDescription>
                  Independent verification records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No verifications recorded</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {verifications.map((verification) => {
                        const artifact = artifacts.find(a => a.id === verification.artifact_id);
                        return (
                          <div
                            key={verification.id}
                            className={`p-4 rounded-lg border ${
                              verification.outcome === "success"
                                ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                                : verification.outcome === "failed"
                                ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={outcomeColors[verification.outcome]}>
                                    {verification.outcome}
                                  </Badge>
                                  {verification.is_public && (
                                    <Badge variant="outline">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Public
                                    </Badge>
                                  )}
                                  {verification.conflict_of_interest_declared && (
                                    <Badge variant="secondary">COI Declared</Badge>
                                  )}
                                </div>
                                <p className="font-medium">{artifact?.title || "Unknown artifact"}</p>
                                {verification.outcome_details && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {verification.outcome_details}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <p>{format(new Date(verification.created_at), "PP")}</p>
                                {verification.time_spent_hours && (
                                  <p className="text-xs">{verification.time_spent_hours}h spent</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
