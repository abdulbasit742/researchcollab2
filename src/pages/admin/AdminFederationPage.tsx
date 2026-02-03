import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFederatedResearch } from "@/hooks/useFederatedResearch";
import {
  Globe,
  Link2,
  Users,
  Handshake,
  Shield,
  Activity,
  Loader2,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const trustColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  verified: "secondary",
  trusted: "default",
  suspended: "destructive",
};

const healthColors: Record<string, string> = {
  healthy: "text-green-500",
  degraded: "text-yellow-500",
  offline: "text-red-500",
  unknown: "text-muted-foreground",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  reviewing: "secondary",
  approved: "default",
  rejected: "destructive",
  expired: "outline",
};

export default function AdminFederationPage() {
  const {
    instances,
    identities,
    collaborations,
    discoveryCache,
    loading,
    stats,
    refetch,
    registerInstance,
    updateInstanceTrust,
    respondToCollaboration,
  } = useFederatedResearch();

  const [registerDialog, setRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    instance_name: "",
    instance_code: "",
    instance_type: "institutional",
    public_endpoint: "",
    governance_authority: "",
    data_residency: "",
  });

  const handleRegister = async () => {
    await registerInstance(registerForm);
    setRegisterDialog(false);
    setRegisterForm({
      instance_name: "",
      instance_code: "",
      instance_type: "institutional",
      public_endpoint: "",
      governance_authority: "",
      data_residency: "",
    });
  };

  const pendingCollabs = collaborations.filter(c => c.status === "pending");

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
            <h1 className="text-3xl font-bold tracking-tight">Research Federation</h1>
            <p className="text-muted-foreground">
              Cross-border instance management and collaboration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={registerDialog} onOpenChange={setRegisterDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Instance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Federated Instance</DialogTitle>
                  <DialogDescription>
                    Add a new federated research instance to the network
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instance Name</Label>
                      <Input
                        value={registerForm.instance_name}
                        onChange={(e) => setRegisterForm({ ...registerForm, instance_name: e.target.value })}
                        placeholder="Pakistan Research Cloud"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instance Code</Label>
                      <Input
                        value={registerForm.instance_code}
                        onChange={(e) => setRegisterForm({ ...registerForm, instance_code: e.target.value })}
                        placeholder="pk-research-01"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instance Type</Label>
                      <Select
                        value={registerForm.instance_type}
                        onValueChange={(v) => setRegisterForm({ ...registerForm, instance_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="institutional">Institutional</SelectItem>
                          <SelectItem value="consortium">Consortium</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Residency</Label>
                      <Input
                        value={registerForm.data_residency}
                        onChange={(e) => setRegisterForm({ ...registerForm, data_residency: e.target.value })}
                        placeholder="PK"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Public Endpoint</Label>
                    <Input
                      value={registerForm.public_endpoint}
                      onChange={(e) => setRegisterForm({ ...registerForm, public_endpoint: e.target.value })}
                      placeholder="https://api.research.gov.pk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Governance Authority</Label>
                    <Input
                      value={registerForm.governance_authority}
                      onChange={(e) => setRegisterForm({ ...registerForm, governance_authority: e.target.value })}
                      placeholder="Ministry of Science & Technology"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setRegisterDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={!registerForm.instance_name || !registerForm.instance_code || !registerForm.public_endpoint}
                  >
                    Register Instance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pending Collaborations Alert */}
        {pendingCollabs.length > 0 && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Handshake className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium">{pendingCollabs.length} Pending Collaboration Request(s)</p>
                  <p className="text-sm text-muted-foreground">Review and respond to incoming federation requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Instances</p>
                  <p className="text-2xl font-bold">{stats.totalInstances}</p>
                  <p className="text-xs text-green-600">{stats.trustedInstances} trusted</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                  <p className="text-2xl font-bold">{stats.healthyInstances}</p>
                  <p className="text-xs text-muted-foreground">of {stats.totalInstances}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collaborations</p>
                  <p className="text-2xl font-bold">{stats.activeCollaborations}</p>
                  <p className="text-xs text-orange-600">{stats.pendingCollaborations} pending</p>
                </div>
                <Handshake className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Linked Identities</p>
                  <p className="text-2xl font-bold">{stats.linkedIdentities}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="instances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="instances">Instances</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="identities">Identities</TabsTrigger>
            <TabsTrigger value="discovery">Discovery Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="instances">
            <Card>
              <CardHeader>
                <CardTitle>Federated Instances</CardTitle>
                <CardDescription>
                  Connected research platforms and their trust status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No federated instances registered</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instances.map((instance) => (
                      <div
                        key={instance.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{instance.instance_name}</h4>
                              <Badge variant="outline">{instance.instance_type}</Badge>
                              <Badge variant={trustColors[instance.trust_level]}>
                                {instance.trust_level}
                              </Badge>
                              <span className={`text-sm ${healthColors[instance.health_status]}`}>
                                ● {instance.health_status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {instance.instance_code}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{instance.public_endpoint}</span>
                              {instance.data_residency && (
                                <span>Data: {instance.data_residency}</span>
                              )}
                              {instance.governance_authority && (
                                <span>Gov: {instance.governance_authority}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {instance.federation_agreement_signed && (
                              <Badge variant="outline" className="text-green-600">
                                <Shield className="h-3 w-3 mr-1" />
                                Agreement Signed
                              </Badge>
                            )}
                            <Select
                              value={instance.trust_level}
                              onValueChange={(v) => updateInstanceTrust(instance.id, v)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="trusted">Trusted</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborations">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Requests</CardTitle>
                <CardDescription>
                  Cross-instance collaboration handshakes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collaborations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Handshake className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No collaboration requests</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {collaborations.map((collab) => {
                        const requestingInstance = instances.find(i => i.id === collab.requesting_instance_id);
                        const targetInstance = instances.find(i => i.id === collab.target_instance_id);
                        return (
                          <div
                            key={collab.id}
                            className={`p-4 rounded-lg border ${
                              collab.status === "pending"
                                ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={statusColors[collab.status]}>
                                    {collab.status}
                                  </Badge>
                                  <Badge variant="outline">{collab.collaboration_type}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">{requestingInstance?.instance_name || "Unknown"}</span>
                                  <Link2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{targetInstance?.instance_name || "Unknown"}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {collab.purpose}
                                </p>
                              </div>
                              <div className="text-right">
                                {collab.status === "pending" ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => respondToCollaboration(collab.id, false)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => respondToCollaboration(collab.id, true)}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(collab.requested_at), "PP")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identities">
            <Card>
              <CardHeader>
                <CardTitle>Federated Identities</CardTitle>
                <CardDescription>
                  Cross-instance identity links (hashed, no PII)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {identities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No federated identities linked</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {identities.map((identity) => {
                        const remoteInstance = instances.find(i => i.id === identity.remote_instance_id);
                        return (
                          <div
                            key={identity.id}
                            className="p-4 rounded-lg border"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={identity.is_active ? "default" : "secondary"}>
                                    {identity.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                  <Badge variant="outline">{identity.verification_level}</Badge>
                                </div>
                                <p className="text-sm">
                                  Linked to: <span className="font-medium">{remoteInstance?.instance_name || "Unknown"}</span>
                                </p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                  Hash: {identity.remote_user_hash.slice(0, 16)}...
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                {identity.trust_score_snapshot !== null && (
                                  <p>Trust: {identity.trust_score_snapshot}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Linked: {format(new Date(identity.linked_at), "PP")}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discovery">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Cache</CardTitle>
                <CardDescription>
                  Cached metadata from federated instances (no raw data)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {discoveryCache.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No cached discovery data</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {discoveryCache.map((item) => {
                        const sourceInstance = instances.find(i => i.id === item.source_instance_id);
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{item.resource_type}</Badge>
                              <span className="text-sm">
                                From: {sourceInstance?.instance_name || "Unknown"}
                              </span>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>Cached: {format(new Date(item.cached_at), "PP")}</p>
                              {item.expires_at && (
                                <p>Expires: {format(new Date(item.expires_at), "PP")}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
