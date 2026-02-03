import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlags, FeatureFlag } from "@/hooks/useFeatureFlags";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Flag, 
  Power, 
  AlertTriangle, 
  History, 
  Plus, 
  Shield, 
  Zap,
  ToggleLeft,
  Search,
  Clock
} from "lucide-react";

export default function AdminFeatureFlagsPage() {
  const { flags, killSwitches, audits, loading, toggleFlag, createFlag, emergencyDisableAll, fetchAudits } = useFeatureFlags();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // New flag form state
  const [newFlag, setNewFlag] = useState({
    feature_key: "",
    description: "",
    enabled: false,
    scope: "global",
    is_kill_switch: false,
    priority: 0,
  });

  const filteredFlags = flags.filter(
    (f) =>
      f.feature_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await toggleFlag(flag.feature_key, !flag.enabled);
      toast({
        title: flag.enabled ? "Feature Disabled" : "Feature Enabled",
        description: `${flag.feature_key} has been ${flag.enabled ? "disabled" : "enabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle feature flag.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    try {
      await createFlag(newFlag);
      toast({ title: "Success", description: "Feature flag created." });
      setShowCreateDialog(false);
      setNewFlag({
        feature_key: "",
        description: "",
        enabled: false,
        scope: "global",
        is_kill_switch: false,
        priority: 0,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create flag.", variant: "destructive" });
    }
  };

  const handleEmergencyDisable = async () => {
    try {
      await emergencyDisableAll();
      toast({
        title: "Emergency Shutdown",
        description: "All non-critical features have been disabled.",
        variant: "destructive",
      });
      setShowEmergencyDialog(false);
    } catch (error) {
      toast({ title: "Error", description: "Emergency shutdown failed.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flag className="h-8 w-8 text-primary" />
              Feature Flags
            </h1>
            <p className="text-muted-foreground">Control platform features and emergency kill-switches</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Flag</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Feature Key</Label>
                    <Input
                      placeholder="my_new_feature"
                      value={newFlag.feature_key}
                      onChange={(e) => setNewFlag({ ...newFlag, feature_key: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What does this feature do?"
                      value={newFlag.description}
                      onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scope</Label>
                    <Select
                      value={newFlag.scope}
                      onValueChange={(v) => setNewFlag({ ...newFlag, scope: v as FeatureFlag["scope"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="role">By Role</SelectItem>
                        <SelectItem value="organization">By Organization</SelectItem>
                        <SelectItem value="user">By User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newFlag.is_kill_switch}
                      onCheckedChange={(v) => setNewFlag({ ...newFlag, is_kill_switch: v })}
                    />
                    <Label>Kill-Switch (Critical Feature)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newFlag.enabled}
                      onCheckedChange={(v) => setNewFlag({ ...newFlag, enabled: v })}
                    />
                    <Label>Enabled by Default</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>Create Flag</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive"><Power className="h-4 w-4 mr-2" />Emergency Shutdown</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Shutdown
                  </DialogTitle>
                  <DialogDescription>
                    This will disable ALL non-critical features immediately. Admin actions will remain enabled.
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive" className="my-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>This action is immediate and affects all users.</AlertTitle>
                  <AlertDescription>
                    Payments, messaging, file uploads, and external integrations will be disabled.
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEmergencyDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleEmergencyDisable}>
                    Confirm Shutdown
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flags.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {flags.filter((f) => f.enabled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kill-Switches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{killSwitches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {flags.filter((f) => !f.enabled).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all"><ToggleLeft className="h-4 w-4 mr-2" />All Flags</TabsTrigger>
            <TabsTrigger value="killswitches"><Shield className="h-4 w-4 mr-2" />Kill-Switches</TabsTrigger>
            <TabsTrigger value="audit"><History className="h-4 w-4 mr-2" />Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flags..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredFlags.map((flag) => (
                <Card key={flag.id} className={flag.is_kill_switch ? "border-amber-500/50" : ""}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggle(flag)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{flag.feature_key}</span>
                          {flag.is_kill_switch && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              <Zap className="h-3 w-3 mr-1" />Kill-Switch
                            </Badge>
                          )}
                          <Badge variant={flag.enabled ? "default" : "secondary"}>
                            {flag.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Badge variant="outline">{flag.scope}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {flag.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFlag(flag);
                        fetchAudits(flag.feature_key);
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="killswitches" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Critical System Controls</AlertTitle>
              <AlertDescription>
                These flags control core platform functionality. Disabling them will immediately affect all users.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {killSwitches.map((flag) => (
                <Card key={flag.id} className="border-amber-500/50 bg-amber-500/5">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggle(flag)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{flag.feature_key}</span>
                          <Badge variant={flag.enabled ? "default" : "destructive"}>
                            {flag.enabled ? "Active" : "DISABLED"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {flag.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change History</CardTitle>
                <CardDescription>Complete audit trail of all feature flag changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No audit records yet</p>
                  ) : (
                    audits.slice(0, 50).map((audit) => (
                      <div key={audit.id} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full ${
                          audit.action === "enabled" ? "bg-emerald-500/10" :
                          audit.action === "disabled" ? "bg-destructive/10" :
                          "bg-muted"
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{audit.feature_key}</span>
                            <Badge variant={
                              audit.action === "enabled" ? "default" :
                              audit.action === "disabled" ? "destructive" :
                              "secondary"
                            }>
                              {audit.action}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(audit.created_at), "PPpp")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
