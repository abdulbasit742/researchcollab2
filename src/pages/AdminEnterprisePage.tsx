import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Users, Package, DollarSign, TrendingUp, Eye,
  Search, FileText, Plus, BarChart3, CheckCircle2, AlertCircle
} from "lucide-react";
import { 
  dummyOrganizations, dummyOrgMembers, dummyBulkLicenses, 
  dummyOrgProjects, dummyOrgInvoices, getOrgTypeLabel, getOrgStats
} from "@/data/organizations";

const AdminEnterprisePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("organizations");

  // Aggregate stats
  const totalOrgs = dummyOrganizations.length;
  const totalMembers = dummyOrgMembers.length;
  const totalLicenseRevenue = dummyBulkLicenses.reduce((sum, l) => sum + l.totalPrice, 0);
  const totalProjectBudget = dummyOrgProjects.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalInvoicesPaid = dummyOrgInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  const filteredOrgs = dummyOrganizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInvoice = (orgName: string) => {
    toast({
      title: "Invoice Created",
      description: `New invoice created for ${orgName}`
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Enterprise Management</h1>
            <p className="text-muted-foreground">Manage universities, enterprises, and B2B clients</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs">Organizations</span>
              </div>
              <p className="text-2xl font-bold">{totalOrgs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Members</span>
              </div>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">License Revenue</span>
              </div>
              <p className="text-2xl font-bold">${totalLicenseRevenue}/mo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Project Budgets</span>
              </div>
              <p className="text-2xl font-bold">${totalProjectBudget}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Revenue Collected</span>
              </div>
              <p className="text-2xl font-bold">${totalInvoicesPaid}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="licenses">Bulk Licenses</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                    {filteredOrgs.map(org => {
                      const stats = getOrgStats(org.id);
                      return (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-sm text-muted-foreground">{org.city}, {org.country}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getOrgTypeLabel(org.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{stats.activeMembers}/{org.memberLimit}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={org.subscriptionPlan === 'enterprise' ? 'default' : 'secondary'}>
                              {org.subscriptionPlan}
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
                                onClick={() => handleCreateInvoice(org.name)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                    {dummyBulkLicenses.map(license => {
                      const org = dummyOrganizations.find(o => o.id === license.orgId);
                      const usagePercent = (license.usedSeats / license.totalSeats) * 100;
                      return (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">{org?.name}</TableCell>
                          <TableCell>{license.toolName}</TableCell>
                          <TableCell>{license.totalSeats}</TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={usagePercent} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {license.usedSeats}/{license.totalSeats}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>${license.totalPrice}</TableCell>
                          <TableCell>{license.endDate.toLocaleDateString()}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>All Organization Projects</CardTitle>
                <CardDescription>Track project programs across institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyOrgProjects.map(project => {
                      const org = dummyOrganizations.find(o => o.id === project.orgId);
                      const progressPercent = (project.completedCount / project.numberOfStudents) * 100;
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{project.title}</p>
                              <p className="text-sm text-muted-foreground">{project.duration}</p>
                            </div>
                          </TableCell>
                          <TableCell>{org?.name}</TableCell>
                          <TableCell>{project.numberOfStudents}</TableCell>
                          <TableCell>${project.totalBudget}</TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={progressPercent} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {project.completedCount}/{project.numberOfStudents}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Manage billing across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyOrgInvoices.map(invoice => {
                      const org = dummyOrganizations.find(o => o.id === invoice.orgId);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {invoice.status === 'paid' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : invoice.status === 'overdue' ? (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">{invoice.invoiceNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>{org?.name}</TableCell>
                          <TableCell className="font-semibold">${invoice.amount}</TableCell>
                          <TableCell>{invoice.dueDate.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                invoice.status === 'paid' ? 'default' : 
                                invoice.status === 'overdue' ? 'destructive' : 'secondary'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Organizations by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dummyOrganizations.slice(0, 5).map((org, index) => {
                      const stats = getOrgStats(org.id);
                      return (
                        <div key={org.id} className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{getOrgTypeLabel(org.type)}</p>
                          </div>
                          <span className="font-semibold">${stats.totalSpend}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organization Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['university', 'enterprise', 'research_lab', 'department', 'society'].map(type => {
                      const count = dummyOrganizations.filter(o => o.type === type).length;
                      const percent = (count / dummyOrganizations.length) * 100;
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{getOrgTypeLabel(type as any)}</span>
                            <span>{count} orgs</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>License Adoption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['ChatGPT 5.3 Pro', 'Perplexity Pro', 'Gemini 4 Ultra'].map(tool => {
                      const licenses = dummyBulkLicenses.filter(l => l.toolName === tool);
                      const totalSeats = licenses.reduce((sum, l) => sum + l.totalSeats, 0);
                      const usedSeats = licenses.reduce((sum, l) => sum + l.usedSeats, 0);
                      return (
                        <div key={tool}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{tool}</span>
                            <span>{usedSeats}/{totalSeats} seats</span>
                          </div>
                          <Progress value={totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">${totalLicenseRevenue}</p>
                      <p className="text-sm text-muted-foreground">MRR from Licenses</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminEnterprisePage;
