import { useState, useEffect } from "react";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const METRIC_TYPES = [
  "error_rate", "p95_latency", "p99_latency", "queue_depth",
  "upload_failure_rate", "sla_breach_density", "messaging_latency",
];

export default function SuperAdminAlertThresholdsPage() {
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newSeverity, setNewSeverity] = useState("warning");

  const load = async () => {
    const { data } = await (supabase as any).from("system_alert_thresholds").select("*").order("created_at", { ascending: false });
    setThresholds(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const addThreshold = async () => {
    if (!newType || !newValue) return;
    await (supabase as any).from("system_alert_thresholds").insert({
      metric_type: newType,
      threshold_value: parseFloat(newValue),
      severity_level: newSeverity,
    });
    toast.success("Threshold added");
    setNewType(""); setNewValue("");
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await (supabase as any).from("system_alert_thresholds").update({ is_active: !current }).eq("id", id);
    load();
  };

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Alert Thresholds</h1>
            <p className="text-sm text-muted-foreground">Configure system alert triggers (visual only)</p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Metric type" /></SelectTrigger>
                  <SelectContent>
                    {METRIC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Value" type="number" value={newValue} onChange={e => setNewValue(e.target.value)} className="w-32" />
                <Select value={newSeverity} onValueChange={setNewSeverity}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addThreshold}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Thresholds</CardTitle>
            </CardHeader>
            <CardContent>
              {thresholds.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No thresholds configured</p>
              ) : (
                <div className="space-y-2">
                  {thresholds.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <Switch checked={t.is_active} onCheckedChange={() => toggleActive(t.id, t.is_active)} />
                        <div>
                          <p className="text-xs font-medium">{t.metric_type.replace(/_/g, " ")}</p>
                          <p className="text-[10px] text-muted-foreground">Threshold: {t.threshold_value}</p>
                        </div>
                      </div>
                      <Badge variant={t.severity_level === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                        {t.severity_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
