import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, UserCheck, Bell, Eye } from "lucide-react";
import { 
  useConnections, 
  useFollowers, 
  useFollowing, 
  usePendingConnectionRequests,
  useNetworkSuggestions,
  useAcceptConnectionRequest,
  useDeclineConnectionRequest,
  useProfileViews,
} from "@/hooks/useNetwork";
import { NetworkSuggestionCard, FollowButton } from "@/components/network";

export default function NetworkPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("connections");
  
  const { data: connections, isLoading: loadingConnections } = useConnections(user?.id);
  const { data: followers, isLoading: loadingFollowers } = useFollowers(user?.id);
  const { data: following, isLoading: loadingFollowing } = useFollowing(user?.id);
  const { data: pendingRequests, isLoading: loadingPending } = usePendingConnectionRequests();
  const { data: suggestions, isLoading: loadingSuggestions } = useNetworkSuggestions();
  const { data: profileViews, isLoading: loadingViews } = useProfileViews();
  
  const acceptRequest = useAcceptConnectionRequest();
  const declineRequest = useDeclineConnectionRequest();
  
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }
  
  const renderUserCard = (userData: any, showFollow = false) => {
    const displayName = userData?.full_name || 
      `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() || 
      "Unknown User";
    
    return (
      <Card key={userData?.id}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Link to={`/u/${userData?.id}`}>
              <Avatar className="h-12 w-12">
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/u/${userData?.id}`} className="font-medium hover:underline line-clamp-1">
                {displayName}
              </Link>
              {userData?.role && (
                <p className="text-sm text-muted-foreground capitalize">{userData.role}</p>
              )}
              {userData?.university && (
                <p className="text-xs text-muted-foreground line-clamp-1">{userData.university}</p>
              )}
            </div>
            {showFollow && <FollowButton userId={userData?.id} />}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderSkeleton = () => (
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
  );
  
  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Network</h1>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Pending Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Pending Invitations ({pendingRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingRequests.map((request: any) => {
                    const requester = request.requester;
                    const displayName = requester?.full_name || 
                      `${requester?.first_name || ""} ${requester?.last_name || ""}`.trim() || 
                      "Unknown User";
                    
                    return (
                      <div key={request.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Link to={`/u/${requester?.id}`}>
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/u/${requester?.id}`} className="font-medium hover:underline">
                            {displayName}
                          </Link>
                          {requester?.role && (
                            <p className="text-sm text-muted-foreground capitalize">{requester.role}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRequest.mutate(request.id)}
                            disabled={acceptRequest.isPending}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => declineRequest.mutate(request.id)}
                            disabled={declineRequest.isPending}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="connections">
                  Connections ({connections?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="followers">
                  Followers ({followers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="following">
                  Following ({following?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="views">
                  <Eye className="h-4 w-4 mr-1" />
                  Views
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="connections" className="mt-4">
                {loadingConnections ? (
                  renderSkeleton()
                ) : connections && connections.length > 0 ? (
                  <div className="space-y-3">
                    {connections.map((conn: any) => renderUserCard(conn.connectedUser))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No connections yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building your network by connecting with researchers
                      </p>
                      <Button asChild>
                        <Link to="/matches">Find People</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="followers" className="mt-4">
                {loadingFollowers ? (
                  renderSkeleton()
                ) : followers && followers.length > 0 ? (
                  <div className="space-y-3">
                    {followers.map((f: any) => renderUserCard(f.follower, true))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No followers yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your work and engage with the community to grow your following
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="following" className="mt-4">
                {loadingFollowing ? (
                  renderSkeleton()
                ) : following && following.length > 0 ? (
                  <div className="space-y-3">
                    {following.map((f: any) => renderUserCard(f.following))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Not following anyone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Follow researchers to see their updates in your feed
                      </p>
                      <Button asChild>
                        <Link to="/matches">Discover People</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="views" className="mt-4">
                {loadingViews ? (
                  renderSkeleton()
                ) : profileViews && profileViews.length > 0 ? (
                  <div className="space-y-3">
                    {profileViews.map((view: any) => renderUserCard(view.viewer))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No profile views yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete your profile to attract more visitors
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar - Suggestions */}
          <aside className="lg:col-span-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  People You May Know
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSuggestions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : suggestions && suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion: any) => (
                      <NetworkSuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No suggestions available
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
