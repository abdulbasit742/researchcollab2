import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, CheckCircle2, FileText, AlertTriangle, Ban } from "lucide-react";
import type { OperatingLogEntry } from "@/hooks/useOperationsCenter";

interface Props {
  operatingLogs: OperatingLogEntry[];
  onAddLog: (data: { log_type: string; summary: string; action_items?: string[]; do_not_touch?: string[] }) => Promise<unknown>;
}

const logTypeConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  daily_check: { label: "Daily Check", icon: Clock, color: "bg-blue-500/10 text-blue-600" },
  weekly_review: { label: "Weekly Review", icon: FileText, color: "bg-purple-500/10 text-purple-600" },
  health_check: { label: "Health Check", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
  money_audit: { label: "Money Audit", icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600" },
  trust_audit: { label: "Trust Audit", icon: AlertTriangle, color: "bg-yellow-500/10 text-yellow-600" },
  incident_scan: { label: "Incident Scan", icon: AlertTriangle, color: "bg-red-500/10 text-red-600" },
  abuse_scan: { label: "Abuse Scan", icon: Ban, color: "bg-red-500/10 text-red-600" },
};

export function OperatingCadencePanel({ operatingLogs, onAddLog }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ log_type: "daily_check", summary: "", actionItems: "", doNotTouch: "" });

  const handleAdd = async () => {
    await onAddLog({
      log_type: form.log_type,
      summary: form.summary,
      action_items: form.actionItems.split("\n").filter(Boolean),
      do_not_touch: form.doNotTouch.split("\n").filter(Boolean),
    });
    setShowAdd(false);
    setForm({ log_type: "daily_check", summary: "", actionItems: "", doNotTouch: "" });
  };

  // Check if today's daily check has been done
  const today = new Date().toISOString().slice(0, 10);
  const todaysDailyCheck = operatingLogs.find(l => l.log_type === "daily_check" && l.log_date === today);

  return (
    <div className="space-y-4">
      {/* Cadence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={todaysDailyCheck ? "border-emerald-500/30" : "border-amber-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Daily Check (15-30 min)</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>• System health check</li>
                  <li>• Trust anomalies</li>
                  <li>• Money flow sanity</li>
                  <li>• Incident scan</li>
                </ul>
              </div>
              {todaysDailyCheck ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-500/50">Pending</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Weekly Review</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <li>• Top 3 friction points</li>
              <li>• Top 3 successful flows</li>
              <li>• Abuse attempts summary</li>
              <li>• What NOT to touch</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Log */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Operating Log</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Log Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Operating Log Entry</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.log_type} onValueChange={v => setForm(p => ({ ...p, log_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(logTypeConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Summary of findings..." value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} />
              <Textarea placeholder="Action items (one per line)" value={form.actionItems} onChange={e => setForm(p => ({ ...p, actionItems: e.target.value }))} rows={3} />
              <Textarea placeholder="Do NOT touch (one per line)" value={form.doNotTouch} onChange={e => setForm(p => ({ ...p, doNotTouch: e.target.value }))} rows={2} />
              <Button onClick={handleAdd} disabled={!form.summary} className="w-full">Add Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {operatingLogs.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No log entries yet. Start your first daily check.</CardContent></Card>
        ) : (
          operatingLogs.map(log => {
            const cfg = logTypeConfig[log.log_type] || logTypeConfig.daily_check;
            const Icon = cfg.icon;
            return (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${cfg.color}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{cfg.label}</span>
                        <span className="text-xs text-muted-foreground">{log.log_date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{log.summary}</p>
                      {log.action_items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold">Action Items:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {log.action_items.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {log.do_not_touch.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold text-destructive">🚫 Do NOT Touch:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {log.do_not_touch.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
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
