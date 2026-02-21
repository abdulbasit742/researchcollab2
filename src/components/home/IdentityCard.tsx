import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  Briefcase,
  Building,
  MapPin,
  Shield,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { PremiumBadge } from "@/components/badges/PremiumBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsPremium } from "@/hooks/usePremiumUsers";

interface IdentityCardProps {
  profile: {
    full_name?: string | null;
    university?: string | null;
    department?: string | null;
    location?: string | null;
    headline?: string | null;
    avatar_url?: string | null;
  } | null;
  role?: string | null;
  trustScore?: number;
  trustTier?: string;
  isVerified?: boolean;
}

export function IdentityCard({
  profile,
  role = "student",
  trustScore = 0,
  trustTier = "bronze",
  isVerified = false,
}: IdentityCardProps) {
  const { user } = useAuth();
  const premiumTier = useIsPremium(user?.id);

  const getRoleIcon = () => {
    switch (role?.toLowerCase()) {
      case "researcher":
        return Briefcase;
      case "admin":
        return Shield;
      default:
        return GraduationCap;
    }
  };
  const RoleIcon = getRoleIcon();

  const tierColors: Record<string, string> = {
    platinum: "text-purple-500 bg-purple-500/10",
    gold: "text-amber-500 bg-amber-500/10",
    silver: "text-gray-400 bg-gray-400/10",
    bronze: "text-orange-400 bg-orange-400/10",
  };

  const headline = profile?.headline || 
    `${role?.charAt(0).toUpperCase()}${role?.slice(1) || "Professional"} ${profile?.department ? `in ${profile.department}` : ""}`.trim();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-lg truncate">
                {profile?.full_name || "Complete Your Profile"}
              </h2>
              {isVerified && (
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              )}
              {premiumTier && (
                <PremiumBadge tier={premiumTier} size="sm" />
              )}
            </div>

            {/* Headline */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {headline}
            </p>

            {/* Role + Institution */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <RoleIcon className="h-3 w-3" />
                {role?.charAt(0).toUpperCase()}{role?.slice(1) || "User"}
              </Badge>
              {profile?.university && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {profile.university}
                </span>
              )}
            </div>
          </div>

          {/* Trust Score */}
          <div className={`p-2 rounded-lg text-center ${tierColors[trustTier] || tierColors.bronze}`}>
            <p className="text-2xl font-bold">{trustScore}</p>
            <p className="text-[10px] uppercase font-medium">{trustTier}</p>
          </div>
        </div>

        {/* View Profile Link */}
        <Link to="/profile">
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs gap-1">
            View Full Profile
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
