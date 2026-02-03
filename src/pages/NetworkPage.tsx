import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkConnections } from "@/hooks/useOutcomeFeed";
import { Navigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Building, 
  UserCheck, 
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CONNECTION_TYPES = {
  worked_with: { 
    icon: Briefcase, 
    label: "Worked with", 
    description: "Collaborated on projects",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950/50"
  },
  reviewed_by: { 
    icon: UserCheck, 
    label: "Reviewed by", 
    description: "Peer reviewed your work",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950/50"
  },
  funded_by: { 
    icon: DollarSign, 
    label: "Funded by", 
    description: "Provided funding for work",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50"
  },
  mentored_by: { 
    icon: GraduationCap, 
    label: "Mentored by", 
    description: "Provided mentorship",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-950/50"
  },
  institutionally_verified: { 
    icon: Building, 
    label: "Institution verified", 
    description: "Verified through institution",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950/50"
  },
  collaborated_on: {
    icon: Users,
    label: "Collaborated on",
    description: "Joint project collaboration",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-950/50"
  },
};

export default function NetworkPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { connections, loading, getConnectionsByType, getVerifiedConnections } = useWorkConnections();
  
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  const verifiedConnections = getVerifiedConnections();

  // Group connections by type for stats
  const typeStats = connections.reduce((acc, conn) => {
    acc[conn.connection_type] = (acc[conn.connection_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredConnections = activeTab === "all" 
    ? connections 
    : activeTab === "verified" 
    ? verifiedConnections 
    : getConnectionsByType(activeTab);
  
  return (
    <MainLayout>
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Work Graph</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your professional network built from actual work relationships—not social connections. 
            Each connection represents real collaboration, mentorship, funding, or institutional verification.
          </p>
        </div>

        {/* Philosophy Banner */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">This is not a social graph</p>
                <p className="text-sm text-muted-foreground">
                  Connections here are labeled by relationship type and verified through work outcomes. 
                  Random connection farming and follower counts are irrelevant to your professional credibility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("all")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <span className="text-2xl font-bold">{connections.length}</span>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("verified")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Verified</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{verifiedConnections.length}</span>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("worked_with")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Worked With</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{typeStats.worked_with || 0}</span>
                </CardContent>
              </Card>
            </div>

            {/* Connection Type Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="all" className="text-xs">
                  All ({connections.length})
                </TabsTrigger>
                <TabsTrigger value="verified" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </TabsTrigger>
                {Object.entries(typeStats).map(([type, count]) => {
                  const config = CONNECTION_TYPES[type as keyof typeof CONNECTION_TYPES];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <TabsTrigger key={type} value={type} className="text-xs">
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredConnections.length > 0 ? (
                  <div className="space-y-3">
                    {filteredConnections.map((conn) => {
                      const config = CONNECTION_TYPES[conn.connection_type as keyof typeof CONNECTION_TYPES] || {
                        icon: Users,
                        label: conn.connection_type.replace(/_/g, " "),
                        color: "text-muted-foreground",
                        bgColor: "bg-muted"
                      };
                      const Icon = config.icon;
                      
                      return (
                        <Card key={conn.id} className="group hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Link to={`/u/${conn.connected_user_id}`}>
                                <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {conn.connected_user_name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link 
                                    to={`/u/${conn.connected_user_id}`} 
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {conn.connected_user_name || "Unknown"}
                                  </Link>
                                  {conn.verified && (
                                    <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200">
                                      <CheckCircle className="h-3 w-3" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={cn("text-xs", config.bgColor, config.color)}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {config.label}
                                  </Badge>
                                  {conn.project_reference && (
                                    <span className="text-xs text-muted-foreground">
                                      via project
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Link to={`/u/${conn.connected_user_id}`}>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No work connections yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        Complete projects, get peer reviews, and work with institutions to build your work graph
                      </p>
                      <Button asChild>
                        <Link to="/offers">Find Projects</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Connection Type Legend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Connection Types</CardTitle>
                <CardDescription className="text-xs">
                  What each relationship type means
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(CONNECTION_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={type} className="flex items-start gap-2">
                      <div className={cn("p-1.5 rounded", config.bgColor)}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Why Work Graph Matters */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Why This Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Trust signals:</strong> Verified work relationships boost your trust score
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Decision support:</strong> Others can see who you've actually worked with
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>No gaming:</strong> Connections come from outcomes, not requests
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Build Your Graph</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link to="/offers">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Find Projects to Work On
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link to="/verification">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Get Verified
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
