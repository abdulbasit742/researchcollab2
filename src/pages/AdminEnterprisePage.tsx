import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Users, Package, DollarSign, TrendingUp, Eye,
  Search, FileText, Plus, Download
} from "lucide-react";
import { useAdminEnterprise } from "@/hooks/useAdminEnterprise";
import { exportToCSV } from "@/lib/csvExport";

const AdminEnterprisePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    organizations,
    members,
    licenses,
    loading,
    getStats,
  } = useAdminEnterprise();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("organizations");

  const stats = getStats();

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrgTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      university: "University",
      enterprise: "Enterprise",
      research_lab: "Research Lab",
      department: "Department"
    };
    return labels[type] || type;
  };

  const handleExportOrgs = () => {
    exportToCSV(organizations, "organizations.csv", [
      { key: "name", header: "Name" },
      { key: "type", header: "Type" },
      { key: "subscription_plan", header: "Plan" },
      { key: "status", header: "Status" },
      { key: "member_count", header: "Members" },
      { key: "total_spent", header: "Total Spent" },
    ]);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Enterprise Management</h1>
            <p className="text-muted-foreground">Manage universities, enterprises, and B2B clients</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportOrgs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs">Organizations</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Members</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">Active Licenses</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeLicenses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">${stats.totalRevenue}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Seat Usage</span>
              </div>
              <p className="text-2xl font-bold">{stats.usedSeats}/{stats.totalSeats}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="organizations">Organizations ({organizations.length})</TabsTrigger>
            <TabsTrigger value="licenses">Bulk Licenses ({licenses.length})</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                {filteredOrgs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {organizations.length === 0 ? "No organizations registered yet" : "No organizations match your search"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrgs.map(org => (
                          <TableRow key={org.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{org.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {org.city && org.country ? `${org.city}, ${org.country}` : "Location not set"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getOrgTypeLabel(org.type)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{org.member_count || 0}/{org.member_limit}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={org.subscription_plan === 'enterprise' ? 'default' : 'secondary'}>
                                {org.subscription_plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={org.status === 'active' ? 'default' : 'destructive'}>
                                {org.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/org/${org.id}/dashboard`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Invoice Created",
                                      description: `New invoice created for ${org.name}`
                                    });
                                  }}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Licenses Tab */}
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>All Bulk Licenses</CardTitle>
                <CardDescription>Manage tool licenses across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                {licenses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No bulk licenses created yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Tool</TableHead>
                          <TableHead>Seats</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Monthly</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenses.map(license => {
                          const usagePercent = (license.used_seats / license.total_seats) * 100;
                          return (
                            <TableRow key={license.id}>
                              <TableCell className="font-medium">{license.org_name}</TableCell>
                              <TableCell>{license.tool_name}</TableCell>
                              <TableCell>{license.total_seats}</TableCell>
                              <TableCell>
                                <div className="w-24">
                                  <Progress value={usagePercent} className="h-2" />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {license.used_seats}/{license.total_seats}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>${license.monthly_cost}</TableCell>
                              <TableCell>
                                {license.expires_at 
                                  ? new Date(license.expires_at).toLocaleDateString() 
                                  : "No expiry"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                                  {license.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>All Organization Members</CardTitle>
                <CardDescription>View members across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No organization members yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tool Access</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map(member => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.user_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{member.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.tool_access?.length || 0} tools
                            </TableCell>
                            <TableCell>
                              {new Date(member.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminEnterprisePage;
