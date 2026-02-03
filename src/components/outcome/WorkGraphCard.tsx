import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Briefcase,
  GraduationCap,
  DollarSign,
  Building,
  CheckCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  connection_type: string;
  project_reference: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  connected_user_name?: string;
}

const CONNECTION_TYPES: Record<string, { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  worked_with: { 
    icon: Briefcase, 
    label: "Worked with", 
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950/50"
  },
  reviewed_by: { 
    icon: UserCheck, 
    label: "Reviewed by", 
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950/50"
  },
  funded_by: { 
    icon: DollarSign, 
    label: "Funded by", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50"
  },
  mentored_by: { 
    icon: GraduationCap, 
    label: "Mentored by", 
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-950/50"
  },
  institutionally_verified: { 
    icon: Building, 
    label: "Institution verified", 
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950/50"
  },
  collaborated_on: {
    icon: Users,
    label: "Collaborated on",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-950/50"
  },
};

interface WorkGraphCardProps {
  connections: WorkConnection[];
  isCompact?: boolean;
  maxDisplay?: number;
}

export function WorkGraphCard({ 
  connections, 
  isCompact = false,
  maxDisplay = 5 
}: WorkGraphCardProps) {
  const verifiedConnections = connections.filter(c => c.verified);
  const displayConnections = connections.slice(0, maxDisplay);

  // Group by connection type for stats
  const typeStats = connections.reduce((acc, conn) => {
    acc[conn.connection_type] = (acc[conn.connection_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isCompact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Work Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total connections</span>
              <span className="font-semibold">{connections.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                Verified
              </span>
              <span className="font-semibold text-emerald-600">{verifiedConnections.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeStats).slice(0, 3).map(([type, count]) => {
                const config = CONNECTION_TYPES[type] || { label: type, color: "text-muted-foreground", bgColor: "bg-muted" };
                return (
                  <Badge key={type} variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
                    {count} {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full mt-4">
            <Link to="/network">View Network</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Work Graph
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            {verifiedConnections.length} verified
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Professional relationships based on actual work, not social connections
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Type Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(typeStats).map(([type, count]) => {
            const config = CONNECTION_TYPES[type] || { 
              icon: Users, 
              label: type.replace(/_/g, " "), 
              color: "text-muted-foreground",
              bgColor: "bg-muted"
            };
            const Icon = config.icon;
            return (
              <div key={type} className={cn("p-3 rounded-lg", config.bgColor)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <span className={cn("text-lg font-bold", config.color)}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Connection List */}
        {displayConnections.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {displayConnections.map((conn) => {
                const config = CONNECTION_TYPES[conn.connection_type] || {
                  icon: Users,
                  label: conn.connection_type.replace(/_/g, " "),
                  color: "text-muted-foreground",
                  bgColor: "bg-muted"
                };
                const Icon = config.icon;
                
                return (
                  <Link
                    key={conn.id}
                    to={`/u/${conn.connected_user_id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {conn.connected_user_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {conn.connected_user_name || "Unknown"}
                        </span>
                        {conn.verified && (
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon className={cn("h-3 w-3", config.color)} />
                        <span>{config.label}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Complete projects to build your work graph
            </p>
          </div>
        )}

        {connections.length > maxDisplay && (
          <Button variant="outline" asChild className="w-full">
            <Link to="/network">
              View all {connections.length} connections
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
