import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Users, 
  MapPin, 
  Shield,
  CheckCircle2,
  Mail,
  TrendingUp,
} from "lucide-react";

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");

  // Fetch organization details
  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, type, city, country, status, org_trust_score, created_at")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch organization members
  const { data: members } = useQuery({
    queryKey: ["organization-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("id, role, user_id, status, created_at")
        .eq("org_id", id)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!org) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Organization Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This organization doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/org">Browse Organizations</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isVerified = org.status === "active";
  const location = [org.city, org.country].filter(Boolean).join(", ");

  return (
    <MainLayout>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {org.name?.charAt(0) || "O"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{org.name}</h1>
                {isVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {org.type && (
                  <Badge variant="outline" className="capitalize">
                    {org.type}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {members?.length || 0} members
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="members">
                  Members ({members?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About {org.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {org.type ? `A ${org.type} organization` : "Professional organization"} 
                      {location && ` based in ${location}`}.
                    </p>
                  </CardContent>
                </Card>

                {/* Trust & Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Trust & Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {org.org_trust_score || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Trust Score</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold capitalize">
                          {org.status || "Pending"}
                        </p>
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {members && members.length > 0 ? (
                      <div className="divide-y">
                        {members.map((member) => (
                          <Link 
                            key={member.id}
                            to={`/u/${member.user_id}`}
                            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                          >
                            <Avatar>
                              <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">Member</p>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No public members</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Organization Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium">{members?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="font-medium">{org.org_trust_score || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={isVerified ? "default" : "secondary"}>
                    {isVerified ? "Active" : org.status || "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {location && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Philosophy */}
            <Card className="bg-muted/30">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  Institutional verification builds platform credibility.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
