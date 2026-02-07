import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Clock, CheckCircle2, Search as SearchIcon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/hooks/useOperationsCenter";

interface Props {
  incidents: Incident[];
  openIncidents: Incident[];
  p0Incidents: Incident[];
  onCreateIncident: (data: { title: string; description: string; severity: string; affected_system: string; users_affected?: number; money_at_risk?: number }) => Promise<unknown>;
  onUpdateStatus: (id: string, status: string, extras?: Record<string, unknown>) => Promise<void>;
}

const severityConfig = {
  p0: { label: "P0 — Critical", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  p1: { label: "P1 — High", color: "bg-amber-500/90 text-white", icon: AlertTriangle },
  p2: { label: "P2 — Medium", color: "bg-yellow-500/80 text-black", icon: Clock },
  p3: { label: "P3 — Low", color: "bg-muted text-muted-foreground", icon: Clock },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "border-destructive/50 text-destructive" },
  investigating: { label: "Investigating", color: "border-amber-500/50 text-amber-600" },
  mitigating: { label: "Mitigating", color: "border-yellow-500/50 text-yellow-600" },
  resolved: { label: "Resolved", color: "border-emerald-500/50 text-emerald-600" },
  postmortem: { label: "Postmortem", color: "border-blue-500/50 text-blue-600" },
};

export function IncidentBoard({ incidents, openIncidents, p0Incidents, onCreateIncident, onUpdateStatus }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({ title: "", description: "", severity: "p1", affected_system: "", users_affected: 0, money_at_risk: 0 });

  const filtered = filter === "all" ? incidents : incidents.filter(i => i.severity === filter);

  const handleCreate = async () => {
    await onCreateIncident(form);
    setShowCreate(false);
    setForm({ title: "", description: "", severity: "p1", affected_system: "", users_affected: 0, money_at_risk: 0 });
  };

  return (
    <div className="space-y-4">
      {/* P0 Alert Banner */}
      {p0Incidents.length > 0 && (
        <Card className="border-destructive bg-destructive/5 animate-pulse">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-bold text-destructive">
                {p0Incidents.length} CRITICAL INCIDENT{p0Incidents.length > 1 ? "S" : ""} ACTIVE
              </p>
              <p className="text-sm text-muted-foreground">
                {p0Incidents.map(i => i.title).join(" • ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Incident Board</h3>
          <Badge variant="outline">{openIncidents.length} open</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="p0">P0 Only</SelectItem>
              <SelectItem value="p1">P1</SelectItem>
              <SelectItem value="p2">P2</SelectItem>
              <SelectItem value="p3">P3</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Report Incident</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Report New Incident</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Incident title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <Textarea placeholder="What happened?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p0">P0 — Critical</SelectItem>
                      <SelectItem value="p1">P1 — High</SelectItem>
                      <SelectItem value="p2">P2 — Medium</SelectItem>
                      <SelectItem value="p3">P3 — Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Affected system" value={form.affected_system} onChange={e => setForm(p => ({ ...p, affected_system: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Users affected" value={form.users_affected} onChange={e => setForm(p => ({ ...p, users_affected: Number(e.target.value) }))} />
                  <Input type="number" placeholder="Money at risk (PKR)" value={form.money_at_risk} onChange={e => setForm(p => ({ ...p, money_at_risk: Number(e.target.value) }))} />
                </div>
                <Button onClick={handleCreate} disabled={!form.title || !form.description || !form.affected_system} className="w-full">
                  Create Incident
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-muted-foreground">No incidents. Systems nominal.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(inc => {
            const sev = severityConfig[inc.severity as keyof typeof severityConfig];
            const stat = statusConfig[inc.status] || statusConfig.open;
            return (
              <Card key={inc.id} className={cn("transition-all", inc.severity === "p0" && inc.status === "open" && "border-destructive/50 shadow-destructive/10 shadow-lg")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={sev.color}>{sev.label}</Badge>
                        <Badge variant="outline" className={stat.color}>{stat.label}</Badge>
                        <span className="text-xs text-muted-foreground">{inc.affected_system}</span>
                      </div>
                      <h4 className="font-semibold mt-1.5">{inc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{inc.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {inc.users_affected > 0 && <span>{inc.users_affected} users affected</span>}
                        {inc.money_at_risk > 0 && <span className="text-destructive font-medium">PKR {inc.money_at_risk.toLocaleString()} at risk</span>}
                        <span>{new Date(inc.detected_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {inc.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(inc.id, "investigating")}>
                          Investigate
                        </Button>
                      )}
                      {inc.status === "investigating" && (
                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(inc.id, "mitigating")}>
                          Mitigating
                        </Button>
                      )}
                      {(inc.status === "investigating" || inc.status === "mitigating") && (
                        <Button size="sm" variant="default" onClick={() => onUpdateStatus(inc.id, "resolved")}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
