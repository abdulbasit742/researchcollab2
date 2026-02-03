import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Building, 
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutualCollaborators } from "@/hooks/useMutualCollaborators";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface MutualWorkBadgeProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

export function MutualWorkBadge({ userId, className, showDetails = false }: MutualWorkBadgeProps) {
  const { data, isLoading } = useMutualCollaborators(userId);

  if (isLoading) {
    return <Skeleton className="h-5 w-32" />;
  }

  if (!data || (data.totalMutualConnections === 0 && !data.sharedInstitution && data.sharedProjects === 0)) {
    return null;
  }

  const badges = [];

  if (data.sharedInstitution) {
    badges.push(
      <TooltipProvider key="institution">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Building className="h-3 w-3" />
              Same Institution
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>You're both from the same institution</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (data.sharedProjects > 0) {
    badges.push(
      <TooltipProvider key="projects">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Briefcase className="h-3 w-3" />
              {data.sharedProjects} shared project{data.sharedProjects !== 1 ? "s" : ""}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>You've both worked on {data.sharedProjects} project{data.sharedProjects !== 1 ? "s" : ""}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (data.totalMutualConnections > 0) {
    badges.push(
      <TooltipProvider key="connections">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="h-3 w-3" />
              {data.totalMutualConnections} mutual collaborator{data.totalMutualConnections !== 1 ? "s" : ""}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium mb-2">Mutual Collaborators</p>
            <div className="space-y-2">
              {data.mutualCollaborators.slice(0, 3).map((collab) => (
                <div key={collab.id} className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {collab.fullName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collab.fullName}</span>
                  {collab.verified && (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  )}
                </div>
              ))}
              {data.totalMutualConnections > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{data.totalMutualConnections - 3} more
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges}
    </div>
  );
}

// Expanded version showing full mutual work context
interface MutualWorkContextProps {
  userId: string;
  className?: string;
}

export function MutualWorkContext({ userId, className }: MutualWorkContextProps) {
  const { data, isLoading } = useMutualCollaborators(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data || (data.totalMutualConnections === 0 && !data.sharedInstitution && data.sharedProjects === 0)) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Users className="h-4 w-4" />
        Your Connection
      </h4>

      <div className="flex flex-wrap gap-2">
        {data.sharedInstitution && (
          <Badge variant="outline" className="gap-1">
            <Building className="h-3 w-3" />
            Same Institution
          </Badge>
        )}
        {data.sharedProjects > 0 && (
          <Badge variant="outline" className="gap-1">
            <Briefcase className="h-3 w-3" />
            {data.sharedProjects} Shared Project{data.sharedProjects !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {data.mutualCollaborators.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {data.totalMutualConnections} mutual collaborator{data.totalMutualConnections !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            {data.mutualCollaborators.slice(0, 4).map((collab) => (
              <TooltipProvider key={collab.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/u/${collab.id}`}>
                      <Avatar className="h-8 w-8 border-2 border-background hover:ring-2 ring-primary transition-all">
                        <AvatarFallback className="text-xs">
                          {collab.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{collab.fullName}</p>
                    {collab.role && (
                      <p className="text-xs text-muted-foreground capitalize">{collab.role}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {data.totalMutualConnections > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                +{data.totalMutualConnections - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
