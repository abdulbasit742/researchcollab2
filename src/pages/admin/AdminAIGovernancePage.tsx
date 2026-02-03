import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import {
  Brain,
  Power,
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  Loader2,
  RefreshCw,
  Zap,
  DollarSign,
  Eye,
  Ban,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminAIGovernancePage() {
  const {
    models,
    usageLogs,
    policies,
    killSwitches,
    activeKillSwitches,
    loading,
    stats,
    refetch,
    toggleModel,
    activateKillSwitch,
    deactivateKillSwitch,
  } = useAIGovernance();

  const [killSwitchDialog, setKillSwitchDialog] = useState(false);
  const [killSwitchForm, setKillSwitchForm] = useState({
    type: "global",
    target: "",
    reason: "",
  });

  const handleActivateKillSwitch = async () => {
    await activateKillSwitch(
      killSwitchForm.type,
      killSwitchForm.type === "global" ? null : killSwitchForm.target,
      killSwitchForm.reason
    );
    setKillSwitchDialog(false);
    setKillSwitchForm({ type: "global", target: "", reason: "" });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Governance</h1>
            <p className="text-muted-foreground">
              Model registry, usage monitoring, and kill-switch controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={killSwitchDialog} onOpenChange={setKillSwitchDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Power className="h-4 w-4 mr-2" />
                  Kill Switch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Activate AI Kill Switch</DialogTitle>
                  <DialogDescription>
                    Immediately disable AI capabilities. This action is logged.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Switch Type</Label>
                    <Select
                      value={killSwitchForm.type}
                      onValueChange={(v) => setKillSwitchForm({ ...killSwitchForm, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global (All AI)</SelectItem>
                        <SelectItem value="model">Specific Model</SelectItem>
                        <SelectItem value="feature">Specific Feature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {killSwitchForm.type !== "global" && (
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Input
                        value={killSwitchForm.target}
                        onChange={(e) => setKillSwitchForm({ ...killSwitchForm, target: e.target.value })}
                        placeholder={killSwitchForm.type === "model" ? "Model ID" : "Feature name"}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Textarea
                      value={killSwitchForm.reason}
                      onChange={(e) => setKillSwitchForm({ ...killSwitchForm, reason: e.target.value })}
                      placeholder="Why is this kill switch being activated?"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setKillSwitchDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleActivateKillSwitch}
                    disabled={!killSwitchForm.reason}
                  >
                    Activate Kill Switch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Global Kill Switch Alert */}
        {stats.globalKillActive && (
          <Alert variant="destructive">
            <Power className="h-4 w-4" />
            <AlertTitle>Global AI Kill Switch Active</AlertTitle>
            <AlertDescription>
              All AI capabilities are currently disabled platform-wide.
            </AlertDescription>
          </Alert>
        )}

        {/* Active Kill Switches */}
        {activeKillSwitches.length > 0 && !stats.globalKillActive && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{activeKillSwitches.length} Active Kill Switch(es)</AlertTitle>
            <AlertDescription>
              Some AI capabilities are currently restricted.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Models</p>
                  <p className="text-2xl font-bold">
                    {stats.enabledModels}/{stats.totalModels}
                  </p>
                  <p className="text-xs text-muted-foreground">enabled</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usage (24h)</p>
                  <p className="text-2xl font-bold">{stats.usageCount24h}</p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Today</p>
                  <p className="text-2xl font-bold">
                    {stats.totalTokensToday.toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Today</p>
                  <p className="text-2xl font-bold">
                    ${stats.totalCostToday.toFixed(4)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="usage">Usage Logs</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="killswitches">Kill Switches</TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Registry</CardTitle>
                <CardDescription>
                  Registered AI models and their configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {models.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No models registered</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className="p-4 rounded-lg border flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{model.model_name}</h4>
                            <Badge variant="outline">{model.provider}</Badge>
                            <Badge
                              variant={
                                model.risk_level === "high" ? "destructive" :
                                model.risk_level === "medium" ? "secondary" :
                                "default"
                              }
                            >
                              {model.risk_level} risk
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {model.model_identifier}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Purpose: {model.purpose}</span>
                            {model.cost_per_1k_tokens && (
                              <span>${model.cost_per_1k_tokens}/1K tokens</span>
                            )}
                            <span>Retention: {model.data_retention_policy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {model.requires_human_review && (
                            <Badge variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Review Required
                            </Badge>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{model.enabled ? "Enabled" : "Disabled"}</span>
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={(checked) => toggleModel(model.id, checked)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>AI Usage Logs</CardTitle>
                <CardDescription>
                  Recent AI usage (hashed, no raw content)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {usageLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No usage logs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {usageLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.feature}</Badge>
                                {log.was_rejected && (
                                  <Badge variant="destructive">Rejected</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                User: {log.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p>{log.total_tokens?.toLocaleString() || 0} tokens</p>
                            <p className="text-muted-foreground text-xs">
                              {format(new Date(log.created_at), "PPp")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>AI Policies</CardTitle>
                <CardDescription>
                  Rules governing AI usage across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No policies configured</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policies.map((policy) => (
                      <div
                        key={policy.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{policy.policy_name}</h4>
                            <Badge variant="outline">{policy.scope}</Badge>
                            <Badge variant={policy.is_active ? "default" : "secondary"}>
                              {policy.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Priority: {policy.priority}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={policy.allow_generation ? "default" : "destructive"}>
                            Generation: {policy.allow_generation ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={policy.allow_analysis ? "default" : "destructive"}>
                            Analysis: {policy.allow_analysis ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={policy.allow_matching ? "default" : "destructive"}>
                            Matching: {policy.allow_matching ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={policy.allow_co_authoring ? "default" : "destructive"}>
                            Co-authoring: {policy.allow_co_authoring ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={policy.allow_training ? "default" : "destructive"}>
                            Training: {policy.allow_training ? "✓" : "✗"}
                          </Badge>
                          {policy.human_review_required && (
                            <Badge variant="outline">Human Review Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="killswitches">
            <Card>
              <CardHeader>
                <CardTitle>Kill Switch Status</CardTitle>
                <CardDescription>
                  Emergency AI disable controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                {killSwitches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Power className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No kill switches configured</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {killSwitches.map((sw) => (
                      <div
                        key={sw.id}
                        className={`p-4 rounded-lg border ${
                          sw.is_active
                            ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {sw.is_active ? (
                                <Ban className="h-5 w-5 text-red-500" />
                              ) : (
                                <Power className="h-5 w-5 text-muted-foreground" />
                              )}
                              <Badge variant={sw.is_active ? "destructive" : "secondary"}>
                                {sw.switch_type}
                              </Badge>
                              {sw.switch_target && (
                                <span className="text-sm font-mono">{sw.switch_target}</span>
                              )}
                            </div>
                            <p className="text-sm">{sw.reason}</p>
                          </div>
                          <div className="text-right">
                            {sw.is_active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateKillSwitch(sw.id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                            {sw.activated_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(sw.activated_at), "PPp")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
