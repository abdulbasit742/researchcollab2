import { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminRunbooksPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ runbook_name: "", incident_type: "other", severity_level: "medium", steps: "" });

  const { data: runbooks = [] } = useQuery({
    queryKey: ["runbooks"],
    queryFn: async () => {
      const { data } = await supabase.from("operational_runbooks").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const steps = form.steps.split("\n").filter(Boolean).map((s, i) => ({ step: i + 1, description: s.trim() }));
      await supabase.from("operational_runbooks").insert({
        runbook_name: form.runbook_name,
        incident_type: form.incident_type,
        severity_level: form.severity_level,
        step_sequence: steps,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runbooks"] });
      setShowCreate(false);
      setForm({ runbook_name: "", incident_type: "other", severity_level: "medium", steps: "" });
      toast.success("Runbook created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("operational_runbooks").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runbooks"] });
      toast.success("Runbook deleted");
    },
  });

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Operational Runbooks</h1>
              <p className="text-sm text-muted-foreground">Standard operating procedures for incident resolution</p>
            </div>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Runbook</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Runbook</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Runbook name" value={form.runbook_name} onChange={e => setForm(p => ({ ...p, runbook_name: e.target.value }))} />
                  <Select value={form.incident_type} onValueChange={v => setForm(p => ({ ...p, incident_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["performance", "security", "sla", "integrity", "infrastructure", "other"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={form.severity_level} onValueChange={v => setForm(p => ({ ...p, severity_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high", "critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Steps (one per line)" rows={6} value={form.steps} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))} />
                  <Button onClick={() => createMutation.mutate()} disabled={!form.runbook_name}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {runbooks.map(rb => (
              <Card key={rb.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{rb.runbook_name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(rb.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{rb.incident_type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{rb.severity_level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {(rb.step_sequence as any[] || []).map((step: any, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground font-mono min-w-[1.5rem]">{i + 1}.</span>
                        <span>{typeof step === "string" ? step : step.description || JSON.stringify(step)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {runbooks.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No runbooks created yet.</p>
            )}
          </div>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
