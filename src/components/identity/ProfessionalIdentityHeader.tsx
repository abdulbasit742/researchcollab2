import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Shield, 
  Star, 
  Briefcase, 
  GraduationCap, 
  Building,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfessionalIdentityProps {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  headline?: string;
  role?: "student" | "researcher" | "freelancer" | "mentor" | "institution_rep" | "unknown";
  institution?: string | null;
  trustScore?: number;
  trustTier?: "bronze" | "silver" | "gold" | "platinum";
  trustTrajectory?: "rising" | "falling" | "stable";
  projectsCompleted?: number;
  successRate?: number;
  isVerified?: boolean;
  capabilityTags?: string[];
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
  linkToProfile?: boolean;
  className?: string;
}

export function ProfessionalIdentityHeader({
  userId,
  fullName,
  avatarUrl,
  headline,
  role = "unknown",
  institution,
  trustScore = 0,
  trustTier = "bronze",
  trustTrajectory = "stable",
  projectsCompleted = 0,
  successRate = 0,
  isVerified = false,
  capabilityTags = [],
  size = "md",
  showActions = false,
  linkToProfile = true,
  className,
}: ProfessionalIdentityProps) {
  const sizeConfig = {
    sm: {
      avatar: "h-10 w-10",
      name: "text-sm font-medium",
      headline: "text-xs",
      badge: "text-[10px] h-5",
      gap: "gap-2",
    },
    md: {
      avatar: "h-12 w-12",
      name: "text-base font-semibold",
      headline: "text-sm",
      badge: "text-xs h-5",
      gap: "gap-3",
    },
    lg: {
      avatar: "h-16 w-16",
      name: "text-lg font-bold",
      headline: "text-base",
      badge: "text-sm h-6",
      gap: "gap-4",
    },
  };

  const config = sizeConfig[size];

  const getTierColor = () => {
    switch (trustTier) {
      case "platinum":
        return "bg-gradient-to-r from-violet-500 to-purple-600 text-white";
      case "gold":
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950";
      case "silver":
        return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800";
      default:
        return "bg-gradient-to-r from-orange-300 to-amber-400 text-amber-900";
    }
  };

  const getTierIcon = () => {
    switch (trustTier) {
      case "platinum":
        return <Star className="h-3 w-3" />;
      case "gold":
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTrajectoryIcon = () => {
    switch (trustTrajectory) {
      case "rising":
        return <TrendingUp className="h-3 w-3 text-emerald-500" />;
      case "falling":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "researcher":
        return <Briefcase className="h-3.5 w-3.5" />;
      case "student":
        return <GraduationCap className="h-3.5 w-3.5" />;
      case "institution_rep":
        return <Building className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  // Auto-generate headline if not provided
  const displayHeadline = headline || generateAutoHeadline(role, institution, projectsCompleted, successRate);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const content = (
    <div className={cn("flex items-start", config.gap, className)}>
      <div className="relative flex-shrink-0">
        <Avatar className={cn(config.avatar, "border-2 border-background shadow-md")}>
          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
          <AvatarFallback className="font-medium">{initials}</AvatarFallback>
        </Avatar>
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 shadow-sm">
            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(config.name, "truncate")}>{fullName}</span>
          
          {/* Trust tier badge */}
          <Badge 
            variant="outline" 
            className={cn(
              config.badge, 
              "gap-1 px-1.5 border-0 capitalize font-medium",
              getTierColor()
            )}
          >
            {getTierIcon()}
            {trustTier}
            {getTrajectoryIcon()}
          </Badge>
        </div>

        {/* Auto-generated headline */}
        <p className={cn(config.headline, "text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap")}>
          {getRoleIcon()}
          <span className="truncate">{displayHeadline}</span>
        </p>

        {/* Capability tags */}
        {capabilityTags.length > 0 && size !== "sm" && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {capabilityTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                {tag}
              </Badge>
            ))}
            {capabilityTags.length > 3 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                +{capabilityTags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Trust metrics for larger sizes */}
        {size === "lg" && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {projectsCompleted} projects
            </span>
            {successRate > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {Math.round(successRate)}% success
              </span>
            )}
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Trust: {trustScore}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (linkToProfile) {
    return (
      <Link to={`/u/${userId}`} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

function generateAutoHeadline(
  role: string,
  institution: string | null | undefined,
  projectsCompleted: number,
  successRate: number
): string {
  const parts: string[] = [];

  // Role
  switch (role) {
    case "researcher":
      parts.push("Researcher");
      break;
    case "student":
      parts.push("Student");
      break;
    case "freelancer":
      parts.push("Professional");
      break;
    case "mentor":
      parts.push("Mentor");
      break;
    case "institution_rep":
      parts.push("Institution Rep");
      break;
    default:
      parts.push("Member");
  }

  // Institution
  if (institution) {
    parts.push(`at ${institution}`);
  }

  // Track record
  if (projectsCompleted > 0) {
    if (successRate >= 90) {
      parts.push(`• ${projectsCompleted} projects • ${Math.round(successRate)}% success`);
    } else {
      parts.push(`• ${projectsCompleted} projects completed`);
    }
  }

  return parts.join(" ");
}

export function ProfessionalIdentityHeaderSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeConfig = {
    sm: { avatar: "h-10 w-10" },
    md: { avatar: "h-12 w-12" },
    lg: { avatar: "h-16 w-16" },
  };
  
  return (
    <div className="flex items-start gap-3">
      <Skeleton className={cn("rounded-full", sizeConfig[size].avatar)} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        {size !== "sm" && (
          <div className="flex gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        )}
      </div>
    </div>
  );
}
