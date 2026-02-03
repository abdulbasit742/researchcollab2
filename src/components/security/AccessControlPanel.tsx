import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  Users,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Plus
} from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function AccessControlPanel() {
  const {
    permissions,
    roles,
    policies,
    accessRequests,
    loading,
    getEffectivePermissions,
    getPendingRequests,
    reviewAccessRequest
  } = useAccessControl();

  const effectivePermissions = getEffectivePermissions();
  const pendingRequests = getPendingRequests();

  const groupPermissionsByResource = () => {
    const grouped: Record<string, typeof permissions> = {};
    effectivePermissions.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  const groupedPermissions = groupPermissionsByResource();

  return (
    <div className="space-y-6">
      {/* Pending Access Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Pending Access Requests</CardTitle>
              <Badge>{pendingRequests.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div 
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
              >
                <div>
                  <div className="font-medium">
                    {request.requester_name} requests <Badge variant="outline">{request.requested_access}</Badge> access
                  </div>
                  <div className="text-sm text-muted-foreground">
                    To: {request.resource_name} ({request.resource_type})
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Reason: {request.reason}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => reviewAccessRequest(request.id, true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => reviewAccessRequest(request.id, false)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">My Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your Permissions
              </CardTitle>
              <CardDescription>
                Actions you're authorized to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium capitalize">{resource}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                    {perms.map((perm) => (
                      <div 
                        key={perm.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm capitalize">{perm.action}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {perm.scope}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {effectivePermissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No specific permissions assigned
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Available Roles
                  </CardTitle>
                  <CardDescription>
                    Role definitions and their permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {role.user_count} users
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {role.description}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((permId) => {
                      const perm = permissions.find(p => p.id === permId);
                      return perm ? (
                        <Badge key={permId} variant="outline" className="text-xs">
                          {perm.resource}.{perm.action}
                        </Badge>
                      ) : null;
                    })}
                    {role.permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Access Policies
              </CardTitle>
              <CardDescription>
                Fine-grained access control policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length > 0 ? (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div 
                      key={policy.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        !policy.is_enabled && "opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{policy.name}</span>
                          <Badge 
                            variant={policy.effect === 'allow' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {policy.effect.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant="outline">Priority: {policy.priority}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {policy.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Resource: {policy.resource_type} • 
                        {policy.conditions.length} condition(s)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <div>No custom policies defined</div>
                  <div className="text-sm">
                    Access is controlled by role-based permissions
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Access Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Access Request History</CardTitle>
          <CardDescription>Your recent access requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {accessRequests.length > 0 ? (
            <div className="space-y-3">
              {accessRequests.slice(0, 10).map((request) => (
                <div 
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {request.resource_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.requested_access} access • 
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'denied' ? 'destructive' :
                      request.status === 'expired' ? 'secondary' : 'outline'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No access requests yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
