import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  useProfessionalNetwork, 
  useNetworkSuggestions,
  WeightedConnection 
} from "@/hooks/useProfessionalNetwork";
import { 
  Users, 
  Link2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  MessageSquare,
  Building2,
  Clock,
  Search,
  UserPlus,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustBadgeInline } from "@/components/trust/TrustBreakdownPanel";

export function NetworkHealthPanel() {
  const { health, connections, loading } = useProfessionalNetwork();

  if (loading || !health) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Network Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{health.totalConnections}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{health.activeConnections}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{health.dormantConnections}</div>
            <div className="text-xs text-muted-foreground">Dormant</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{health.networkReach}</div>
            <div className="text-xs text-muted-foreground">Reach</div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">Connection Diversity</span>
            <Badge variant={health.connectionDiversity >= 75 ? "default" : "secondary"}>
              {health.connectionDiversity}%
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">Avg. Strength</span>
            <Badge variant={health.avgConnectionStrength >= 60 ? "default" : "secondary"}>
              {Math.round(health.avgConnectionStrength)}%
            </Badge>
          </div>
        </div>

        {/* Suggested Actions */}
        {health.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Suggestions</h4>
            {health.suggestedActions.slice(0, 2).map((action) => (
              <div 
                key={action.id} 
                className={cn(
                  "p-2 rounded text-sm flex items-center gap-2",
                  action.priority === "high" ? "bg-red-50 dark:bg-red-950/30" :
                  action.priority === "medium" ? "bg-amber-50 dark:bg-amber-950/30" :
                  "bg-muted/50"
                )}
              >
                {action.type === "reconnect" && <Clock className="h-4 w-4 text-amber-500" />}
                {action.type === "diversify" && <Sparkles className="h-4 w-4 text-blue-500" />}
                {action.type === "strengthen" && <TrendingUp className="h-4 w-4 text-green-500" />}
                <span>{action.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeightedConnectionsList() {
  const { connections, loading, updateConnectionNotes } = useProfessionalNetwork();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredConnections = useMemo(() => {
    return connections.filter(conn => {
      const matchesSearch = conn.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.institution?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || conn.connectionType === filterType;
      return matchesSearch && matchesType;
    });
  }, [connections, searchQuery, filterType]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Connections
          </CardTitle>
          <Badge variant="secondary">{connections.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 flex-wrap">
          {["all", "work", "research", "funding", "mentorship"].map((type) => (
            <Button
              key={type}
              variant={filterType === type || (type === "all" && !filterType) ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type === "all" ? null : type)}
              className="text-xs"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Connection List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredConnections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No connections found</p>
            </div>
          ) : (
            filteredConnections.map((conn) => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionCard({ connection }: { connection: WeightedConnection }) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={connection.avatarUrl} />
        <AvatarFallback>
          {connection.fullName.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{connection.fullName}</span>
          <TrustBadgeInline score={connection.trustScore} size="sm" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {connection.institution && (
            <>
              <Building2 className="h-3 w-3" />
              <span className="truncate">{connection.institution}</span>
            </>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {connection.connectionType}
          </Badge>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            connection.isFresh ? "bg-green-500" : "bg-amber-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {connection.connectionStrength}% strength
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {connection.mutualConnections} mutual
        </div>
      </div>

      <Button variant="ghost" size="icon">
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NetworkSuggestionsPanel() {
  const { suggestions, loading } = useNetworkSuggestions();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No suggestions right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {suggestion.user.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{suggestion.user.fullName}</span>
                    <TrustBadgeInline score={suggestion.user.trustScore} size="sm" />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {suggestion.reason}
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary">{suggestion.relevanceScore}% relevant</Badge>
                </div>

                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
