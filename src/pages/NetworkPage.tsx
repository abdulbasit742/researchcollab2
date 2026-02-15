import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkConnections } from "@/hooks/useOutcomeFeed";
import { 
  useConnections, 
  usePendingConnectionRequests,
  useNetworkSuggestions,
  useFollowing,
  useFollowers,
} from "@/hooks/useNetwork";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ConnectionRequestCard, NetworkConnectionCard, NetworkSuggestionCard } from "@/components/network";
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
  UserPlus,
  Search,
  Bell,
  Sparkles,
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { connections: workConnections, loading: workLoading, getVerifiedConnections } = useWorkConnections();
  const { data: networkConnections, isLoading: connectionsLoading } = useConnections(user?.id);
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingConnectionRequests();
  const { data: suggestions, isLoading: suggestionsLoading } = useNetworkSuggestions();
  const { data: following } = useFollowing(user?.id);
  const { data: followers } = useFollowers(user?.id);
  
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  const verifiedConnections = getVerifiedConnections();
  const pendingCount = pendingRequests?.length || 0;

  const handleMessage = (userId: string) => {
    navigate(`/messages?user=${userId}`);
  };

  // Filter work connections by search
  const filteredWorkConnections = workConnections.filter((conn) =>
    conn.connected_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Network</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your professional connections built from real work outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/matches">
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Find Matches
              </Button>
            </Link>
            {pendingCount > 0 && (
              <Button onClick={() => setActiveTab("requests")}>
                <Bell className="h-4 w-4 mr-2" />
                {pendingCount} Pending
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("connections")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{networkConnections?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("work-graph")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{verifiedConnections.length}</p>
              <p className="text-xs text-muted-foreground">Verified Work</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("following")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{following?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("followers")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{followers?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-4 overflow-x-auto">
                <TabsTrigger value="connections" className="gap-1">
                  <Users className="h-4 w-4" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Requests
                  {pendingCount > 0 && (
                    <Badge className="ml-1 h-5 px-1.5">{pendingCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="work-graph" className="gap-1">
                  <Briefcase className="h-4 w-4" />
                  Work Graph
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Suggestions
                </TabsTrigger>
              </TabsList>

              {/* Connections Tab */}
              <TabsContent value="connections">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search connections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {connectionsLoading ? (
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
                ) : networkConnections && networkConnections.length > 0 ? (
                  <div className="space-y-3">
                    {networkConnections.map((conn) => (
                      <NetworkConnectionCard
                        key={conn.id}
                        connection={conn}
                        onMessage={handleMessage}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-6 sm:py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No connections yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        Start building your network by completing projects and connecting with professionals.
                      </p>
                      <Button asChild>
                        <Link to="/matches">Find People</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests">
                {requestsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
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
                ) : pendingRequests && pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request: any) => (
                      <ConnectionRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-6 sm:py-12 text-center">
                      <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No pending requests</h3>
                      <p className="text-sm text-muted-foreground">
                        Connection requests will appear here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Work Graph Tab */}
              <TabsContent value="work-graph">
                {/* Philosophy Banner */}
                <Card className="mb-4 border-primary/20 bg-primary/5">
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        These connections are labeled by relationship type and verified through work outcomes. 
                        They represent real collaboration, not social connections.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {workLoading ? (
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
                ) : filteredWorkConnections.length > 0 ? (
                  <div className="space-y-3">
                    {filteredWorkConnections.map((conn) => {
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
                    <CardContent className="py-6 sm:py-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No work connections yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        Complete projects and collaborations to build your work graph.
                      </p>
                      <Button asChild>
                        <Link to="/offers">Find Projects</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions">
                {suggestionsLoading ? (
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
                ) : suggestions && suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion: any) => (
                      <NetworkSuggestionCard 
                        key={suggestion.id} 
                        suggestion={suggestion}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No suggestions yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        Complete your profile to get personalized connection suggestions.
                      </p>
                      <Button asChild>
                        <Link to="/profile">Complete Profile</Link>
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
                <CardTitle className="text-sm">Work Relationship Types</CardTitle>
                <CardDescription className="text-xs">
                  How connections are categorized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(CONNECTION_TYPES).slice(0, 4).map(([type, config]) => {
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
                    <strong>Trust signals:</strong> Verified work relationships boost your score
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Decision support:</strong> Others see who you've actually worked with
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
                <CardTitle className="text-sm">Build Your Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link to="/offers">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Find Projects
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link to="/matches">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Smart Matching
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
