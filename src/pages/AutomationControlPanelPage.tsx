import { useState } from "react";
import { useAutomationRules, useAutomationLogs, useWorkflowEscalations } from "@/hooks/useAutomation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, Clock, AlertTriangle, Activity, Settings, Plus, CheckCircle2, Bell, FileText,
} from "lucide-react";
import { toast } from "sonner";

const INST_ID = "00000000-0000-0000-0000-000000000001";

const RULE_TEMPLATES = [
  { rule_type: "review_reminder", rule_name: "Review Overdue Reminder", action_type: "notify", trigger_condition: { days_overdue: 3 } },
  { rule_type: "task_overdue", rule_name: "Task Overdue Notification", action_type: "notify", trigger_condition: { days_overdue: 5 } },
  { rule_type: "project_inactivity", rule_name: "Project Inactivity Alert", action_type: "flag_status", trigger_condition: { inactive_days: 7 } },
  { rule_type: "escalation_reminder", rule_name: "Review Escalation to Supervisor", action_type: "escalate", trigger_condition: { days_no_response: 5 } },
];

function statusColor(label: string) {
  if (label === "healthy") return "text-emerald-600 border-emerald-500/30";
  if (label === "at_risk") return "text-amber-600 border-amber-500/30";
  return "text-destructive border-destructive/30";
}

export default function AutomationControlPanelPage() {
  const { rules, isLoading: rulesLoading, toggleRule, createRule } = useAutomationRules(INST_ID);
  const { data: logs = [], isLoading: logsLoading } = useAutomationLogs(INST_ID, 30);
  const { data: escalations = [] } = useWorkflowEscalations(INST_ID);
  const [activeTab, setActiveTab] = useState("rules");

  const handleCreateRule = (template: typeof RULE_TEMPLATES[0]) => {
    createRule(template);
    toast.success(`Rule "${template.rule_name}" created`);
  };

  const activeRules = rules.filter((r) => r.enabled);
  const openEscalations = escalations.filter((e) => !e.resolved);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automation Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage workflow rules, escalations, and automation activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {activeRules.length} active rules
          </Badge>
          {openEscalations.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {openEscalations.length} open escalations
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{rules.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{activeRules.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{openEscalations.length}</p>
            <p className="text-[10px] text-muted-foreground">Open Escalations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-[10px] text-muted-foreground">Recent Actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="logs">Activity Log</TabsTrigger>
          <TabsTrigger value="templates">Quick Add</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading rules...</p>
              ) : rules.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No automation rules configured yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the "Quick Add" tab to create rules from templates.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-foreground">{rule.rule_name}</p>
                          <Badge variant="secondary" className="text-[9px]">{rule.rule_type.replace(/_/g, " ")}</Badge>
                          <Badge variant="outline" className="text-[9px]">{rule.action_type}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Trigger: {JSON.stringify(rule.trigger_condition)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => toggleRule({ ruleId: rule.id, enabled })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalations Tab */}
        <TabsContent value="escalations" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Active Escalations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {openEscalations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active escalations.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {openEscalations.map((esc) => (
                    <div key={esc.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Bell className="h-3.5 w-3.5 text-amber-600" />
                          <p className="text-sm font-medium text-foreground">
                            {esc.escalation_type.replace(/_/g, " ")}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {esc.entity_type} · {esc.entity_id.slice(0, 8)}...
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(esc.triggered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Automation Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading logs...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No automation activity recorded yet.</p>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded text-sm hover:bg-muted/30">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">{log.action_taken}</span>
                        <span className="text-muted-foreground"> · </span>
                        <span className="text-muted-foreground">{log.automation_type.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground"> on </span>
                        <span className="text-foreground">{log.entity_type}</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] shrink-0">{log.actor_type}</Badge>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Add Tab */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Rule Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Add pre-configured automation rules. All rules are advisory — no financial mutations or state overrides.
              </p>
              <div className="space-y-3">
                {RULE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.rule_type}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <p className="text-sm font-medium text-foreground">{tmpl.rule_name}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Action: {tmpl.action_type} · Trigger: {JSON.stringify(tmpl.trigger_condition)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleCreateRule(tmpl)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Safety Guarantee</p>
                    <p className="text-[11px] text-muted-foreground">
                      All automation is advisory only. No rule can modify escrow, wallet balances, trust scores,
                      milestone states, or resolve disputes. Every action is logged and tenant-scoped.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
