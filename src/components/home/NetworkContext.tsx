import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  Briefcase,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";

interface WorkConnection {
  id: string;
  name: string;
  avatar?: string;
  type: "collaborator" | "institution" | "project";
  context: string;
}

interface NetworkContextProps {
  sharedInstitutions: number;
  mutualCollaborators: WorkConnection[];
  sharedProjects: number;
  loading?: boolean;
}

export function NetworkContext({
  sharedInstitutions = 0,
  mutualCollaborators = [],
  sharedProjects = 0,
  loading = false,
}: NetworkContextProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Work Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasConnections = sharedInstitutions > 0 || mutualCollaborators.length > 0 || sharedProjects > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-primary" />
            Work Network
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Based on Work
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasConnections ? (
          <div className="py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Complete projects to build your work network.
            </p>
          </div>
        ) : (
          <>
            {/* Work-Based Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  {sharedInstitutions}
                </div>
                <p className="text-[10px] text-muted-foreground">Institutions</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {mutualCollaborators.length}
                </div>
                <p className="text-[10px] text-muted-foreground">Collaborators</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  {sharedProjects}
                </div>
                <p className="text-[10px] text-muted-foreground">Shared Work</p>
              </div>
            </div>

            {/* Recent Collaborators */}
            {mutualCollaborators.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Recent Collaborators</p>
                <div className="space-y-2">
                  {mutualCollaborators.slice(0, 3).map((person) => (
                    <Link
                      key={person.id}
                      to={`/u/${person.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {person.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{person.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {person.context}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Button variant="ghost" size="sm" className="w-full text-xs gap-1" asChild>
          <Link to="/network">
            View Work Network
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
