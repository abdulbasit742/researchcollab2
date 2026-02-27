/**
 * KnowledgeGraphPanel — Global Knowledge Graph dashboard for a research workspace.
 * Shows citation network, influence scores, cross-workspace links, and manipulation alerts.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Network, TrendingUp, AlertTriangle, Search,
  Link2, ArrowRight, Shield, BarChart3, Sparkles, Loader2,
} from "lucide-react";
import {
  useWorkspaceKnowledgeStats,
  useGlobalClaimSearch,
  useClaimCitations,
  useClaimInfluence,
  useCreateCitation,
  useDetectCitationManipulation,
  useDetectEmergingTopics,
  type ClaimCitation,
} from "@/hooks/useKnowledgeGraph";

interface KnowledgeGraphPanelProps {
  workspaceId: string;
}

export function KnowledgeGraphPanel({ workspaceId }: KnowledgeGraphPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const { data: stats, isLoading } = useWorkspaceKnowledgeStats(workspaceId);
  const { data: searchResults } = useGlobalClaimSearch(searchTerm);
  const { data: citations } = useClaimCitations(selectedClaimId ?? undefined);
  const { data: influence } = useClaimInfluence(selectedClaimId ?? undefined);
  const createCitation = useCreateCitation();
  const detectManipulation = useDetectCitationManipulation();
  const detectTopics = useDetectEmergingTopics();

  const [manipResults, setManipResults] = useState<any>(null);
  const [emergingTopics, setEmergingTopics] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
          <TabsTrigger value="search">Global Search</TabsTrigger>
          <TabsTrigger value="influence">Influence</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
        </TabsList>

        {/* === OVERVIEW === */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Claims", value: stats?.totalClaims ?? 0, icon: BarChart3 },
              { label: "Incoming Citations", value: stats?.totalIncomingCitations ?? 0, icon: Link2 },
              { label: "Cross-Workspace", value: stats?.crossWorkspaceCitations ?? 0, icon: Globe },
              { label: "Support Ratio", value: stats?.totalIncomingCitations ? `${((stats.supportCount / stats.totalIncomingCitations) * 100).toFixed(0)}%` : "N/A", icon: Shield },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-xl font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Citation type breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Citation Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Supports", count: stats?.supportCount ?? 0, color: "bg-emerald-500" },
                  { label: "Extends", count: stats?.extendsCount ?? 0, color: "bg-blue-500" },
                  { label: "References", count: stats?.refCount ?? 0, color: "bg-amber-500" },
                  { label: "Contradicts", count: stats?.contradictCount ?? 0, color: "bg-red-500" },
                ].map((item) => {
                  const total = stats?.totalIncomingCitations || 1;
                  const pct = (item.count / total) * 100;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs w-24 text-muted-foreground">{item.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top influential claims */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Influential Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {(stats?.topClaims ?? []).map((claim: any) => (
                    <div
                      key={claim.id}
                      className="p-2 rounded border hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedClaimId(claim.id)}
                    >
                      <p className="text-sm line-clamp-2">{claim.claim_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{claim.claim_type}</Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          CIS: {Number(claim.claim_influence_score || 0).toFixed(1)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {claim.citation_count || 0} citations
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === CITATIONS === */}
        <TabsContent value="citations" className="space-y-4">
          {selectedClaimId ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Selected Claim</Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedClaimId(null)}>
                  Clear
                </Button>
              </div>

              {/* Incoming */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Incoming Citations ({citations?.incoming.length ?? 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {citations?.incoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No incoming citations yet</p>
                  ) : (
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-1">
                        {citations?.incoming.map((c: ClaimCitation) => (
                          <div key={c.id} className="flex items-center gap-2 p-2 rounded border text-xs">
                            <Badge variant={c.citation_type === "contradicts" ? "destructive" : "default"} className="text-[10px]">
                              {c.citation_type}
                            </Badge>
                            <span className="truncate text-muted-foreground">{c.citing_claim_id.slice(0, 8)}...</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-muted-foreground">this claim</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Outgoing */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Outgoing Citations ({citations?.outgoing.length ?? 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {citations?.outgoing.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This claim doesn't cite others</p>
                  ) : (
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-1">
                        {citations?.outgoing.map((c: ClaimCitation) => (
                          <div key={c.id} className="flex items-center gap-2 p-2 rounded border text-xs">
                            <span className="text-muted-foreground">this claim</span>
                            <ArrowRight className="h-3 w-3" />
                            <Badge variant={c.citation_type === "contradicts" ? "destructive" : "default"} className="text-[10px]">
                              {c.citation_type}
                            </Badge>
                            <span className="truncate text-muted-foreground">{c.cited_claim_id.slice(0, 8)}...</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Influence */}
              {influence && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Claim Influence Score: {Number(influence.claim_influence_score).toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Citations", influence.citation_count],
                        ["Supports", influence.support_count],
                        ["Contradictions", influence.contradiction_count],
                        ["Extensions", influence.extension_count],
                        ["Institution Diversity", influence.institution_diversity],
                        ["Cross-Border", influence.cross_border_citations],
                        ["Policy Adoptions", influence.policy_adoption_count],
                        ["Project Implementations", influence.project_implementation_count],
                      ].map(([label, val]) => (
                        <div key={label as string} className="flex justify-between p-1 rounded bg-muted/50">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Network className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select a claim from the Overview tab to view its citation network
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === GLOBAL SEARCH === */}
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search global claim registry (min 3 chars)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults && searchResults.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{searchResults.length} claims found</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {searchResults.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-3 rounded border hover:bg-accent/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedClaimId(claim.id)}
                      >
                        <p className="text-sm">{claim.claim_text}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{claim.claim_type}</Badge>
                          {claim.domain_category && (
                            <Badge variant="secondary" className="text-[10px]">{claim.domain_category}</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            CIS: {Number(claim.claim_influence_score).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {claim.citation_count} citations
                          </span>
                          {claim.workspace_id !== workspaceId && (
                            <Badge variant="outline" className="text-[10px] border-primary/30">
                              <Globe className="h-3 w-3 mr-0.5" />
                              External
                            </Badge>
                          )}
                        </div>
                        {claim.workspace_id !== workspaceId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Cite this external claim from the workspace
                              toast.info("Select a claim in your workspace to create a citation link");
                            }}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Cite in this workspace
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === INFLUENCE === */}
        <TabsContent value="influence" className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await detectTopics.mutateAsync({ workspaceId });
              setEmergingTopics(result);
            }}
            disabled={detectTopics.isPending}
          >
            {detectTopics.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
            Detect Emerging Topics
          </Button>

          {emergingTopics?.topics && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Emerging Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emergingTopics.topics.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded border">
                      <Badge variant={t.severity === "high" ? "default" : "secondary"} className="text-[10px]">
                        {t.severity}
                      </Badge>
                      <span className="text-sm flex-1">{t.topic}</span>
                      <span className="text-xs text-muted-foreground">{t.claim_count} claims</span>
                      <Badge variant="outline" className="text-[10px]">↑{t.growth_rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top claims by influence */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Influence Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {(stats?.topClaims ?? []).map((claim: any, idx: number) => (
                    <div key={claim.id} className="flex items-center gap-3 p-2 rounded border">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{claim.claim_text}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        CIS: {Number(claim.claim_influence_score || 0).toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === INTEGRITY === */}
        <TabsContent value="integrity" className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await detectManipulation.mutateAsync(workspaceId);
              setManipResults(result);
            }}
            disabled={detectManipulation.isPending}
          >
            {detectManipulation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
            Scan for Citation Manipulation
          </Button>

          {manipResults && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Integrity Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {manipResults.flags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">✓ No manipulation patterns detected</p>
                ) : (
                  <div className="space-y-2">
                    {manipResults.flags.map((flag: any, i: number) => (
                      <div key={i} className="p-2 rounded border border-destructive/30 bg-destructive/5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <Badge variant="destructive" className="text-[10px]">{flag.flag_type}</Badge>
                          <Badge variant="outline" className="text-[10px]">{flag.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{manipResults.summary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-export for the knowledge barrel
import { toast } from "sonner";
