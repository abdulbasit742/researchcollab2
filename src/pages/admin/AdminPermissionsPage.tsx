import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePermissionManagement } from "@/hooks/usePermissions";
import { Shield, Check, X, Search, History, AlertTriangle, Lock, Users, Key } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminPermissionsPage() {
  const {
    definitions,
    permissionMatrix,
    definitionsByEntity,
    contextualPermissions,
    auditLogs,
    loading,
    updateRolePermission,
    revokeContextualPermission,
    refetch,
  } = usePermissionManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    role: "student" | "researcher" | "admin";
    actionKey: string;
    newValue: boolean;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const roles: ("student" | "researcher" | "admin")[] = ["student", "researcher", "admin"];
  const entityTypes = Object.keys(definitionsByEntity).sort();

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.action_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePermission = (
    role: "student" | "researcher" | "admin",
    actionKey: string,
    currentValue: boolean
  ) => {
    setConfirmDialog({
      open: true,
      role,
      actionKey,
      newValue: !currentValue,
    });
    setReason("");
  };

  const confirmChange = async () => {
    if (!confirmDialog) return;

    setUpdating(true);
    const result = await updateRolePermission(
      confirmDialog.role,
      confirmDialog.actionKey,
      confirmDialog.newValue,
      reason
    );

    if (result.success) {
      toast.success("Permission updated successfully");
    } else {
      toast.error(result.error || "Failed to update permission");
    }

    setUpdating(false);
    setConfirmDialog(null);
    setReason("");
  };

  const handleRevokeContextual = async (id: string) => {
    const result = await revokeContextualPermission(id, "Revoked by admin");
    if (result.success) {
      toast.success("Contextual permission revoked");
    } else {
      toast.error(result.error || "Failed to revoke permission");
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case "grant":
        return "bg-green-500/10 text-green-600";
      case "revoke":
        return "bg-red-500/10 text-red-600";
      case "modify":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const stripeRelatedActions = definitions.filter((d) => d.is_stripe_related);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Permission Matrix
            </h1>
            <p className="text-muted-foreground mt-1">
              Centralized RBAC management - Pre-Stripe security infrastructure
            </p>
          </div>
          <Button onClick={refetch} variant="outline" disabled={loading}>
            Refresh
          </Button>
        </div>

        {/* Stripe Warning */}
        {stripeRelatedActions.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-600 flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Stripe-Related Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                The following permissions are Stripe-related and currently disabled until payment integration is complete:
              </p>
              <div className="flex flex-wrap gap-2">
                {stripeRelatedActions.map((action) => (
                  <Badge key={action.action_key} variant="outline" className="border-amber-500/50">
                    <Lock className="h-3 w-3 mr-1" />
                    {action.action_key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Permissions</CardDescription>
              <CardTitle className="text-2xl">{definitions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Entity Types</CardDescription>
              <CardTitle className="text-2xl">{entityTypes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Contextual Overrides</CardDescription>
              <CardTitle className="text-2xl">{contextualPermissions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Audit Entries</CardDescription>
              <CardTitle className="text-2xl">{auditLogs.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="matrix" className="space-y-4">
          <TabsList>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Role Matrix
            </TabsTrigger>
            <TabsTrigger value="contextual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contextual Overrides
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Role Matrix Tab */}
          <TabsContent value="matrix" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[200px]">Permission</TableHead>
                      <TableHead className="w-[100px]">Entity</TableHead>
                      <TableHead>Description</TableHead>
                      {roles.map((role) => (
                        <TableHead key={role} className="w-[100px] text-center capitalize">
                          {role}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDefinitions.map((def) => (
                      <TableRow key={def.action_key}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            {def.is_stripe_related && (
                              <Lock className="h-3 w-3 text-amber-500" />
                            )}
                            {def.action_key}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {def.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {def.description}
                        </TableCell>
                        {roles.map((role) => {
                          const allowed = permissionMatrix[role]?.[def.action_key] ?? false;
                          const isAdmin = role === "admin";
                          return (
                            <TableCell key={role} className="text-center">
                              <div className="flex justify-center">
                                {isAdmin ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Switch
                                    checked={allowed}
                                    onCheckedChange={() =>
                                      handleTogglePermission(role, def.action_key, allowed)
                                    }
                                    disabled={loading}
                                  />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Contextual Overrides Tab */}
          <TabsContent value="contextual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Contextual Permissions</CardTitle>
                <CardDescription>
                  User-specific permission overrides for organizations, projects, or institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contextualPermissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No contextual permissions have been granted yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Context</TableHead>
                        <TableHead>Permission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contextualPermissions.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-mono text-xs">
                            {perm.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {perm.context_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {perm.action_key}
                          </TableCell>
                          <TableCell>
                            {perm.allowed ? (
                              <Badge className="bg-green-500/10 text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Allowed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/10 text-red-600">
                                <X className="h-3 w-3 mr-1" />
                                Denied
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {perm.expires_at
                              ? format(new Date(perm.expires_at), "MMM d, yyyy")
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeContextual(perm.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Audit Log</CardTitle>
                <CardDescription>
                  Complete history of all permission changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>{log.admin_name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge className={getActionTypeColor(log.action_type)}>
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.action_key}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.old_value && (
                            <span className="text-red-500 line-through mr-2">
                              {JSON.stringify(log.old_value).slice(0, 30)}
                            </span>
                          )}
                          {log.new_value && (
                            <span className="text-green-500">
                              {JSON.stringify(log.new_value).slice(0, 30)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {log.reason || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog?.open ?? false}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Permission Change
              </DialogTitle>
              <DialogDescription>
                You are about to{" "}
                <strong>{confirmDialog?.newValue ? "grant" : "revoke"}</strong>{" "}
                the permission <code className="bg-muted px-1 rounded">{confirmDialog?.actionKey}</code>{" "}
                for <strong className="capitalize">{confirmDialog?.role}</strong> role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason (required for audit)</label>
                <Textarea
                  placeholder="Why is this change being made?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button onClick={confirmChange} disabled={updating || !reason.trim()}>
                {updating ? "Updating..." : "Confirm Change"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
