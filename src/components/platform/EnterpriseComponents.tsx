import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOrganizationManagement,
  useSSOConfiguration,
  useRBACManagement,
  useAuditLogs,
  Organization,
  TeamMember,
  AuditLogEntry,
  Permission
} from "@/hooks/useEnterpriseAdmin";
import {
  Building2,
  Users,
  Shield,
  Key,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Clock
} from "lucide-react";
import { format } from "date-fns";

// =====================================================
// SSO CONFIG PANEL
// =====================================================
export function SSOConfigPanel() {
  const { ssoConfig, fetchSSOConfig, configureSAML, configureOIDC, testSSO, enforceSSOOnly } = useSSOConfiguration();
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Initialize
  useState(() => {
    fetchSSOConfig();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Single Sign-On (SSO)
            </CardTitle>
            <CardDescription>
              Configure enterprise authentication
            </CardDescription>
          </div>
          <Badge variant={ssoConfig?.enabled ? "default" : "secondary"}>
            {ssoConfig?.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {ssoConfig ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium capitalize">{ssoConfig.provider}</p>
                  <p className="text-sm text-muted-foreground">{ssoConfig.domain}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allowed Domains</Label>
                <div className="p-3 bg-muted rounded-lg">
                  {ssoConfig.allowedDomains?.map((domain: string) => (
                    <Badge key={domain} variant="outline" className="mr-1">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Enforce SSO Only</p>
                <p className="text-sm text-muted-foreground">
                  Require all users to sign in via SSO
                </p>
              </div>
              <Switch 
                checked={ssoConfig.enforced}
                onCheckedChange={(checked) => enforceSSOOnly(checked)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => testSSO()}>
                Test Connection
              </Button>
              <Button className="flex-1" onClick={() => setIsConfiguring(true)}>
                Update Configuration
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">SSO Not Configured</h3>
            <p className="text-muted-foreground mb-4">
              Set up single sign-on for your organization
            </p>
            <Button onClick={() => setIsConfiguring(true)}>
              Configure SSO
            </Button>
          </div>
        )}

        {isConfiguring && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Configure SSO Provider</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Provider Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="azure">Azure AD</SelectItem>
                    <SelectItem value="google">Google Workspace</SelectItem>
                    <SelectItem value="onelogin">OneLogin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input placeholder="yourcompany.okta.com" />
              </div>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input placeholder="Enter client ID" />
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input type="password" placeholder="Enter client secret" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                configureSAML({});
                setIsConfiguring(false);
              }}>
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// RBAC MANAGER
// =====================================================
export function RBACManager() {
  const { roles, permissions, fetchRoles, createRole, updateRolePermissions, assignRole } = useRBACManagement();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Initialize
  useState(() => {
    fetchRoles();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role-Based Access Control
            </CardTitle>
            <CardDescription>
              Manage roles and permissions
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Roles List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Roles</h4>
            {roles.map((role) => (
              <button
                key={role.id}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedRole === role.id 
                    ? "bg-primary/10 ring-2 ring-primary" 
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{role.permissions} permissions</span>
                  <span>{role.members} members</span>
                </div>
              </button>
            ))}
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {selectedRole ? "Permissions" : "Select a role"}
            </h4>
            {selectedRole ? (
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-4">
                  {["Projects", "Users", "Settings", "Billing"].map((category) => (
                    <div key={category}>
                      <p className="font-medium text-sm mb-2">{category}</p>
                      <div className="space-y-2">
                        {["Read", "Write", "Delete", "Admin"].map((action) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="text-sm">{action}</span>
                            <Switch />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[300px] border rounded-lg flex items-center justify-center text-muted-foreground">
                Select a role to view permissions
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// AUDIT LOG VIEWER
// =====================================================
export function AuditLogViewer() {
  const { logs, fetchLogs, exportLogs, searchLogs } = useAuditLogs();
  const [search, setSearch] = useState("");

  // Initialize
  useState(() => {
    fetchLogs();
  });

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "text-destructive";
    if (action.includes("create")) return "text-primary";
    if (action.includes("update")) return "text-secondary-foreground";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Track all system activities
            </CardDescription>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => exportLogs("csv", {})}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(log.timestamp), "MMM d, h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =====================================================
// ORGANIZATION SETTINGS
// =====================================================
export function OrganizationSettings() {
  const { organization, fetchOrganization, updateOrganization } = useOrganizationManagement();

  // Initialize
  useState(() => {
    fetchOrganization();
  });

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading organization settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Organization Settings
        </CardTitle>
        <CardDescription>Manage your organization profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input defaultValue={organization.name} />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input defaultValue={organization.domain} />
          </div>
          <div className="space-y-2">
            <Label>Billing Email</Label>
            <Input defaultValue={organization.billingEmail} />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{organization.plan}</span>
                <Button variant="link" size="sm">Upgrade</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Seat Usage</span>
            <span className="text-sm text-muted-foreground">
              {organization.usedSeats} / {organization.seats}
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(organization.usedSeats / organization.seats) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => updateOrganization({})}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// ENTERPRISE DASHBOARD
// =====================================================
export function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enterprise Administration</h2>
        <p className="text-muted-foreground">
          Manage organization settings, security, and access control
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="rbac">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="sso" className="mt-6">
          <SSOConfigPanel />
        </TabsContent>

        <TabsContent value="rbac" className="mt-6">
          <RBACManager />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnterpriseDashboard;
