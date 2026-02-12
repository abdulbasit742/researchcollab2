import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Package, FolderKanban, CreditCard, BarChart3, Settings,
  Building2, UserPlus, Eye, ArrowRight, TrendingUp, Calendar
} from "lucide-react";
import { InstitutionEconomicPanels } from "@/components/institution/InstitutionEconomicPanels";
import { 
  getOrganizationById, getOrgStats, getOrgMembers, getOrgLicenses, 
  getOrgProjects, getOrgInvoices, getOrgTypeLabel, getRoleLabel 
} from "@/data/organizations";

const OrganizationDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const org = getOrganizationById(id || '');
  const stats = org ? getOrgStats(org.id) : null;
  const members = org ? getOrgMembers(org.id) : [];
  const licenses = org ? getOrgLicenses(org.id) : [];
  const projects = org ? getOrgProjects(org.id) : [];
  const invoices = org ? getOrgInvoices(org.id) : [];

  if (!org) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <Button onClick={() => navigate('/org')}>Browse Organizations</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{getOrgTypeLabel(org.type)}</Badge>
                <span className="text-sm text-muted-foreground">{org.city}, {org.country}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/org/${id}/settings`)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => navigate(`/org/${id}/members`)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Members</span>
              </div>
              <p className="text-2xl font-bold">{stats?.activeMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">Tools</span>
              </div>
              <p className="text-2xl font-bold">{stats?.activeToolSubscriptions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FolderKanban className="h-4 w-4" />
                <span className="text-xs">Projects</span>
              </div>
              <p className="text-2xl font-bold">{stats?.ongoingProjects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">Total Spend</span>
              </div>
              <p className="text-2xl font-bold">${stats?.totalSpend}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Commission</span>
              </div>
              <p className="text-2xl font-bold">${stats?.commissionEarned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats?.pendingApprovals}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="economics">Economics</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="economics">
            <InstitutionEconomicPanels 
              orgId={org.id}
              stats={{
                totalEarnings: stats?.totalSpend || 0,
                completedDeals: stats?.ongoingProjects || 0,
                activeDeals: stats?.ongoingProjects || 0,
                avgTrustScore: 62,
                memberCount: stats?.activeMembers || 0,
              }}
            />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Members */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Members</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/org/${id}/members`)}>
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.userName}</p>
                          <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                        </div>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Licenses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Tool Licenses</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/org/${id}/tools`)}>
                    Manage <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {licenses.map(license => (
                      <div key={license.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{license.toolName}</span>
                          <span className="text-sm text-muted-foreground">
                            {license.usedSeats}/{license.totalSeats} seats
                          </span>
                        </div>
                        <Progress value={(license.usedSeats / license.totalSeats) * 100} className="h-2" />
                      </div>
                    ))}
                    {licenses.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No active licenses</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Active Projects</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/org/${id}/projects`)}>
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                      <div key={project.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{project.title}</span>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {project.completedCount}/{project.numberOfStudents} students completed
                        </p>
                        <Progress 
                          value={(project.completedCount / project.numberOfStudents) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Invoices</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/org/${id}/billing`)}>
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.slice(0, 4).map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${invoice.amount}</p>
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'overdue' ? 'destructive' : 'secondary'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>All Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.userName}</p>
                        <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => navigate(`/org/${id}/members`)}>
                  Manage Members
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Tool Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenses.map(license => (
                    <div key={license.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{license.toolName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Expires: {license.endDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                          {license.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Seats Used</span>
                        <span>{license.usedSeats}/{license.totalSeats}</span>
                      </div>
                      <Progress value={(license.usedSeats / license.totalSeats) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => navigate(`/org/${id}/tools`)}>
                  Manage Licenses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Organization Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="ml-1 font-medium">${project.totalBudget}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Students:</span>
                          <span className="ml-1 font-medium">{project.numberOfStudents}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="ml-1 font-medium">{project.completedCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => navigate(`/org/${id}/projects`)}>
                  Manage Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {invoice.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${invoice.amount}</p>
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'overdue' ? 'destructive' : 'secondary'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => navigate(`/org/${id}/billing`)}>
                  View Billing Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OrganizationDashboardPage;
