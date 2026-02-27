/**
 * ResearchMarketplacePanel — Global research marketplace with trust-weighted matching.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Plus, Globe, Users, Target, Shield, TrendingUp, Search, CheckCircle, AlertTriangle, Eye,
} from "lucide-react";
import {
  useExecutionOpportunities, useMyOpportunities, useCreateOpportunity,
  useOpportunityApplications, useApplyToOpportunity, useRunMatching,
  useRunTeamFormation, useUpdateApplicationStatus,
} from "@/hooks/useResearchMarketplace";

const OPP_TYPES = [
  { value: "research_collab", label: "Research Collaboration" },
  { value: "policy_implementation", label: "Policy Implementation" },
  { value: "enterprise_rnd", label: "Enterprise R&D" },
  { value: "grant_call", label: "Grant Call" },
];

export function ResearchMarketplacePanel() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);

  return (
    <Tabs defaultValue="browse" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="browse"><Globe className="h-3 w-3 mr-1" />Browse</TabsTrigger>
        <TabsTrigger value="post"><Plus className="h-3 w-3 mr-1" />Post</TabsTrigger>
        <TabsTrigger value="manage"><Target className="h-3 w-3 mr-1" />Manage</TabsTrigger>
        <TabsTrigger value="applications"><Users className="h-3 w-3 mr-1" />Applications</TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        <BrowseTab typeFilter={typeFilter} setTypeFilter={setTypeFilter} onSelect={setSelectedOppId} />
      </TabsContent>
      <TabsContent value="post"><PostTab /></TabsContent>
      <TabsContent value="manage"><ManageTab onSelectOpp={setSelectedOppId} /></TabsContent>
      <TabsContent value="applications">
        {selectedOppId ? <ApplicationsTab opportunityId={selectedOppId} /> : (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground"><Target className="h-8 w-8 mx-auto mb-2 opacity-30" />Select an opportunity from Browse or Manage tab</CardContent></Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

function BrowseTab({ typeFilter, setTypeFilter, onSelect }: { typeFilter: string; setTypeFilter: (v: string) => void; onSelect: (id: string) => void }) {
  const { data: opps = [], isLoading } = useExecutionOpportunities(typeFilter ? { type: typeFilter } : undefined);
  const apply = useApplyToOpportunity();
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appText, setAppText] = useState("");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Research Marketplace</CardTitle>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {OPP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : opps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No open opportunities found.</p>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {opps.map((opp: any) => (
                <div key={opp.id} className="p-4 rounded-lg border space-y-2 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{opp.title}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[10px]">{OPP_TYPES.find(t => t.value === opp.opportunity_type)?.label || opp.opportunity_type}</Badge>
                      {opp.cross_border_allowed && <Badge variant="secondary" className="text-[10px]"><Globe className="h-2 w-2 mr-0.5" />Cross-border</Badge>}
                    </div>
                  </div>
                  {opp.description && <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {opp.trust_threshold > 0 && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Trust ≥{opp.trust_threshold}</span>}
                    {opp.region_scope && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{opp.region_scope}</span>}
                    {(opp.budget_range_max || 0) > 0 && <span>${opp.budget_range_min?.toLocaleString()}–${opp.budget_range_max?.toLocaleString()}</span>}
                    {(opp.required_skills || []).length > 0 && <span>{opp.required_skills.slice(0, 3).join(", ")}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onSelect(opp.id)}><Eye className="h-3 w-3 mr-1" />View Apps</Button>
                    {applyingTo === opp.id ? (
                      <div className="flex gap-1 flex-1">
                        <Textarea placeholder="Your application..." value={appText} onChange={e => setAppText(e.target.value)} className="min-h-[40px] text-xs flex-1" />
                        <Button size="sm" disabled={!appText.trim() || apply.isPending} onClick={() => { apply.mutate({ opportunity_id: opp.id, application_text: appText }); setApplyingTo(null); setAppText(""); }}>
                          {apply.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setApplyingTo(opp.id)}><Plus className="h-3 w-3 mr-1" />Apply</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function PostTab() {
  const create = useCreateOpportunity();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("research_collab");
  const [desc, setDesc] = useState("");
  const [skills, setSkills] = useState("");
  const [region, setRegion] = useState("");
  const [trustThreshold, setTrustThreshold] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [crossBorder, setCrossBorder] = useState(true);
  const [teamMode, setTeamMode] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Post Opportunity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{OPP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="min-h-[80px]" />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Skills (comma-separated)" value={skills} onChange={e => setSkills(e.target.value)} />
          <Input placeholder="Region scope" value={region} onChange={e => setRegion(e.target.value)} />
          <Input placeholder="Budget min" type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} />
          <Input placeholder="Budget max" type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} />
          <Input placeholder="Trust threshold" type="number" value={trustThreshold} onChange={e => setTrustThreshold(e.target.value)} />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={crossBorder} onChange={e => setCrossBorder(e.target.checked)} className="rounded" /> Cross-border
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={teamMode} onChange={e => setTeamMode(e.target.checked)} className="rounded" /> Team formation
          </label>
        </div>
        <Button className="w-full" disabled={!title.trim() || create.isPending} onClick={() => {
          create.mutate({
            title, opportunity_type: type, description: desc || undefined,
            required_skills: skills ? skills.split(",").map(s => s.trim()) : [],
            region_scope: region || undefined, trust_threshold: Number(trustThreshold) || 0,
            budget_range_min: Number(budgetMin) || 0, budget_range_max: Number(budgetMax) || 0,
            cross_border_allowed: crossBorder, team_formation_enabled: teamMode,
          });
          setTitle(""); setDesc(""); setSkills(""); setRegion("");
        }}>
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Post Opportunity
        </Button>
      </CardContent>
    </Card>
  );
}

function ManageTab({ onSelectOpp }: { onSelectOpp: (id: string) => void }) {
  const { data: myOpps = [], isLoading } = useMyOpportunities();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> My Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : myOpps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No opportunities posted yet.</p>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {myOpps.map((opp: any) => (
                <div key={opp.id} className="p-3 rounded-lg border cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => onSelectOpp(opp.id)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{opp.title}</span>
                    <Badge variant={opp.status === "open" ? "default" : "secondary"} className="text-[10px]">{opp.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-[10px]">{opp.opportunity_type}</Badge>
                    {opp.team_formation_enabled && <Badge variant="secondary" className="text-[10px]"><Users className="h-2 w-2 mr-0.5" />Team mode</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsTab({ opportunityId }: { opportunityId: string }) {
  const { data: apps = [], isLoading } = useOpportunityApplications(opportunityId);
  const runMatch = useRunMatching();
  const runTeam = useRunTeamFormation();
  const updateStatus = useUpdateApplicationStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Applications ({apps.length})</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={runMatch.isPending} onClick={() => runMatch.mutate(opportunityId)}>
              {runMatch.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}Run Matching
            </Button>
            <Button size="sm" variant="outline" disabled={runTeam.isPending} onClick={() => runTeam.mutate(opportunityId)}>
              {runTeam.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Users className="h-3 w-3 mr-1" />}Form Team
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : apps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No applications yet.</p>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {apps.map((app: any) => {
                const explanation = app.match_explanation || {};
                return (
                  <div key={app.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{app.applicant_id?.substring(0, 8)}...</span>
                      <div className="flex gap-1">
                        <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{app.status}</Badge>
                        {app.matching_score > 0 && <Badge variant="outline" className="text-[10px]">Score: {app.matching_score}</Badge>}
                      </div>
                    </div>
                    {app.application_text && <p className="text-xs text-muted-foreground">{app.application_text}</p>}

                    {app.matching_score > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: "Expertise", value: app.expertise_match },
                            { label: "Trust", value: app.trust_match },
                            { label: "Claims", value: app.claim_match },
                            { label: "COI Risk", value: app.conflict_of_interest_risk },
                          ].map(m => (
                            <div key={m.label} className="text-center p-1 rounded bg-muted/50">
                              <span className="text-[10px] text-muted-foreground block">{m.label}</span>
                              <span className="text-xs font-bold">{m.value}</span>
                            </div>
                          ))}
                        </div>
                        <Progress value={app.matching_score} className="h-1" />

                        {/* Explainability */}
                        {explanation.why_matched && (
                          <div className="text-[10px] text-muted-foreground p-2 rounded bg-muted/30 space-y-1">
                            <p><strong>Why matched:</strong> {explanation.why_matched}</p>
                            {explanation.trust_impact && <p><strong>Trust:</strong> {explanation.trust_impact}</p>}
                            {(explanation.risk_factors || []).length > 0 && <p><strong>Risks:</strong> {explanation.risk_factors.join("; ")}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {!app.cross_border_compatible && (
                      <div className="flex items-center gap-1 text-[10px] text-destructive"><AlertTriangle className="h-3 w-3" />Cross-border incompatible</div>
                    )}

                    {app.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateStatus.mutate({ id: app.id, status: "shortlisted", opportunity_id: opportunityId })}>Shortlist</Button>
                        <Button size="sm" className="text-[10px] h-6" onClick={() => updateStatus.mutate({ id: app.id, status: "accepted", opportunity_id: opportunityId })}><CheckCircle className="h-3 w-3 mr-0.5" />Accept</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
