import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, Clock, Shield, AlertTriangle, BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function SuperAdminIncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState("");
  const [postmortem, setPostmortem] = useState({ root_cause_summary: "", contributing_factors: "", resolution_summary: "", preventive_actions: "" });

  const { data: incident } = useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_registry").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: statusHistory = [] } = useQuery({
    queryKey: ["incident-history", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_status_history").select("*").eq("incident_id", id!).order("changed_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: runbookLinks = [] } = useQuery({
    queryKey: ["incident-runbook-links", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_runbook_links").select("*, operational_runbooks(*)").eq("incident_id", id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: runbooks = [] } = useQuery({
    queryKey: ["all-runbooks"],
    queryFn: async () => {
      const { data } = await supabase.from("operational_runbooks").select("*");
      return data ?? [];
    },
  });

  const { data: acknowledgments = [] } = useQuery({
    queryKey: ["incident-acks", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_acknowledgments").select("*").eq("incident_id", id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: existingPostmortem } = useQuery({
    queryKey: ["incident-postmortem", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_postmortems").select("*").eq("incident_id", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: incidentMetrics } = useQuery({
    queryKey: ["incident-metric", id],
    queryFn: async () => {
      const { data } = await supabase.from("incident_metrics").select("*").eq("incident_id", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async () => {
      if (!newStatus || !incident) return;
      await supabase.from("incident_status_history").insert({
        incident_id: id!,
        previous_status: incident.status,
        new_status: newStatus,
        changed_by: user?.id,
      });
      const updates: any = { status: newStatus };
      if (newStatus === "resolved") updates.resolved_at = new Date().toISOString();
      await supabase.from("incident_registry").update(updates).eq("id", id!);

      // Auto-compute metrics on resolution
      if (newStatus === "resolved" && incident.created_at) {
        const mins = Math.round((Date.now() - new Date(incident.created_at).getTime()) / 60000);
        await supabase.from("incident_metrics").insert({
          incident_id: id!,
          time_to_resolution_minutes: mins,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["incident-history", id] });
      queryClient.invalidateQueries({ queryKey: ["incident-metric", id] });
      setNewStatus("");
      toast.success("Status updated");
    },
  });

  const acknowledge = useMutation({
    mutationFn: async () => {
      await supabase.from("incident_acknowledgments").insert({ incident_id: id!, acknowledged_by: user?.id! });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-acks", id] });
      toast.success("Acknowledged");
    },
  });

  const linkRunbook = useMutation({
    mutationFn: async (runbookId: string) => {
      await supabase.from("incident_runbook_links").insert({ incident_id: id!, runbook_id: runbookId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-runbook-links", id] });
      toast.success("Runbook linked");
    },
  });

  const savePostmortem = useMutation({
    mutationFn: async () => {
      await supabase.from("incident_postmortems").insert({ incident_id: id!, ...postmortem });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-postmortem", id] });
      toast.success("Postmortem saved");
    },
  });

  if (!incident) return <SuperAdminGuard><SuperAdminLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></SuperAdminLayout></SuperAdminGuard>;

  const isAcked = acknowledgments.some(a => a.acknowledged_by === user?.id);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/super-admin/incidents")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Incidents
          </Button>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{incident.title}</h1>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{incident.incident_type}</Badge>
                <Badge variant={incident.severity_level === "critical" || incident.severity_level === "high" ? "destructive" : "secondary"}>{incident.severity_level}</Badge>
                <Badge>{incident.status}</Badge>
              </div>
            </div>
            {!isAcked && incident.status !== "resolved" && (
              <Button size="sm" variant="outline" onClick={() => acknowledge.mutate()} className="gap-2">
                <CheckCircle className="h-4 w-4" /> Acknowledge
              </Button>
            )}
          </div>

          {/* Description & Metrics */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{incident.description || "No description provided."}</p>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Detected by:</span> {incident.detected_by}</div>
                  <div><span className="text-muted-foreground">Created:</span> {new Date(incident.created_at).toLocaleString()}</div>
                  {incident.resolved_at && <div><span className="text-muted-foreground">Resolved:</span> {new Date(incident.resolved_at).toLocaleString()}</div>}
                  {incidentMetrics?.time_to_resolution_minutes && <div><span className="text-muted-foreground">MTTR:</span> {incidentMetrics.time_to_resolution_minutes}m</div>}
                </div>
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Update Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                  <SelectContent>
                    {["open", "investigating", "mitigated", "resolved"].filter(s => s !== incident.status).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => updateStatus.mutate()} disabled={!newStatus}>Update</Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Status Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{new Date(incident.created_at).toLocaleString()}</span>
                  <Badge variant="outline">Created (open)</Badge>
                </div>
                {statusHistory.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{new Date(h.changed_at).toLocaleString()}</span>
                    <span>{h.previous_status} → <Badge variant="outline">{h.new_status}</Badge></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Linked Runbooks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" /> Linked Runbooks</CardTitle>
                <Select onValueChange={v => linkRunbook.mutate(v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Link runbook..." /></SelectTrigger>
                  <SelectContent>
                    {runbooks.map(r => <SelectItem key={r.id} value={r.id}>{r.runbook_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {runbookLinks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No runbooks linked yet.</p>
              ) : (
                <div className="space-y-3">
                  {runbookLinks.map((link: any) => (
                    <div key={link.id} className="border rounded-md p-3">
                      <p className="font-medium text-sm">{link.operational_runbooks?.runbook_name}</p>
                      <div className="mt-2 space-y-1">
                        {(link.operational_runbooks?.step_sequence as any[] || []).map((step: any, i: number) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="text-muted-foreground font-mono">{i + 1}.</span>
                            <span>{typeof step === "string" ? step : step.description || JSON.stringify(step)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Postmortem */}
          {incident.status === "resolved" && !existingPostmortem && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Create Postmortem</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Root cause summary" value={postmortem.root_cause_summary} onChange={e => setPostmortem(p => ({ ...p, root_cause_summary: e.target.value }))} />
                <Textarea placeholder="Contributing factors" value={postmortem.contributing_factors} onChange={e => setPostmortem(p => ({ ...p, contributing_factors: e.target.value }))} />
                <Textarea placeholder="Resolution summary" value={postmortem.resolution_summary} onChange={e => setPostmortem(p => ({ ...p, resolution_summary: e.target.value }))} />
                <Textarea placeholder="Preventive actions" value={postmortem.preventive_actions} onChange={e => setPostmortem(p => ({ ...p, preventive_actions: e.target.value }))} />
                <Button size="sm" onClick={() => savePostmortem.mutate()}>Save Postmortem</Button>
              </CardContent>
            </Card>
          )}

          {existingPostmortem && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Postmortem</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="font-medium">Root Cause:</span> {existingPostmortem.root_cause_summary}</div>
                <div><span className="font-medium">Contributing Factors:</span> {existingPostmortem.contributing_factors}</div>
                <div><span className="font-medium">Resolution:</span> {existingPostmortem.resolution_summary}</div>
                <div><span className="font-medium">Preventive Actions:</span> {existingPostmortem.preventive_actions}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
