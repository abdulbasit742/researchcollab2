import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPKR } from "@/lib/currency";
import {
  Briefcase,
  Award,
  Shield,
  TrendingUp,
  DollarSign,
  Building,
  Star,
  CheckCircle,
  Clock,
  Users,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileProofMetrics {
  id: string;
  user_id: string;
  projects_completed: number;
  escrow_success_rate: number;
  grants_won: number;
  total_earnings: number;
  earnings_visibility: string;
  peer_reviews_received: number;
  institutions_worked_with: string[];
  verification_count: number;
  dispute_loss_count: number;
  last_activity_at: string | null;
  computed_at: string;
}

interface ProofProfileCardProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  metrics: ProfileProofMetrics | null;
  trustScore?: number;
  trustTier?: string;
  isCompact?: boolean;
}

const TRUST_TIERS: Record<string, { color: string; bgColor: string; label: string }> = {
  platinum: { color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-950/50", label: "Platinum" },
  gold: { color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-950/50", label: "Gold" },
  silver: { color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800", label: "Silver" },
  bronze: { color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-950/50", label: "Bronze" },
};

export function ProofProfileCard({
  userId,
  userEmail,
  userName,
  metrics,
  trustScore = 0,
  trustTier = "bronze",
  isCompact = false,
}: ProofProfileCardProps) {
  const tierConfig = TRUST_TIERS[trustTier] || TRUST_TIERS.bronze;
  const initials = userName?.charAt(0) || userEmail?.charAt(0)?.toUpperCase() || "U";

  if (isCompact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{userName || "Your Profile"}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("text-xs", tierConfig.bgColor, tierConfig.color)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {tierConfig.label}
                </Badge>
                <span className="text-sm font-medium">{trustScore}/100</span>
              </div>
            </div>
          </div>

          {metrics ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Projects</span>
                <span className="font-semibold ml-auto">{metrics.projects_completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Success</span>
                <span className="font-semibold ml-auto">{metrics.escrow_success_rate.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Grants</span>
                <span className="font-semibold ml-auto">{metrics.grants_won}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Verified</span>
                <span className="font-semibold ml-auto">{metrics.verification_count}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Complete projects to build your proof profile
            </p>
          )}

          <Button variant="outline" size="sm" asChild className="w-full mt-4">
            <Link to="/profile">View Full Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header with trust visualization */}
      <div className={cn("p-6 text-center", tierConfig.bgColor)}>
        <Avatar className="h-20 w-20 mx-auto ring-4 ring-background shadow-lg">
          <AvatarFallback className="bg-background text-2xl font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-bold text-xl mt-4">{userName || "Your Proof Profile"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Activity-generated, not self-claimed
        </p>
        
        {/* Trust Score */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur">
          <Shield className={cn("h-5 w-5", tierConfig.color)} />
          <span className={cn("font-bold text-lg", tierConfig.color)}>{trustScore}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                Trust score is computed from completed work, escrow success, peer reviews, and institutional verification. It cannot be gamed socially.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {metrics ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricItem
                icon={Briefcase}
                label="Projects Completed"
                value={metrics.projects_completed}
                description="Verified project deliveries"
              />
              <MetricItem
                icon={TrendingUp}
                label="Escrow Success"
                value={`${metrics.escrow_success_rate.toFixed(0)}%`}
                description="Funds released successfully"
                highlight={metrics.escrow_success_rate >= 90}
              />
              <MetricItem
                icon={Award}
                label="Grants Won"
                value={metrics.grants_won}
                description="Competitive grants awarded"
              />
              <MetricItem
                icon={Shield}
                label="Verifications"
                value={metrics.verification_count}
                description="Identity & credential verifications"
              />
              <MetricItem
                icon={Star}
                label="Peer Reviews"
                value={metrics.peer_reviews_received}
                description="Earned from collaborations"
              />
              <MetricItem
                icon={Building}
                label="Institutions"
                value={metrics.institutions_worked_with?.length || 0}
                description="Organizations worked with"
              />
            </div>

            {/* Earnings (if public) */}
            {metrics.earnings_visibility === "public" && (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Total Earned</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatPKR(metrics.total_earnings)}
                  </span>
                </div>
              </div>
            )}

            {/* Disputes (if any) */}
            {metrics.dispute_loss_count > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  {metrics.dispute_loss_count} dispute{metrics.dispute_loss_count > 1 ? "s" : ""} lost
                </p>
              </div>
            )}

            {/* Last Activity */}
            {metrics.last_activity_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last active: {new Date(metrics.last_activity_at).toLocaleDateString()}</span>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Build Your Proof Profile</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              Complete projects, win grants, and earn verifications to build your proof-based professional profile.
            </p>
            <Button asChild>
              <Link to="/offers">
                Start Working
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description?: string;
  highlight?: boolean;
}

function MetricItem({ icon: Icon, label, value, description, highlight }: MetricItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "p-3 rounded-lg transition-colors cursor-help",
          highlight ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted/50 hover:bg-muted"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn("h-4 w-4", highlight ? "text-emerald-600" : "text-muted-foreground")} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <span className={cn("text-xl font-bold", highlight && "text-emerald-700 dark:text-emerald-400")}>
            {value}
          </span>
        </div>
      </TooltipTrigger>
      {description && (
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
