/**
 * CARCResponsePanel — Constraint-Aware Research Copilot response display.
 * Shows structured evidence, inferences, hypotheses, fallacies, compliance flags, and uncertainty metrics.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Shield, AlertTriangle, Search, Loader2, Brain,
  Eye, Scale, FileWarning, CheckCircle, XCircle,
  Beaker, Quote, BarChart3, ShieldAlert,
} from "lucide-react";
import { useCARCQuery, type CARCResponse } from "@/hooks/useConstraintAwareQuery";

interface CARCPanelProps {
  workspaceId: string;
}

const STRENGTH_COLORS: Record<string, string> = {
  empirically_strong: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
  moderately_supported: "bg-blue-500/10 text-blue-700 border-blue-300",
  preliminary: "bg-amber-500/10 text-amber-700 border-amber-300",
  speculative: "bg-orange-500/10 text-orange-700 border-orange-300",
  contested: "bg-red-500/10 text-red-700 border-red-300",
  unverified: "bg-muted text-muted-foreground border-muted",
};

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-700",
  moderate: "bg-amber-500/10 text-amber-700",
  high: "bg-red-500/10 text-red-700",
  exploratory: "bg-purple-500/10 text-purple-700",
};

export function CARCResponsePanel({ workspaceId }: CARCPanelProps) {
  const [queryText, setQueryText] = useState("");
  const [complianceMode, setComplianceMode] = useState(false);
  const [multiHypothesis, setMultiHypothesis] = useState(false);
  const [response, setResponse] = useState<CARCResponse | null>(null);

  const carcQuery = useCARCQuery();

  const handleQuery = async () => {
    if (!queryText.trim()) return;
    const result = await carcQuery.mutateAsync({
      workspaceId,
      queryText: queryText.trim(),
      complianceMode,
      multiHypothesis,
    });
    setResponse(result);
  };

  return (
    <div className="space-y-4">
      {/* Query Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Constraint-Aware Research Copilot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Ask a research question with full reasoning transparency..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="min-h-[60px] resize-none"
            disabled={carcQuery.isPending}
          />
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch id="compliance" checked={complianceMode} onCheckedChange={setComplianceMode} />
              <Label htmlFor="compliance" className="text-xs">Compliance Mode</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="hypothesis" checked={multiHypothesis} onCheckedChange={setMultiHypothesis} />
              <Label htmlFor="hypothesis" className="text-xs">Multi-Hypothesis</Label>
            </div>
            <Button onClick={handleQuery} disabled={carcQuery.isPending || !queryText.trim()} size="sm">
              {carcQuery.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <div className="space-y-4">
          {/* Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: "Confidence", value: response.confidence_score, icon: Shield },
              { label: "Data Complete", value: response.data_completeness, icon: BarChart3 },
              { label: "Evidence Density", value: response.evidence_density, icon: Eye },
              { label: "Contradiction Risk", value: response.contradiction_risk, icon: AlertTriangle },
              { label: "Risk Level", value: response.risk_level, icon: ShieldAlert, isText: true },
              { label: "Halluc. Check", value: response.hallucination_check_passed ? "PASS" : "FAIL", icon: response.hallucination_check_passed ? CheckCircle : XCircle, isText: true },
            ].map(({ label, value, icon: Icon, isText }) => (
              <Card key={label}>
                <CardContent className="pt-3 pb-2 px-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                  {isText ? (
                    <Badge variant="outline" className={`text-[10px] ${typeof value === "string" && RISK_COLORS[value] ? RISK_COLORS[value] : ""}`}>
                      {String(value)}
                    </Badge>
                  ) : (
                    <>
                      <p className="text-sm font-bold">{((value as number) * 100).toFixed(0)}%</p>
                      <Progress value={(value as number) * 100} className="h-1 mt-1" />
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {response._parse_warning && (
            <Card className="border-amber-300 bg-amber-50/50">
              <CardContent className="pt-3 pb-2">
                <p className="text-xs text-amber-700">⚠ {response._parse_warning}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-6 w-full text-xs">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
              <TabsTrigger value="counter">Counter</TabsTrigger>
              <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            {/* SUMMARY */}
            <TabsContent value="summary">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed">{response.summary}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EVIDENCE */}
            <TabsContent value="evidence" className="space-y-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Direct Evidence ({response.evidence.length})</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {response.evidence.map((ev, i) => (
                        <div key={i} className={`p-2 rounded border ${STRENGTH_COLORS[ev.strength] || ""}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">[Source {ev.source_index}]</Badge>
                            <Badge variant="outline" className="text-[10px]">{ev.strength.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm">{ev.statement}</p>
                        </div>
                      ))}
                      {response.evidence.length === 0 && <p className="text-sm text-muted-foreground">No direct evidence extracted</p>}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Unknowns */}
              {response.unknowns.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileWarning className="h-4 w-4" /> Unknowns ({response.unknowns.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {response.unknowns.map((u, i) => (
                        <div key={i} className="p-2 rounded border bg-muted/30">
                          <p className="text-sm">{u.statement}</p>
                          <p className="text-xs text-muted-foreground mt-1">Needed: {u.what_would_help}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* REASONING */}
            <TabsContent value="reasoning" className="space-y-3">
              {/* Inferences */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Inferences ({response.inferences.length})</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[250px]">
                    <div className="space-y-2">
                      {response.inferences.map((inf, i) => (
                        <div key={i} className="p-2 rounded border">
                          <p className="text-sm">{inf.statement}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              Confidence: {(inf.confidence * 100).toFixed(0)}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              Based on: {inf.based_on_sources.map(s => `[S${s}]`).join(", ")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 italic">{inf.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Assumptions */}
              {response.assumptions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Assumptions ({response.assumptions.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {response.assumptions.map((a, i) => (
                        <div key={i} className="p-2 rounded border bg-amber-50/30">
                          <p className="text-sm">{a.statement}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.justification}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fallacy Flags */}
              {response.fallacy_flags.length > 0 && (
                <Card className="border-destructive/30">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Logical Fallacy Flags ({response.fallacy_flags.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {response.fallacy_flags.map((f, i) => (
                        <div key={i} className="p-2 rounded border border-destructive/20 bg-destructive/5">
                          <Badge variant="destructive" className="text-[10px] mb-1">{f.type}</Badge>
                          <p className="text-sm">{f.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Affected: {f.affected_claim}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* COUNTER-ARGUMENTS */}
            <TabsContent value="counter">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4" /> Counter-Arguments</CardTitle></CardHeader>
                <CardContent>
                  {response.counter_arguments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No significant counter-arguments identified</p>
                  ) : (
                    <div className="space-y-3">
                      {response.counter_arguments.map((ca, i) => (
                        <div key={i} className="p-3 rounded border">
                          <p className="text-sm font-medium">{ca.position}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ca.supporting_evidence}</p>
                          <Progress value={ca.strength * 100} className="h-1 mt-2" />
                          <span className="text-[10px] text-muted-foreground">Strength: {(ca.strength * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HYPOTHESES */}
            <TabsContent value="hypotheses">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Beaker className="h-4 w-4" /> Multi-Hypothesis Analysis</CardTitle></CardHeader>
                <CardContent>
                  {!response.hypotheses || response.hypotheses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Enable Multi-Hypothesis mode and re-query to see competing hypotheses</p>
                  ) : (
                    <div className="space-y-3">
                      {response.hypotheses.map((h, i) => (
                        <div key={i} className="p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="default" className="text-xs">{h.label}</Badge>
                            <Badge variant="outline" className="text-[10px]">
                              Confidence: {(h.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-sm">{h.statement}</p>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Supporting: </span>
                              {h.supporting_evidence.map(s => `[S${s}]`).join(", ") || "None"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contradicting: </span>
                              {h.contradicting_evidence.map(s => `[S${s}]`).join(", ") || "None"}
                            </div>
                          </div>
                          {h.assumptions.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Assumes: {h.assumptions.join("; ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AUDIT */}
            <TabsContent value="audit" className="space-y-3">
              {/* Compliance */}
              {response.compliance_flags && response.compliance_flags.length > 0 && (
                <Card className="border-amber-300">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" /> Compliance Flags</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {response.compliance_flags.map((cf, i) => (
                        <div key={i} className="p-2 rounded border bg-amber-50/30">
                          <div className="flex items-center gap-2">
                            <Badge variant={cf.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{cf.type}</Badge>
                            <Badge variant="outline" className="text-[10px]">{cf.severity}</Badge>
                          </div>
                          <p className="text-sm mt-1">{cf.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sources Used */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Quote className="h-4 w-4" /> Retrieved Sources ({response.citation_map.length})</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-1">
                      {response.citation_map.map((c) => (
                        <div key={c.chunk_id} className="flex items-center gap-2 p-1.5 rounded text-xs border">
                          <Badge variant="outline" className="text-[10px]">S{c.source_index}</Badge>
                          <span className="truncate flex-1">{c.document_name}</span>
                          <span className="text-muted-foreground">rel: {c.relevance_score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Hallucination check */}
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  {response.hallucination_check_passed ? (
                    <><CheckCircle className="h-5 w-5 text-emerald-500" /><span className="text-sm">Hallucination safety check passed — all claims traceable to sources</span></>
                  ) : (
                    <><XCircle className="h-5 w-5 text-destructive" /><span className="text-sm">Hallucination detected — some source references are invalid</span></>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
