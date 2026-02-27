/**
 * ClaimGraphPanel — Interactive claim graph + synthesis controls for research workspace.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Network, Zap, AlertTriangle, CheckCircle2,
  FileText, TrendingUp, Search, Lightbulb, Copy, Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  useWorkspaceClaims,
  useExtractClaims,
  useClaimRelationships,
  useCrossSynthesize,
  useSynthesisReports,
  useGenerateSynthesisReport,
  type ResearchClaim,
  type ClaimRelationship,
  type ConsensusClusters,
  type Contradiction,
  type ResearchGapItem,
} from "@/hooks/useCrossSynthesis";

interface ClaimGraphPanelProps {
  workspaceId: string;
}

export function ClaimGraphPanel({ workspaceId }: ClaimGraphPanelProps) {
  const { data: claims = [], isLoading: claimsLoading } = useWorkspaceClaims(workspaceId);
  const { data: relationships = [] } = useClaimRelationships(workspaceId);
  const { data: reports = [] } = useSynthesisReports(workspaceId);

  const extractClaims = useExtractClaims();
  const crossSynthesize = useCrossSynthesize();
  const generateReport = useGenerateSynthesisReport();

  const [synthesisResult, setSynthesisResult] = useState<{
    consensus_clusters: ConsensusClusters[];
    contradictions: Contradiction[];
    research_gaps: ResearchGapItem[];
  } | null>(null);

  const [selectedClaim, setSelectedClaim] = useState<ResearchClaim | null>(null);
  const [reportType, setReportType] = useState("synthesis");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute graph stats
  const graphStats = useMemo(() => {
    const reinforces = relationships.filter(r => r.relationship_type === "reinforces").length;
    const contradicts = relationships.filter(r => r.relationship_type === "contradicts").length;
    const extends_ = relationships.filter(r => r.relationship_type === "extends").length;
    const related = relationships.filter(r => r.relationship_type === "related").length;
    return { reinforces, contradicts, extends: extends_, related, total: relationships.length };
  }, [relationships]);

  // Claim type distribution
  const claimTypes = useMemo(() => {
    const map: Record<string, number> = {};
    claims.forEach(c => { map[c.claim_type] = (map[c.claim_type] || 0) + 1; });
    return map;
  }, [claims]);

  // Get related claims for selected claim
  const relatedClaims = useMemo(() => {
    if (!selectedClaim) return [];
    return relationships
      .filter(r => r.claim_id_a === selectedClaim.id || r.claim_id_b === selectedClaim.id)
      .map(r => {
        const otherId = r.claim_id_a === selectedClaim.id ? r.claim_id_b : r.claim_id_a;
        const otherClaim = claims.find(c => c.id === otherId);
        return { relationship: r, claim: otherClaim };
      })
      .filter(r => r.claim);
  }, [selectedClaim, relationships, claims]);

  const activeReport = reports.find(r => r.id === activeReportId);

  const handleExtract = async () => {
    await extractClaims.mutateAsync(workspaceId);
  };

  const handleSynthesize = async () => {
    const result = await crossSynthesize.mutateAsync(workspaceId);
    setSynthesisResult({
      consensus_clusters: result.consensus_clusters,
      contradictions: result.contradictions,
      research_gaps: result.research_gaps,
    });
  };

  const handleGenerateReport = async () => {
    await generateReport.mutateAsync({ workspaceId, reportType });
  };

  const handleCopyReport = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Report copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const relTypeColor: Record<string, string> = {
    reinforces: "text-green-600 dark:text-green-400",
    contradicts: "text-red-600 dark:text-red-400",
    extends: "text-blue-600 dark:text-blue-400",
    related: "text-muted-foreground",
  };

  const relTypeBadge: Record<string, string> = {
    reinforces: "default",
    contradicts: "destructive",
    extends: "secondary",
    related: "outline",
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExtract}
          disabled={extractClaims.isPending}
        >
          {extractClaims.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Extract Claims
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleSynthesize}
          disabled={crossSynthesize.isPending || claims.length < 2}
        >
          {crossSynthesize.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Network className="h-3.5 w-3.5" />}
          Cross-Synthesize
        </Button>
        <div className="flex gap-1 ml-auto">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="synthesis">Synthesis</SelectItem>
              <SelectItem value="policy_brief">Policy Brief</SelectItem>
              <SelectItem value="grant_foundation">Grant Foundation</SelectItem>
              <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="gap-2"
            onClick={handleGenerateReport}
            disabled={generateReport.isPending || claims.length === 0}
          >
            {generateReport.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      {claims.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Card className="p-2">
            <p className="text-xs text-muted-foreground">Claims</p>
            <p className="text-lg font-bold">{claims.length}</p>
          </Card>
          <Card className="p-2">
            <p className="text-xs text-muted-foreground">Relationships</p>
            <p className="text-lg font-bold">{graphStats.total}</p>
          </Card>
          <Card className="p-2">
            <p className="text-xs text-green-600 dark:text-green-400">Reinforces</p>
            <p className="text-lg font-bold">{graphStats.reinforces}</p>
          </Card>
          <Card className="p-2">
            <p className="text-xs text-red-600 dark:text-red-400">Contradicts</p>
            <p className="text-lg font-bold">{graphStats.contradicts}</p>
          </Card>
          <Card className="p-2">
            <p className="text-xs text-blue-600 dark:text-blue-400">Extends</p>
            <p className="text-lg font-bold">{graphStats.extends}</p>
          </Card>
          <Card className="p-2">
            <p className="text-xs text-muted-foreground">Reports</p>
            <p className="text-lg font-bold">{reports.length}</p>
          </Card>
        </div>
      )}

      <Tabs defaultValue="claims" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="claims" className="text-xs">Claims</TabsTrigger>
          <TabsTrigger value="graph" className="text-xs">Graph</TabsTrigger>
          <TabsTrigger value="synthesis" className="text-xs">Synthesis</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
        </TabsList>

        {/* CLAIMS TAB */}
        <TabsContent value="claims">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Extracted Claims ({claims.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : claims.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No claims extracted yet. Click "Extract Claims" to begin.
                </p>
              ) : (
                <div className="flex gap-4">
                  {/* Claim List */}
                  <ScrollArea className="h-[400px] flex-1">
                    <div className="space-y-1.5 pr-2">
                      {claims.map(claim => (
                        <div
                          key={claim.id}
                          className={`p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                            selectedClaim?.id === claim.id ? "border-primary bg-primary/5" : "hover:bg-accent/30"
                          }`}
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[9px] px-1 py-0">{claim.claim_type}</Badge>
                            {claim.evidence_strength > 0 && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                evidence: {(claim.evidence_strength * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <p className="line-clamp-2">{claim.claim_text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Claim Detail */}
                  {selectedClaim && (
                    <div className="w-[280px] border-l pl-4 space-y-3">
                      <div>
                        <h5 className="text-xs font-semibold mb-1">Selected Claim</h5>
                        <p className="text-xs text-muted-foreground">{selectedClaim.claim_text}</p>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="outline" className="text-[9px]">{selectedClaim.claim_type}</Badge>
                          <Badge variant="secondary" className="text-[9px]">
                            conf: {(selectedClaim.confidence_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="text-xs font-semibold mb-1">Related Claims ({relatedClaims.length})</h5>
                        <ScrollArea className="max-h-[200px]">
                          <div className="space-y-1.5">
                            {relatedClaims.map(({ relationship, claim }) => (
                              <div key={relationship.id} className="p-1.5 rounded border text-[10px]">
                                <Badge variant={relTypeBadge[relationship.relationship_type] as any} className="text-[9px] mb-1">
                                  {relationship.relationship_type}
                                </Badge>
                                <p className="line-clamp-2 text-muted-foreground">{claim?.claim_text}</p>
                              </div>
                            ))}
                            {relatedClaims.length === 0 && (
                              <p className="text-[10px] text-muted-foreground">Run cross-synthesis first</p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Claim type distribution */}
              {Object.keys(claimTypes).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {Object.entries(claimTypes).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="text-[10px]">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GRAPH TAB */}
        <TabsContent value="graph">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Claim Relationship Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relationships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Run cross-synthesis to generate claim graph.
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {relationships.map(rel => {
                      const claimA = claims.find(c => c.id === rel.claim_id_a);
                      const claimB = claims.find(c => c.id === rel.claim_id_b);
                      if (!claimA || !claimB) return null;
                      return (
                        <div key={rel.id} className="p-3 rounded-lg border space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={relTypeBadge[rel.relationship_type] as any} className="text-[10px]">
                              {rel.relationship_type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              similarity: {(rel.similarity_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-muted/30">
                              <p className="font-medium text-[10px] text-muted-foreground mb-0.5">Claim A</p>
                              <p className="line-clamp-3">{claimA.claim_text}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30">
                              <p className="font-medium text-[10px] text-muted-foreground mb-0.5">Claim B</p>
                              <p className="line-clamp-3">{claimB.claim_text}</p>
                            </div>
                          </div>
                          {rel.ai_reasoning && (
                            <p className="text-[10px] text-muted-foreground italic">{rel.ai_reasoning}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYNTHESIS TAB */}
        <TabsContent value="synthesis">
          <div className="space-y-4">
            {/* Contradictions */}
            {synthesisResult?.contradictions && synthesisResult.contradictions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Contradictions ({synthesisResult.contradictions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {synthesisResult.contradictions.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs space-y-1">
                      <p><span className="font-semibold">Nature:</span> {c.nature}</p>
                      <p><span className="font-semibold">Possible Cause:</span> {c.possible_cause}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Consensus Clusters */}
            {synthesisResult?.consensus_clusters && synthesisResult.consensus_clusters.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Consensus Clusters ({synthesisResult.consensus_clusters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {synthesisResult.consensus_clusters.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{c.topic}</span>
                        <Badge variant={c.consensus_level === "high" ? "default" : c.consensus_level === "contested" ? "destructive" : "secondary"} className="text-[9px]">
                          {c.consensus_level}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{c.summary}</p>
                      <p className="text-[10px] text-muted-foreground">{c.claim_ids.length} supporting claims</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Research Gaps */}
            {synthesisResult?.research_gaps && synthesisResult.research_gaps.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Research Gaps ({synthesisResult.research_gaps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {synthesisResult.research_gaps.map((g, i) => (
                    <div key={i} className="p-3 rounded-lg border text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{g.topic}</span>
                        <Badge variant={g.severity === "high" ? "destructive" : "secondary"} className="text-[9px]">
                          {g.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{g.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {!synthesisResult && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Run cross-synthesis to see contradictions, consensus clusters, and research gaps.
              </p>
            )}
          </div>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Synthesis Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No reports generated yet.
                </p>
              ) : activeReport ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">{activeReport.title}</h4>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-[9px]">{activeReport.report_type}</Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          v{activeReport.version_number}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => handleCopyReport(activeReport.content.markdown)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveReportId(null)}>
                        Back
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                      <ReactMarkdown>{activeReport.content.markdown}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {reports.map(report => (
                      <div
                        key={report.id}
                        className="p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors"
                        onClick={() => setActiveReportId(report.id)}
                      >
                        <p className="text-sm font-medium">{report.title}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-[9px]">{report.report_type}</Badge>
                          <Badge variant="secondary" className="text-[9px]">
                            {report.content.claim_count} claims
                          </Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
