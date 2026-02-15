import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useSovereignDeployment,
  useDeploymentConfigurations,
  useDataResidencyProofs,
  useDeploymentCompliance,
  useIsolationAudit,
  DeploymentInstance,
} from "@/hooks/useSovereignDeployment";
import {
  Globe,
  Building2,
  Shield,
  Server,
  Plus,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Database,
  Cloud,
  MapPin,
  FileCheck,
  ShieldCheck,
  Activity,
  RefreshCw,
  Eye,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const deploymentTypeConfig = {
  saas: { label: "Shared SaaS", icon: Cloud, color: "bg-blue-500" },
  dedicated: { label: "Dedicated Tenant", icon: Building2, color: "bg-purple-500" },
  sovereign: { label: "Sovereign / On-Prem", icon: Shield, color: "bg-red-500" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  provisioning: { label: "Provisioning", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  decommissioned: { label: "Decommissioned", variant: "outline" },
};

const healthConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  healthy: { icon: CheckCircle2, color: "text-green-500" },
  degraded: { icon: AlertTriangle, color: "text-yellow-500" },
  unhealthy: { icon: XCircle, color: "text-red-500" },
  unknown: { icon: Activity, color: "text-muted-foreground" },
};

function DeploymentCard({
  instance,
  onSelect,
}: {
  instance: DeploymentInstance;
  onSelect: (id: string) => void;
}) {
  const typeConfig = deploymentTypeConfig[instance.instance_type];
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[instance.status] || statusConfig.provisioning;
  const health = healthConfig[instance.health_status] || healthConfig.unknown;
  const HealthIcon = health.icon;

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => onSelect(instance.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{instance.instance_name}</CardTitle>
              <CardDescription className="font-mono text-xs">
                {instance.instance_code}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{instance.region}</span>
            {instance.data_residency_country && (
              <Badge variant="outline" className="text-xs">
                {instance.data_residency_country}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <HealthIcon className={`h-4 w-4 ${health.color}`} />
            <span className="text-xs capitalize">{instance.health_status}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span className="capitalize">{instance.isolation_level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span className="capitalize">{instance.governance_mode}</span>
          </div>
          {instance.data_residency_certified && (
            <div className="flex items-center gap-1 text-green-600">
              <ShieldCheck className="h-3 w-3" />
              <span>Certified</span>
            </div>
          )}
        </div>

        {instance.provisioned_at && (
          <p className="text-xs text-muted-foreground">
            Provisioned {format(new Date(instance.provisioned_at), "PPP")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CreateDeploymentDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { createInstance } = useSovereignDeployment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instance_name: "",
    instance_code: "",
    instance_type: "dedicated" as const,
    region: "",
    data_residency_country: "",
    isolation_level: "logical" as const,
    governance_mode: "delegated" as const,
    network_mode: "connected",
    owner_entity_type: "organization",
    owner_contact_email: "",
  });

  const handleSubmit = async () => {
    if (!formData.instance_name || !formData.instance_code) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await createInstance(formData);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deployment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Deployment Instance</DialogTitle>
          <DialogDescription>
            Configure a new deployment for enterprise or sovereign use cases.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instance_name">Instance Name *</Label>
              <Input
                id="instance_name"
                value={formData.instance_name}
                onChange={(e) =>
                  setFormData({ ...formData, instance_name: e.target.value })
                }
                placeholder="Pakistan National Research Cloud"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instance_code">Instance Code *</Label>
              <Input
                id="instance_code"
                value={formData.instance_code}
                onChange={(e) =>
                  setFormData({ ...formData, instance_code: e.target.value })
                }
                placeholder="pk-nat-research-01"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deployment Type *</Label>
              <Select
                value={formData.instance_type}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, instance_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dedicated">Dedicated Tenant</SelectItem>
                  <SelectItem value="sovereign">Sovereign / On-Prem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Isolation Level *</Label>
              <Select
                value={formData.isolation_level}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, isolation_level: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logical">Logical Isolation</SelectItem>
                  <SelectItem value="physical">Physical Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                placeholder="asia-south"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_residency_country">Data Residency Country</Label>
              <Input
                id="data_residency_country"
                value={formData.data_residency_country}
                onChange={(e) =>
                  setFormData({ ...formData, data_residency_country: e.target.value })
                }
                placeholder="PK"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Governance Mode *</Label>
              <Select
                value={formData.governance_mode}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, governance_mode: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform Managed</SelectItem>
                  <SelectItem value="delegated">Delegated</SelectItem>
                  <SelectItem value="autonomous">Fully Autonomous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Network Mode *</Label>
              <Select
                value={formData.network_mode}
                onValueChange={(v) =>
                  setFormData({ ...formData, network_mode: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="restricted">Restricted Outbound</SelectItem>
                  <SelectItem value="air-gapped">Air-Gapped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner_contact_email">Owner Contact Email</Label>
            <Input
              id="owner_contact_email"
              type="email"
              value={formData.owner_contact_email}
              onChange={(e) =>
                setFormData({ ...formData, owner_contact_email: e.target.value })
              }
              placeholder="admin@organization.gov.pk"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Instance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeploymentDetails({ instance }: { instance: DeploymentInstance }) {
  const { configurations, loading: configLoading } = useDeploymentConfigurations(instance.id);
  const { proofs, loading: proofsLoading } = useDataResidencyProofs(instance.id);
  const { compliance, loading: complianceLoading } = useDeploymentCompliance(instance.id);
  const { auditEntries, loading: auditLoading } = useIsolationAudit(instance.id);
  const { provisionSovereignInstance } = useSovereignDeployment();
  const [provisioning, setProvisioning] = useState(false);

  const handleProvision = async () => {
    setProvisioning(true);
    await provisionSovereignInstance(instance.id);
    setProvisioning(false);
  };

  const typeConfig = deploymentTypeConfig[instance.instance_type];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${typeConfig.color} text-white`}>
            <TypeIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{instance.instance_name}</h2>
            <p className="text-muted-foreground font-mono">{instance.instance_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {instance.status === "provisioning" && (
            <Button onClick={handleProvision} disabled={provisioning}>
              {provisioning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Complete Provisioning
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="isolation">Isolation</TabsTrigger>
          <TabsTrigger value="residency">Data Residency</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Region & Residency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{instance.region}</span>
                </div>
                {instance.data_residency_country && (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Data in: {instance.data_residency_country}</span>
                    {instance.data_residency_certified && (
                      <Badge variant="outline" className="text-green-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Isolation Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold capitalize">
                    {instance.isolation_level}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {instance.isolation_level === "physical"
                    ? "Completely separate infrastructure"
                    : instance.isolation_level === "logical"
                    ? "Separate data layer, shared compute"
                    : "Multi-tenant shared resources"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold capitalize">
                    {instance.governance_mode}
                  </span>
                </div>
                {instance.governance_authority_name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Authority: {instance.governance_authority_name}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Database Cluster</p>
                  <p className="font-mono text-sm">
                    {instance.database_cluster_id || "default"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Prefix</p>
                  <p className="font-mono text-sm">
                    {instance.storage_bucket_prefix || "default"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auth Tenant</p>
                  <p className="font-mono text-sm">
                    {instance.auth_tenant_id || "shared"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network Mode</p>
                  <p className="font-mono text-sm capitalize">{instance.network_mode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Provider</p>
                  <p className="font-semibold capitalize">{instance.payment_provider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stripe Account</p>
                  <p className="font-mono text-sm">
                    {instance.stripe_account_id || "Not configured"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isolation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Isolation Audit Log</CardTitle>
              <CardDescription>
                Cross-deployment access attempts are tracked here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No cross-deployment access attempts recorded</p>
                  <p className="text-sm">Isolation is functioning correctly</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg border ${
                          entry.was_blocked
                            ? "bg-red-50 border-red-200 dark:bg-red-950/20"
                            : "bg-green-50 border-green-200 dark:bg-green-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {entry.was_blocked ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-medium">{entry.access_type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), "PPp")}
                          </span>
                        </div>
                        {entry.block_reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.block_reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residency" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Residency Proofs</CardTitle>
                <CardDescription>
                  Cryptographic proofs of data location compliance
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate Proof
              </Button>
            </CardHeader>
            <CardContent>
              {proofsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : proofs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No residency proofs generated yet</p>
                  <p className="text-sm">Generate a proof to certify data location</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={proof.is_current ? "default" : "secondary"}
                            >
                              {proof.proof_type}
                            </Badge>
                            {proof.is_current && (
                              <Badge variant="outline" className="text-green-600">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-2">
                            Location: <strong>{proof.data_location_verified}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Method: {proof.verification_method}
                            {proof.verifier_entity && ` by ${proof.verifier_entity}`}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {format(new Date(proof.proof_timestamp), "PPP")}
                          </p>
                          {proof.valid_until && (
                            <p className="text-xs">
                              Valid until {format(new Date(proof.valid_until), "PP")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-muted rounded font-mono text-xs break-all">
                        {proof.proof_hash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
              <CardDescription>
                Track certification status across regulatory frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : compliance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No compliance frameworks configured</p>
                  <p className="text-sm">Add frameworks to track certification</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {compliance.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            item.is_certified
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-muted"
                          }`}
                        >
                          <ShieldCheck
                            className={`h-6 w-6 ${
                              item.is_certified
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold uppercase">
                            {item.compliance_framework}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.is_certified ? (
                          <Badge className="bg-green-600">Certified</Badge>
                        ) : item.critical_findings > 0 ? (
                          <Badge variant="destructive">
                            {item.critical_findings} Critical
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Certified</Badge>
                        )}
                        {item.certificate_expires_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires {format(new Date(item.certificate_expires_at), "PP")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instance Configurations</CardTitle>
              <CardDescription>
                Override platform defaults for this deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : configurations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No custom configurations</p>
                  <p className="text-sm">Using platform defaults</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {configurations.map((config) => (
                    <div
                      key={config.id}
                      className="p-3 rounded-lg border flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono text-sm">{config.config_key}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {config.config_type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {JSON.stringify(config.config_value)}
                        </p>
                        {config.overrides_default && (
                          <p className="text-xs text-muted-foreground">
                            Overrides default
                          </p>
                        )}
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
  );
}

export default function AdminDeploymentPage() {
  const { instances, loading, refetch } = useSovereignDeployment();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId);

  const stats = {
    total: instances.length,
    saas: instances.filter((i) => i.instance_type === "saas").length,
    dedicated: instances.filter((i) => i.instance_type === "dedicated").length,
    sovereign: instances.filter((i) => i.instance_type === "sovereign").length,
    active: instances.filter((i) => i.status === "active").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Deployment Management</h1>
            <p className="text-muted-foreground">
              Manage sovereign, dedicated, and SaaS deployment instances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <CreateDeploymentDialog onSuccess={refetch} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Server className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SaaS</p>
                  <p className="text-2xl font-bold">{stats.saas}</p>
                </div>
                <Cloud className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dedicated</p>
                  <p className="text-2xl font-bold">{stats.dedicated}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sovereign</p>
                  <p className="text-2xl font-bold">{stats.sovereign}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        {selectedInstance ? (
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setSelectedInstanceId(null)}
            >
              ← Back to list
            </Button>
            <DeploymentDetails instance={selectedInstance} />
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : instances.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Server className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Deployments</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Create your first deployment instance to enable sovereign or
                    dedicated hosting for enterprise clients.
                  </p>
                  <CreateDeploymentDialog onSuccess={refetch} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instances.map((instance) => (
                  <DeploymentCard
                    key={instance.id}
                    instance={instance}
                    onSelect={setSelectedInstanceId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
