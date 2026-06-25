import { Award, BadgeCheck, Building2, Clock, GraduationCap, Shield, Star, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getVerificationBadgeConfig,
  getVerificationStatusConfig,
  getVerificationToneClass,
  isTrustedVerification,
  type VerificationBadgeType,
  type VerificationStatus,
} from "@/config/verification";

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case "verified":
    case "approved":
      return <BadgeCheck className="h-3 w-3" />;
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "rejected":
    case "revoked":
      return <XCircle className="h-3 w-3" />;
    case "expired":
    case "requires_more_info":
    case "disputed":
      return <Shield className="h-3 w-3" />;
    default:
      return <Shield className="h-3 w-3" />;
  }
};

const getBadgeIcon = (type: VerificationBadgeType) => {
  switch (type) {
    case "student":
      return <GraduationCap className="h-3 w-3" />;
    case "researcher":
    case "expert":
      return <Award className="h-3 w-3" />;
    case "partner":
    case "institution":
    case "sponsor":
    case "government":
    case "project_owner":
      return <Building2 className="h-3 w-3" />;
    case "top_rated":
      return <Star className="h-3 w-3" />;
    default:
      return <BadgeCheck className="h-3 w-3" />;
  }
};

type VerificationStatusBadgeProps = {
  status?: string | null;
  showDescription?: boolean;
  className?: string;
};

export function VerificationStatusBadge({ status, showDescription = false, className = "" }: VerificationStatusBadgeProps) {
  const config = getVerificationStatusConfig(status);

  return (
    <Badge className={`gap-1 border ${getVerificationToneClass(config.tone)} ${className}`} title={config.description}>
      {getStatusIcon(config.status)}
      {config.label}
      {showDescription ? <span className="ml-1 hidden sm:inline text-xs opacity-80">— {config.description}</span> : null}
    </Badge>
  );
}

type TrustBadgeProps = {
  type?: string | null;
  status?: string | null;
  compact?: boolean;
  className?: string;
};

export function TrustBadge({ type, status = "verified", compact = false, className = "" }: TrustBadgeProps) {
  const config = getVerificationBadgeConfig(type);
  const trusted = isTrustedVerification(status);

  if (!config || !config.publicVisible) return null;

  return (
    <Badge
      className={`gap-1 border ${trusted ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"} ${className}`}
      title={config.description}
    >
      {getBadgeIcon(config.type)}
      {compact ? config.shortLabel : config.label}
    </Badge>
  );
}

type VerificationBadgeGroupProps = {
  badges: Array<{ type: string; status?: string | null }>;
  compact?: boolean;
};

export function VerificationBadgeGroup({ badges, compact = false }: VerificationBadgeGroupProps) {
  const visibleBadges = badges.filter((badge) => getVerificationBadgeConfig(badge.type));

  if (visibleBadges.length === 0) {
    return <VerificationStatusBadge status="unverified" />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleBadges.map((badge) => (
        <TrustBadge key={`${badge.type}-${badge.status ?? "verified"}`} type={badge.type} status={badge.status} compact={compact} />
      ))}
    </div>
  );
}

type ProfileVerificationBadgesProps = {
  isVerifiedStudent?: boolean | null;
  isVerifiedResearcher?: boolean | null;
  isVerifiedPartner?: boolean | null;
  compact?: boolean;
};

export function ProfileVerificationBadges({
  isVerifiedStudent,
  isVerifiedResearcher,
  isVerifiedPartner,
  compact = false,
}: ProfileVerificationBadgesProps) {
  const badges = [
    isVerifiedStudent ? { type: "student", status: "verified" } : null,
    isVerifiedResearcher ? { type: "researcher", status: "verified" } : null,
    isVerifiedPartner ? { type: "partner", status: "verified" } : null,
  ].filter(Boolean) as Array<{ type: string; status: string }>;

  return <VerificationBadgeGroup badges={badges} compact={compact} />;
}
