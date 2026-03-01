import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNationalSovereignty, useSovereignFederationLinks } from "@/hooks/useNationalSovereignty";
import {
  Globe,
  Flag,
  Building,
  TrendingUp,
  Network,
  Shield,
  MapPin,
} from "lucide-react";

export default function SovereignDashboardPage() {
  const { profiles, isLoading, fetchActiveProfiles } = useNationalSovereignty();
  const { links, fetchActiveLinks } = useSovereignFederationLinks();

  useEffect(() => {
    fetchActiveProfiles();
    fetchActiveLinks();
  }, [fetchActiveProfiles, fetchActiveLinks]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Sovereign Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            National Research Output · Human Capital Growth · Emergency Research Programs
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Flag className="h-8 w-8 text-primary" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{profiles.length}</p>}
                  <p className="text-sm text-muted-foreground">Active Nations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-blue-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{links.length}</p>}
                  <p className="text-sm text-muted-foreground">Federation Links</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {profiles.filter(p => p.deployment_model === "sovereign").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sovereign Nodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {profiles.filter(p => p.deployment_model === "hybrid").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Hybrid Deployments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nations Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              National Infrastructure Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active National Profiles</h3>
                <p className="text-muted-foreground">
                  Sovereign infrastructure profiles will appear here once nations are onboarded.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{profile.country_name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.country_code}</p>
                      </div>
                      <Badge variant="outline" className={
                        profile.deployment_model === "sovereign"
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                          : profile.deployment_model === "hybrid"
                            ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
                            : "bg-muted text-muted-foreground"
                      }>
                        {profile.deployment_model}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                          {profile.status}
                        </Badge>
                      </div>
                      {profile.data_residency_rules && Object.keys(profile.data_residency_rules).length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          Data residency rules configured
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Federation Links */}
        {links.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Active Federation Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.map((link: any) => (
                  <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{link.source_country}</Badge>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{link.target_country}</Badge>
                    </div>
                    <Badge variant={link.status === "active" ? "default" : "secondary"}>
                      {link.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
