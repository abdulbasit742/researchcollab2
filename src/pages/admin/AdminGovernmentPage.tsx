import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGovernmentIntegration } from "@/hooks/useGovernmentIntegration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Globe, 
  FileText, 
  Users, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Plus,
  Settings
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminGovernmentPage() {
  const {
    governmentBodies,
    countryPolicies,
    loading,
    activateIntegration,
    suspendIntegration,
  } = useGovernmentIntegration();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBodyTypeIcon = (type: string) => {
    switch (type) {
      case "education_ministry":
        return <Building2 className="h-5 w-5" />;
      case "research_council":
        return <Globe className="h-5 w-5" />;
      case "accreditation":
        return <Shield className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const activeIntegrations = governmentBodies.filter(b => b.integration_status === "active").length;
  const pendingIntegrations = governmentBodies.filter(b => b.integration_status === "pending").length;
  const enabledCountries = countryPolicies.filter(c => c.is_enabled).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Government Integration</h1>
            <p className="text-muted-foreground">
              Manage government body integrations and country policies
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Government Body
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeIntegrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingIntegrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enabled Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enabledCountries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bodies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{governmentBodies.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bodies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bodies">Government Bodies</TabsTrigger>
            <TabsTrigger value="countries">Country Policies</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="bodies" className="space-y-4">
            {governmentBodies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Government Bodies</h3>
                  <p className="text-muted-foreground mb-4">
                    Add government bodies to enable official integrations
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Body
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {governmentBodies.map((body) => (
                  <Card key={body.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getBodyTypeIcon(body.body_type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{body.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {body.country} • {body.body_type.replace(/_/g, " ")}
                            </p>
                            {body.contact_email && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Contact: {body.contact_name} ({body.contact_email})
                              </p>
                            )}
                            {body.agreement_signed_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Agreement signed {formatDistanceToNow(new Date(body.agreement_signed_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(body.integration_status)}
                          <Badge variant="outline">{body.api_access_level}</Badge>
                          {body.integration_status === "pending" && (
                            <Button size="sm" onClick={() => activateIntegration(body.id)}>
                              Activate
                            </Button>
                          )}
                          {body.integration_status === "active" && (
                            <Button size="sm" variant="outline" onClick={() => suspendIntegration(body.id)}>
                              Suspend
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

          <TabsContent value="countries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Country Policies</CardTitle>
                <CardDescription>
                  Configure country-specific policies and compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {countryPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getCountryFlag(policy.country_code)}</span>
                        <div>
                          <p className="font-medium">{policy.country_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {policy.country_code}
                            {policy.tax_rate_percentage && ` • Tax: ${policy.tax_rate_percentage}%`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {policy.is_enabled ? (
                          <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                        {policy.payment_enabled && (
                          <Badge variant="outline">Payments</Badge>
                        )}
                        {policy.government_integration_enabled && (
                          <Badge variant="outline">Gov Integration</Badge>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Government Reports</CardTitle>
                <CardDescription>
                  Scheduled and on-demand reports for government bodies
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reports Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated reports for government bodies
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
