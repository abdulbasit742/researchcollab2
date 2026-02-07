import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Clock, Plus, Check, X, Hourglass, Shield } from "lucide-react";
import type { FounderIdea } from "@/hooks/useOperationsCenter";

interface Props {
  founderIdeas: FounderIdea[];
  coolingIdeas: FounderIdea[];
  onSubmitIdea: (data: { idea_title: string; idea_description?: string; idea_type: string; requires_schema_change?: boolean }) => Promise<unknown>;
  onDecideIdea: (id: string, status: "approved" | "rejected", reason: string) => Promise<void>;
}

export function FounderDisciplinePanel({ founderIdeas, coolingIdeas, onSubmitIdea, onDecideIdea }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ idea_title: "", idea_description: "", idea_type: "feature", requires_schema_change: false });

  const handleSubmit = async () => {
    await onSubmitIdea(form);
    setShowAdd(false);
    setForm({ idea_title: "", idea_description: "", idea_type: "feature", requires_schema_change: false });
  };

  const approved = founderIdeas.filter(i => i.status === "approved");
  const rejected = founderIdeas.filter(i => i.status === "rejected");

  return (
    <div className="space-y-4">
      {/* Discipline Rules */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            Founder Discipline Rules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">🛡️ Self-Protection</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Every idea waits <span className="font-semibold text-foreground">30 days</span></li>
                <li>Every change requires <span className="font-semibold text-foreground">data</span></li>
                <li>Every "urgent" request is <span className="font-semibold text-foreground">questioned</span></li>
                <li>Founder is steward, not firefighter</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">🚫 Protected Against</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Overbuilding</li>
                <li>Overreacting</li>
                <li>Feature addiction</li>
                <li>Social comparison</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Idea */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Idea Cooling Chamber</h3>
          <Badge variant="outline"><Hourglass className="h-3 w-3 mr-1" />{coolingIdeas.length} cooling</Badge>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Submit Idea</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Idea to Cooling</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Idea title" value={form.idea_title} onChange={e => setForm(p => ({ ...p, idea_title: e.target.value }))} />
              <Textarea placeholder="Description" value={form.idea_description} onChange={e => setForm(p => ({ ...p, idea_description: e.target.value }))} />
              <Select value={form.idea_type} onValueChange={v => setForm(p => ({ ...p, idea_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="ui_change">UI Change</SelectItem>
                  <SelectItem value="schema_change">Schema Change</SelectItem>
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.requires_schema_change}
                  onCheckedChange={v => setForm(p => ({ ...p, requires_schema_change: !!v }))}
                />
                <span className="text-sm">Requires schema change</span>
              </div>
              <Button onClick={handleSubmit} disabled={!form.idea_title} className="w-full">
                <Clock className="h-4 w-4 mr-1" /> Submit — 30 Day Wait
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ideas List */}
      <div className="space-y-2">
        {founderIdeas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 text-primary/50" />
              <p>No ideas submitted. Discipline is strength.</p>
            </CardContent>
          </Card>
        ) : (
          founderIdeas.map(idea => {
            const daysLeft = Math.max(0, Math.ceil((new Date(idea.cooling_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const canDecide = idea.status === "cooling" && daysLeft === 0;

            return (
              <Card key={idea.id} className={idea.status === "cooling" ? "border-amber-500/20" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {idea.status === "cooling" && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                            <Hourglass className="h-3 w-3 mr-1" /> {daysLeft}d left
                          </Badge>
                        )}
                        {idea.status === "approved" && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><Check className="h-3 w-3 mr-1" /> Approved</Badge>}
                        {idea.status === "rejected" && <Badge variant="outline" className="text-destructive border-destructive/30"><X className="h-3 w-3 mr-1" /> Rejected</Badge>}
                        <Badge variant="secondary" className="text-xs">{idea.idea_type.replace(/_/g, " ")}</Badge>
                        {idea.requires_schema_change && <Badge variant="destructive" className="text-xs">Schema Change</Badge>}
                      </div>
                      <h4 className="font-semibold">{idea.idea_title}</h4>
                      {idea.idea_description && <p className="text-sm text-muted-foreground mt-0.5">{idea.idea_description}</p>}
                      {idea.decision_reason && <p className="text-xs text-muted-foreground mt-1 italic">Decision: {idea.decision_reason}</p>}
                    </div>
                    {canDecide && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" onClick={() => onDecideIdea(idea.id, "approved", "Data supports it")}>
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDecideIdea(idea.id, "rejected", "No data support")}>
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
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
