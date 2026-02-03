import { AdminLayout } from "@/components/admin/AdminLayout";
import { useInfrastructureContracts } from "@/hooks/useInfrastructureContracts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  Shield, 
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Loader2
} from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { formatDistanceToNow, format } from "date-fns";

export default function AdminInfrastructurePage() {
  const { user } = useAuth();
  const {
    contracts,
    governanceRoles,
    governanceAssignments,
    loading,
    activateContract,
    terminateContract,
    getContractStats,
    getSuccessionChain,
  } = useInfrastructureContracts();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = getContractStats();
  const successionChain = getSuccessionChain();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "terminated":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Terminated</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case "institutional_license":
        return <FileText className="h-5 w-5" />;
      case "government_service":
        return <Shield className="h-5 w-5" />;
      case "data_access":
        return <Users className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Infrastructure & Governance</h1>
            <p className="text-muted-foreground">
              Manage contracts, governance roles, and platform succession
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contract Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(stats.totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Governance Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{governanceRoles.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contracts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="succession">Succession Chain</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-4">
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Contracts</h3>
                  <p className="text-muted-foreground mb-4">
                    Infrastructure contracts will appear here
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Contract
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getContractTypeIcon(contract.contract_type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{contract.entity_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {contract.contract_type.replace(/_/g, " ")} • {contract.entity_type}
                            </p>
                            {contract.contract_value && (
                              <p className="text-lg font-bold text-primary mt-1">
                                {formatPKR(contract.contract_value)}
                                {contract.billing_cycle && <span className="text-sm font-normal text-muted-foreground">/{contract.billing_cycle}</span>}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Start: {format(new Date(contract.start_date), "PPP")}
                              {contract.end_date && ` • End: ${format(new Date(contract.end_date), "PPP")}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(contract.status)}
                          {contract.auto_renew && (
                            <Badge variant="outline">Auto-renew</Badge>
                          )}
                          {contract.status === "pending" && user?.id && (
                            <Button size="sm" onClick={() => activateContract(contract.id, user.id)}>
                              Activate
                            </Button>
                          )}
                          {contract.status === "active" && (
                            <Button size="sm" variant="outline" onClick={() => terminateContract(contract.id)}>
                              Terminate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Governance Roles</CardTitle>
                <CardDescription>
                  Platform governance structure and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {governanceRoles.map((role) => (
                    <div key={role.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">{role.role_name}</h4>
                            <Badge variant="outline">Level {role.role_level}</Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {role.requires_mfa && (
                              <Badge variant="secondary">MFA Required</Badge>
                            )}
                            {role.max_holders && (
                              <Badge variant="outline">Max {role.max_holders} holders</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Succession Order</p>
                          <p className="font-bold">{role.succession_order || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="succession" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Succession Chain</CardTitle>
                <CardDescription>
                  Platform leadership succession order for continuity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successionChain.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Succession Chain</h3>
                    <p className="text-muted-foreground mb-4">
                      Assign governance roles to establish succession
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Role
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {successionChain.map((assignment, index) => (
                      <div key={assignment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{assignment.role?.role_name || "Unknown Role"}</p>
                          <p className="text-sm text-muted-foreground">
                            User ID: {assignment.user_id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">Priority {assignment.succession_priority || index + 1}</Badge>
                          {assignment.expires_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expires {formatDistanceToNow(new Date(assignment.expires_at), { addSuffix: true })}
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
    </AdminLayout>
  );
}
