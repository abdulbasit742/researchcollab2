import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, Users, Package, MapPin, Search, ArrowRight
} from "lucide-react";
import { dummyOrganizations, getOrgTypeLabel, getOrgStats, OrganizationType } from "@/data/organizations";

const OrganizationsListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredOrgs = dummyOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Organizations</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse universities, research labs, and enterprises using our platform
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="university">Universities</SelectItem>
              <SelectItem value="research_lab">Research Labs</SelectItem>
              <SelectItem value="enterprise">Enterprises</SelectItem>
              <SelectItem value="department">Departments</SelectItem>
              <SelectItem value="society">Societies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => {
            const stats = getOrgStats(org.id);
            return (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">{getOrgTypeLabel(org.type)}</Badge>
                  </div>
                  <CardTitle className="mt-4">{org.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {org.city}, {org.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                      </div>
                      <p className="font-semibold">{stats.activeMembers}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Package className="h-4 w-4" />
                      </div>
                      <p className="font-semibold">{stats.activeToolSubscriptions}</p>
                      <p className="text-xs text-muted-foreground">Tools</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <p className="font-semibold">{stats.ongoingProjects}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                  <Badge 
                    variant={org.subscriptionPlan === 'enterprise' ? 'default' : 'secondary'}
                    className="w-full justify-center mb-4"
                  >
                    {org.subscriptionPlan.charAt(0).toUpperCase() + org.subscriptionPlan.slice(1)} Plan
                  </Badge>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/org/${org.id}/dashboard`)}
                  >
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrganizationsListPage;
