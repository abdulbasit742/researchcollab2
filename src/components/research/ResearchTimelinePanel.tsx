/**
 * ResearchTimelinePanel — Longitudinal research memory: version history, consensus shifts, claim evolution.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, History, Lock, Archive, Camera, TrendingUp,
  TrendingDown, AlertTriangle, GitBranch, Activity, Shield,
} from "lucide-react";
import {
  useWorkspaceVersions,
  useCreateVersionSnapshot,
  useLockVersion,
  useArchiveVersion,
  useTopicConsensusHistory,
  useConsensusShifts,
  useClaimMutationLog,
  useImpactEvents,
  type WorkspaceVersion,
  type ConsensusShift,
  type ConsensusAlert,
} from "@/hooks/useResearchMemory";
import { useWorkspaceClaims, type ResearchClaim } from "@/hooks/useCrossSynthesis";

interface ResearchTimelinePanelProps {
  workspaceId: string;
}

export function ResearchTimelinePanel({ workspaceId }: ResearchTimelinePanelProps) {
  const { data: versions = [], isLoading: versionsLoading } = useWorkspaceVersions(workspaceId);
  const { data: consensusHistory = [] } = useTopicConsensusHistory(workspaceId);
  const { data: mutationLog = [] } = useClaimMutationLog(workspaceId);
  const { data: impactEvents = [] } = useImpactEvents(workspaceId);
  const { data: claims = [] } = useWorkspaceClaims(workspaceId);

  const createSnapshot = useCreateVersionSnapshot();
  const lockVersion = useLockVersion();
  const archiveVersion = useArchiveVersion();
  const detectShifts = useConsensusShifts();

  const [shifts, setShifts] = useState<ConsensusShift[]>([]);
  const [alerts, setAlerts] = useState<ConsensusAlert[]>([]);
  const [compareVersions, setCompareVersions] = useState<[WorkspaceVersion | null, WorkspaceVersion | null]>([null, null]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // Group consensus by topic
  const topicGroups = useMemo(() => {
    const map: Record<string, typeof consensusHistory> = {};
    consensusHistory.forEach(h => {
      if (!map[h.topic]) map[h.topic] = [];
      map[h.topic].push(h);
    });
    return map;
  }, [consensusHistory]);

  // Build claim lineage tree for selected claim
  const claimLineage = useMemo(() => {
    if (!selectedClaimId) return [];
    const lineage: ResearchClaim[] = [];
    let current = claims.find(c => c.id === selectedClaimId);
    if (current) {
      lineage.push(current);
      // Walk up revision_parent_id chain
      let parentId = (current as any).revision_parent_id;
      while (parentId) {
        const parent = claims.find(c => c.id === parentId);
        if (parent) {
          lineage.push(parent);
          parentId = (parent as any).revision_parent_id;
        } else break;
      }
      // Walk down: find children
      const children = claims.filter(c => (c as any).revision_parent_id === selectedClaimId);
      lineage.push(...children);
    }
    return lineage;
  }, [selectedClaimId, claims]);

  const handleDetectShifts = async () => {
    const result = await detectShifts.mutateAsync(workspaceId);
    setShifts(result.shifts);
    setAlerts(result.alerts);
  };

  // Version comparison
  const versionDiff = useMemo(() => {
    const [v1, v2] = compareVersions;
    if (!v1 || !v2) return null;
    return {
      claim_delta: v2.claim_count - v1.claim_count,
      doc_delta: v2.document_count - v1.document_count,
      v1_graph: v1.claim_graph_snapshot || {},
      v2_graph: v2.claim_graph_snapshot || {},
    };
  }, [compareVersions]);

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline" size="sm" className="gap-2"
          onClick={() => createSnapshot.mutate({ workspaceId })}
          disabled={createSnapshot.isPending}
        >
          {createSnapshot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          Save Snapshot
        </Button>
        <Button
          variant="outline" size="sm" className="gap-2"
          onClick={handleDetectShifts}
          disabled={detectShifts.isPending}
        >
          {detectShifts.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
          Detect Shifts
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-destructive/30 bg-destructive/5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              <span>{a.message}</span>
              <Badge variant="destructive" className="text-[9px] ml-auto">{a.severity}</Badge>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          <TabsTrigger value="consensus" className="text-xs">Consensus</TabsTrigger>
          <TabsTrigger value="lineage" className="text-xs">Lineage</TabsTrigger>
          <TabsTrigger value="mutations" className="text-xs">Audit</TabsTrigger>
        </TabsList>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Version Timeline ({versions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versionsLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No versions yet. Run cross-synthesis or save a snapshot.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Version comparison */}
                  {compareVersions[0] && compareVersions[1] && versionDiff && (
                    <div className="p-3 rounded-lg border bg-muted/20 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          v{compareVersions[0].version_number} → v{compareVersions[1].version_number}
                        </span>
                        <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setCompareVersions([null, null])}>
                          Clear
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Claims: <span className={versionDiff.claim_delta > 0 ? "text-green-600" : "text-red-600"}>
                          {versionDiff.claim_delta > 0 ? "+" : ""}{versionDiff.claim_delta}
                        </span></div>
                        <div>Docs: <span className={versionDiff.doc_delta > 0 ? "text-green-600" : "text-red-600"}>
                          {versionDiff.doc_delta > 0 ? "+" : ""}{versionDiff.doc_delta}
                        </span></div>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-[350px]">
                    <div className="relative pl-6">
                      {/* Timeline line */}
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-3">
                        {versions.map((v) => (
                          <div key={v.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-4 top-2 h-3 w-3 rounded-full border-2 ${
                              v.is_locked ? "bg-primary border-primary" : v.is_archived ? "bg-muted-foreground border-muted-foreground" : "bg-background border-primary"
                            }`} />
                            <div className="p-3 rounded-lg border hover:bg-accent/20 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold">Version {v.version_number}</span>
                                <div className="flex gap-1">
                                  {v.is_locked && <Lock className="h-3 w-3 text-primary" />}
                                  {v.is_archived && <Archive className="h-3 w-3 text-muted-foreground" />}
                                  <Badge variant="outline" className="text-[9px]">
                                    {v.claim_count} claims · {v.document_count} docs
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{v.summary_snapshot}</p>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span>{new Date(v.created_at).toLocaleString()}</span>
                                <div className="ml-auto flex gap-1">
                                  <Button
                                    variant="ghost" size="sm" className="h-5 text-[9px] px-1"
                                    onClick={() => {
                                      if (!compareVersions[0]) setCompareVersions([v, null]);
                                      else if (!compareVersions[1]) setCompareVersions([compareVersions[0], v]);
                                      else setCompareVersions([v, null]);
                                    }}
                                  >
                                    Compare
                                  </Button>
                                  {!v.is_locked && (
                                    <Button
                                      variant="ghost" size="sm" className="h-5 text-[9px] px-1"
                                      onClick={() => lockVersion.mutate({ versionId: v.id, workspaceId })}
                                    >
                                      <Lock className="h-2.5 w-2.5 mr-0.5" /> Lock
                                    </Button>
                                  )}
                                  {!v.is_archived && (
                                    <Button
                                      variant="ghost" size="sm" className="h-5 text-[9px] px-1"
                                      onClick={() => archiveVersion.mutate({ versionId: v.id, workspaceId })}
                                    >
                                      <Archive className="h-2.5 w-2.5 mr-0.5" /> Archive
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONSENSUS TAB */}
        <TabsContent value="consensus">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Consensus Evolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(topicGroups).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Run cross-synthesis across multiple versions to track consensus evolution.
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {Object.entries(topicGroups).map(([topic, entries]) => {
                      const latest = entries[entries.length - 1];
                      const first = entries[0];
                      const delta = entries.length > 1 ? latest.consensus_score - first.consensus_score : 0;
                      return (
                        <div key={topic} className="p-3 rounded-lg border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{topic}</span>
                            <div className="flex items-center gap-1">
                              {delta > 0 ? (
                                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                              ) : delta < 0 ? (
                                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                              ) : null}
                              <Badge variant={latest.consensus_score >= 0.7 ? "default" : latest.consensus_score <= 0.3 ? "destructive" : "secondary"} className="text-[10px]">
                                {(latest.consensus_score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                          {/* Mini timeline */}
                          <div className="flex items-end gap-1 h-8">
                            {entries.map((e, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t bg-primary/60 transition-all"
                                style={{ height: `${Math.max(e.consensus_score * 100, 5)}%` }}
                                title={`v${e.version_number}: ${(e.consensus_score * 100).toFixed(0)}%`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>v{first.version_number}</span>
                            <span>{latest.claim_count} claims · {latest.reinforcement_count} reinforcing · {latest.contradiction_count} contradicting</span>
                            <span>v{latest.version_number}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Detected shifts */}
              {shifts.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <h4 className="text-xs font-semibold mb-2">Detected Shifts</h4>
                  <div className="space-y-1">
                    {shifts.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded border text-xs">
                        {s.direction === "strengthening" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="flex-1">{s.topic}</span>
                        <Badge variant={s.direction === "strengthening" ? "default" : "destructive"} className="text-[9px]">
                          {s.delta > 0 ? "+" : ""}{(s.delta * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">v{s.from_version}→v{s.to_version}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINEAGE TAB */}
        <TabsContent value="lineage">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                Claim Lineage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* Claim selector */}
                <ScrollArea className="h-[350px] w-[200px] border-r pr-3">
                  <div className="space-y-1">
                    {claims.map(c => (
                      <div
                        key={c.id}
                        className={`p-1.5 rounded text-[10px] cursor-pointer transition-colors ${
                          selectedClaimId === c.id ? "bg-primary/10 border border-primary" : "hover:bg-accent/30"
                        }`}
                        onClick={() => setSelectedClaimId(c.id)}
                      >
                        <p className="line-clamp-2">{c.claim_text}</p>
                      </div>
                    ))}
                    {claims.length === 0 && (
                      <p className="text-[10px] text-muted-foreground">Extract claims first</p>
                    )}
                  </div>
                </ScrollArea>

                {/* Lineage view */}
                <div className="flex-1">
                  {selectedClaimId && claimLineage.length > 0 ? (
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-2">
                        {claimLineage.map((c, i) => (
                          <div key={c.id} className="relative">
                            <div className={`absolute -left-4 top-2 h-2.5 w-2.5 rounded-full border-2 ${
                              c.id === selectedClaimId ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                            }`} />
                            <div className={`p-2 rounded-lg border text-xs ${
                              c.id === selectedClaimId ? "border-primary bg-primary/5" : ""
                            }`}>
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="outline" className="text-[9px]">{c.claim_type}</Badge>
                                <Badge variant={
                                  (c as any).status === "active" ? "default" :
                                  (c as any).status === "deprecated" ? "secondary" :
                                  (c as any).status === "contested" ? "destructive" : "outline"
                                } className="text-[9px]">
                                  {(c as any).status || "active"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">{c.claim_text}</p>
                              <p className="text-[9px] text-muted-foreground mt-1">
                                Evidence: {(c.evidence_strength * 100).toFixed(0)}% · 
                                {new Date(c.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Select a claim to view its evolution lineage
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="mutations">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Claim Mutation Audit ({mutationLog.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mutationLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No claim mutations recorded yet.
                </p>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-1.5">
                    {mutationLog.map(m => (
                      <div key={m.id} className="p-2 rounded-lg border text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            m.mutation_type === "status_change" ? "destructive" :
                            m.mutation_type === "evidence_updated" ? "default" : "secondary"
                          } className="text-[9px]">
                            {m.mutation_type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(m.created_at).toLocaleString()}
                          </span>
                        </div>
                        {m.old_values && m.new_values && (
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-1 rounded bg-red-500/5">
                              <span className="font-medium">Before:</span>
                              <p className="text-muted-foreground line-clamp-2">
                                {m.old_values.status && `Status: ${m.old_values.status}`}
                                {m.old_values.evidence_strength !== undefined && ` Evidence: ${(m.old_values.evidence_strength * 100).toFixed(0)}%`}
                              </p>
                            </div>
                            <div className="p-1 rounded bg-green-500/5">
                              <span className="font-medium">After:</span>
                              <p className="text-muted-foreground line-clamp-2">
                                {m.new_values.status && `Status: ${m.new_values.status}`}
                                {m.new_values.evidence_strength !== undefined && ` Evidence: ${(m.new_values.evidence_strength * 100).toFixed(0)}%`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Impact events */}
              {impactEvents.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <h4 className="text-xs font-semibold mb-2">Knowledge Impact Events</h4>
                  <ScrollArea className="max-h-[150px]">
                    <div className="space-y-1">
                      {impactEvents.map(e => (
                        <div key={e.id} className="flex items-center gap-2 p-1.5 rounded border text-[10px]">
                          <Badge variant="outline" className="text-[9px]">{e.event_type}</Badge>
                          {e.trust_delta !== 0 && (
                            <span className={e.trust_delta > 0 ? "text-green-600" : "text-red-600"}>
                              Δ{e.trust_delta > 0 ? "+" : ""}{e.trust_delta}
                            </span>
                          )}
                          <span className="text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
