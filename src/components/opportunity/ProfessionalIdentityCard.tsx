import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  CheckCircle2,
  Briefcase,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useProfessionalIdentity } from "@/hooks/useProfessionalIdentity";
import { useAuth } from "@/contexts/AuthContext";

interface ProfessionalIdentityCardProps {
  userId?: string;
  compact?: boolean;
  showLink?: boolean;
}

export function ProfessionalIdentityCard({
  userId,
  compact = false,
  showLink = true,
}: ProfessionalIdentityCardProps) {
  const { profile } = useAuth();
  const { data: identity, isLoading } = useProfessionalIdentity(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!identity) {
    return null;
  }

  const getTierColor = () => {
    switch (identity.trustTier) {
      case "platinum":
        return "text-purple-500";
      case "gold":
        return "text-amber-500";
      case "silver":
        return "text-gray-400";
      default:
        return "text-orange-400";
    }
  };

  const getRoleIcon = () => {
    switch (identity.primaryRole) {
      case "researcher":
        return "🔬";
      case "student":
        return "🎓";
      case "freelancer":
        return "💼";
      case "mentor":
        return "🧑‍🏫";
      case "institution_rep":
        return "🏛️";
      default:
        return "👤";
    }
  };

  const content = (
    <div className={`flex ${compact ? "items-center gap-3" : "flex-col gap-4"}`}>
      <div className="flex items-center gap-3">
        <Avatar className={compact ? "h-10 w-10" : "h-14 w-14"}>
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {profile?.full_name?.charAt(0)?.toUpperCase() || getRoleIcon()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>
              {profile?.full_name || "Anonymous"}
            </span>
            {identity.isVerified && (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"} line-clamp-1`}>
            {identity.headline}
          </p>
        </div>

        {!compact && (
          <div className="flex items-center gap-1">
            <Shield className={`h-5 w-5 ${getTierColor()}`} />
            <span className="font-bold text-lg">{identity.trustScore}</span>
          </div>
        )}
      </div>

      {!compact && (
        <>
          {/* Capability Tags */}
          {identity.capabilityTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {identity.capabilityTags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {identity.projectsCompleted > 0 && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{identity.projectsCompleted} projects</span>
              </div>
            )}
            {identity.escrowSuccess > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>{Math.round(identity.escrowSuccess)}% success</span>
              </div>
            )}
            {identity.institutionsWorkedWith.length > 0 && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{identity.institutionsWorkedWith.length} institutions</span>
              </div>
            )}
          </div>
        </>
      )}

      {compact && (
        <Badge variant="outline" className={`shrink-0 ${getTierColor()}`}>
          {identity.trustTier}
        </Badge>
      )}
    </div>
  );

  if (showLink && userId) {
    return (
      <Link to={`/u/${userId}`}>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className={compact ? "p-3" : "p-4"}>
            {content}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <CardContent className={compact ? "p-3" : "p-4"}>
        {content}
      </CardContent>
    </Card>
  );
}
