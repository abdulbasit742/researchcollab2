import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useMutualWorkContext } from "@/hooks/useMutualWorkContext";
import { Building, Users, Target, Star } from "lucide-react";

interface MutualWorkContextProps {
  targetUserId: string;
  className?: string;
}

export function MutualWorkContext({ targetUserId, className }: MutualWorkContextProps) {
  const { user } = useAuth();
  const { data, isLoading } = useMutualWorkContext(targetUserId);

  if (!user || user.id === targetUserId) return null;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const hasContext =
    data.sharedInstitutions.length > 0 ||
    data.mutualCollaborators > 0 ||
    data.sharedSkills.length > 0;

  if (!hasContext) return null;

  return (
    <Card className={`border-blue-200/50 bg-blue-50/30 dark:bg-blue-950/10 dark:border-blue-800/30 ${className || ""}`}>
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Users className="h-4 w-4" />
          Professional Overlap
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-2">
        {data.sharedInstitutions.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>
              You both worked with{" "}
              <span className="font-medium">
                {data.sharedInstitutions.slice(0, 2).join(" & ")}
              </span>
              {data.sharedInstitutions.length > 2 &&
                ` +${data.sharedInstitutions.length - 2} more`}
            </span>
          </div>
        )}

        {data.mutualCollaborators > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>
              <span className="font-medium">{data.mutualCollaborators} shared collaborator{data.mutualCollaborators !== 1 ? "s" : ""}</span>{" "}
              have worked with this person
            </span>
          </div>
        )}

        {data.sharedSkills.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              <span>Shared expertise:</span>
              {data.sharedSkills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
