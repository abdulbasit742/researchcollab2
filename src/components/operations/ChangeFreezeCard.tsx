import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Snowflake, ShieldCheck, Plus, Calendar } from "lucide-react";
import type { ChangeFreezePolicy } from "@/hooks/useOperationsCenter";

interface Props {
  freezePolicies: ChangeFreezePolicy[];
  activeFreeze: ChangeFreezePolicy | undefined;
  onCreateFreeze: (data: { policy_name: string; freeze_type: string; end_date: string; reason: string; allowed_changes?: string[] }) => Promise<unknown>;
}

export function ChangeFreezeCard({ freezePolicies, activeFreeze, onCreateFreeze }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    policy_name: "Post-Launch Freeze",
    freeze_type: "feature",
    end_date: "",
    reason: "",
  });

  const handleCreate = async () => {
    await onCreateFreeze(form);
    setShowCreate(false);
  };

  const daysRemaining = activeFreeze
    ? Math.max(0, Math.ceil((new Date(activeFreeze.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Card className={activeFreeze ? "border-blue-500/50 bg-blue-500/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Change Freeze Policy
          </CardTitle>
          {activeFreeze ? (
            <Badge className="bg-blue-500/90 text-white">ACTIVE — {daysRemaining}d remaining</Badge>
          ) : (
            <Badge variant="outline">No active freeze</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFreeze ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-card border">
              <h4 className="font-semibold">{activeFreeze.policy_name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{activeFreeze.reason}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Ends {new Date(activeFreeze.end_date).toLocaleDateString()}
                </span>
                <span>Type: {activeFreeze.freeze_type}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allowed Changes</p>
              <div className="flex flex-wrap gap-1.5">
                {activeFreeze.allowed_changes.map(c => (
                  <Badge key={c} variant="outline" className="text-xs bg-emerald-500/5 border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3 mr-1" /> {c.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <p className="text-xs font-semibold mb-1">🚫 Blocked During Freeze</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                  <li>No new core features</li>
                  <li>No schema changes without incident report</li>
                  <li>No UI expansion without usage proof</li>
                  <li>No roadmap announcements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-4">
            <Snowflake className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No active change freeze policy.</p>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="mt-3"><Plus className="h-4 w-4 mr-1" /> Activate Freeze</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Activate Change Freeze</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Policy name" value={form.policy_name} onChange={e => setForm(p => ({ ...p, policy_name: e.target.value }))} />
                  <Select value={form.freeze_type} onValueChange={v => setForm(p => ({ ...p, freeze_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Freeze</SelectItem>
                      <SelectItem value="feature">Feature Freeze</SelectItem>
                      <SelectItem value="schema">Schema Freeze</SelectItem>
                      <SelectItem value="ui">UI Freeze</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                  <Textarea placeholder="Reason for freeze" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                  <Button onClick={handleCreate} disabled={!form.end_date || !form.reason} className="w-full">
                    Activate Freeze
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
