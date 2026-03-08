import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Building2, Globe, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { getSponsorLeads, updateSponsorLead, invokeRevOptimizer } from "@/lib/revenue/revenueOptimizer";

export default function SponsorDiscoveryPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: leads } = useQuery({
    queryKey: ["sponsor-leads", statusFilter],
    queryFn: () => getSponsorLeads(statusFilter || undefined),
    staleTime: 60_000,
  });

  const discover = useMutation({
    mutationFn: () => invokeRevOptimizer("find_sponsors", { timestamp: new Date().toISOString() }),
    onSuccess: () => { toast.success("Sponsor discovery complete"); qc.invalidateQueries({ queryKey: ["sponsor-leads"] }); },
    onError: () => toast.error("Discovery failed"),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSponsorLead(id, { outreach_status: status }),
    onSuccess: () => { toast.success("Lead updated"); qc.invalidateQueries({ queryKey: ["sponsor-leads"] }); },
  });

  return (
    <>
      <Helmet><title>Sponsor Discovery | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sponsor Discovery</h1>
            <p className="text-muted-foreground">AI-powered sponsor identification and outreach</p>
          </div>
          <Button onClick={() => discover.mutate()} disabled={discover.isPending}>
            <Target className="h-4 w-4 mr-2" /> Discover Sponsors
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{(leads ?? []).length}</p><p className="text-sm text-muted-foreground">Total Leads</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{(leads ?? []).filter((l: any) => l.outreach_status === "contacted").length}</p><p className="text-sm text-muted-foreground">Contacted</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">${(leads ?? []).reduce((s: number, l: any) => s + (l.estimated_budget ?? 0), 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Est. Budget Pool</p></div>
          </CardContent></Card>
        </div>

        <div className="flex gap-2">
          {["", "identified", "contacted", "negotiating", "converted"].map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
              {s || "All"}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {(leads ?? []).map((lead: any) => (
            <Card key={lead.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg text-foreground">{lead.company_name}</h3>
                      <Badge variant="outline">{lead.industry}</Badge>
                      <Badge variant={lead.outreach_status === "converted" ? "default" : "secondary"}>{lead.outreach_status}</Badge>
                    </div>
                    {lead.match_reason && <p className="text-sm text-muted-foreground">{lead.match_reason}</p>}
                    <div className="flex gap-1 flex-wrap">{(lead.target_domains ?? []).map((d: string) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}</div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xl font-bold text-primary">{Math.round((lead.match_score ?? 0) * 100)}%</p>
                    <p className="text-sm text-muted-foreground">${(lead.estimated_budget ?? 0).toLocaleString()}</p>
                    <div className="flex gap-1">
                      {lead.outreach_status === "identified" && (
                        <Button size="sm" variant="outline" onClick={() => updateLead.mutate({ id: lead.id, status: "contacted" })}>
                          <Mail className="h-3 w-3 mr-1" /> Contact
                        </Button>
                      )}
                      {lead.outreach_status === "contacted" && (
                        <Button size="sm" onClick={() => updateLead.mutate({ id: lead.id, status: "negotiating" })}>
                          <ArrowRight className="h-3 w-3 mr-1" /> Negotiate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(leads ?? []).length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">
              No sponsor leads yet — run AI discovery to identify potential sponsors
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
