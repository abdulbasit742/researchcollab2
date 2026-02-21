import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import {
  Shield,
  Briefcase,
  Target,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Building2,
  GraduationCap,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { PremiumBadge } from "@/components/badges/PremiumBadge";
import { useIsPremium } from "@/hooks/usePremiumUsers";

interface ProfessionalIdentityCardProps {
  compact?: boolean;
}

export function ProfessionalIdentityCard({ compact = false }: ProfessionalIdentityCardProps) {
  const { user, profile } = useAuth();
  const { trustProfile, badges } = useMyTrustProfile();
  const premiumTier = useIsPremium(user?.id);

  if (!user || !profile) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to see your professional identity
          </p>
          <Button asChild size="sm">
            <Link to="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const trustScore = trustProfile?.trust_score ?? 0;
  const trustTier =
    trustScore >= 80
      ? "platinum"
      : trustScore >= 60
      ? "gold"
      : trustScore >= 40
      ? "silver"
      : "bronze";

  const tierColors = {
    platinum: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    gold: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    silver: "text-gray-400 bg-gray-400/10 border-gray-400/30",
    bronze: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  };

  const projectsCompleted = trustProfile?.total_projects_completed ?? 0;
  const successRate = trustProfile?.successful_rate ?? 0;

  return (
    <Card className="overflow-hidden">
      {/* Gradient Header */}
      <div className="h-16 gradient-primary relative">
        <div className="absolute -bottom-8 left-4">
          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-lg font-semibold">
              {profile.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-10 pb-4 px-4">
        {/* Name & Role */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{profile.full_name || "Anonymous"}</h3>
            {premiumTier && <PremiumBadge tier={premiumTier} size="sm" />}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {profile.role === "researcher" ? (
              <>
                <GraduationCap className="h-3 w-3" />
                Researcher
              </>
            ) : (
              <>
                <Building2 className="h-3 w-3" />
                Professional
              </>
            )}
            {profile.university && (
              <span className="text-xs"> · {profile.university}</span>
            )}
          </p>
        </div>

        {/* Trust Badge */}
        <div
          className={`p-3 rounded-lg border ${tierColors[trustTier]} mb-3 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <p className="text-xs font-medium uppercase">{trustTier} Tier</p>
              <p className="text-lg font-bold leading-none">{trustScore}</p>
            </div>
          </div>
          <TrendingUp className="h-4 w-4 opacity-60" />
        </div>

        {/* Quick Stats */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-center">
            <div className="p-2 rounded-md bg-muted/50">
              <p className="text-lg font-bold">{projectsCompleted}</p>
              <p className="text-[10px] text-muted-foreground">Projects</p>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <p className="text-lg font-bold">{Math.round(successRate)}%</p>
              <p className="text-[10px] text-muted-foreground">Success</p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-1">
          <Link
            to="/profile"
            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              Profile
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/offers"
            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Opportunities
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/deals"
            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Deals
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/progress"
            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Career Progress
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
