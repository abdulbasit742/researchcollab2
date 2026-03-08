import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FlaskConical, Plus, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getResearchLabs, createResearchLab } from "@/lib/innovation/researchLabs";

export default function ResearchLabsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", domain: "" });

  const { data: labs = [], isLoading } = useQuery({ queryKey: ["research-labs"], queryFn: () => getResearchLabs() });

  const createMutation = useMutation({
    mutationFn: () => createResearchLab({ ...form, created_by: user?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["research-labs"] }); toast.success("Lab created"); setDialogOpen(false); },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Autonomous Research Labs</h1>
            <p className="text-sm text-muted-foreground">Persistent virtual research organizations</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Lab</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Research Lab</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Lab name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Domain (e.g. AI, Biotech)" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.name || !form.domain}>Create Lab</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading labs…</div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab: any) => (
            <Card key={lab.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{lab.name}</CardTitle>
                  <Badge variant="secondary">{lab.domain}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {lab.description && <p className="text-xs text-muted-foreground line-clamp-2">{lab.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{lab.member_count} members</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{Number(lab.funding_pool_total).toLocaleString()}</span>
                </div>
                <div className="flex gap-1">{(lab.tags || []).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                <Badge variant={lab.status === "active" ? "default" : "secondary"}>{lab.status}</Badge>
              </CardContent>
            </Card>
          ))}
          {labs.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No labs created yet.</div>}
        </div>
      )}
    </div>
  );
}
