import { RealityFeedEvent } from "@/hooks/useAccountability";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  DollarSign,
  Award,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Building,
  Users,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RealityFeedCardProps {
  event: RealityFeedEvent;
}

// Event type configuration
const EVENT_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  project_started: { icon: Briefcase, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Project Started" },
  project_completed: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Project Completed" },
  project_failed: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Project Failed" },
  milestone_submitted: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", label: "Milestone Submitted" },
  milestone_approved: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Milestone Approved" },
  milestone_rejected: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Milestone Rejected" },
  escrow_locked: { icon: Lock, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30", label: "Escrow Locked" },
  escrow_released: { icon: Unlock, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Escrow Released" },
  escrow_disputed: { icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", label: "Escrow Disputed" },
  grant_awarded: { icon: Award, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", label: "Grant Awarded" },
  grant_completed: { icon: Award, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Grant Completed" },
  trust_increased: { icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Trust Increased" },
  trust_decreased: { icon: TrendingDown, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Trust Decreased" },
  verification_approved: { icon: Shield, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", label: "Verification Approved" },
  collaboration_ended: { icon: Users, color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-900/30", label: "Collaboration Ended" },
  institution_verified: { icon: Building, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Institution Verified" },
  dispute_resolved: { icon: Shield, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", label: "Dispute Resolved" },
};

export function RealityFeedCard({ event }: RealityFeedCardProps) {
  const config = EVENT_CONFIG[event.event_type] || {
    icon: Briefcase,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: event.event_type,
  };
  const Icon = config.icon;

  const isPositive = event.trust_impact && event.trust_impact > 0;
  const isNegative = event.trust_impact && event.trust_impact < 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Event Icon */}
          <div className={`h-12 w-12 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {/* Event Type Badge */}
                <Badge variant="outline" className="text-xs mb-2">
                  {config.label}
                </Badge>

                {/* Title */}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {event.title}
                </h3>

                {/* Actor */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {event.actor_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{event.actor_name}</span>
                  {event.secondary_actor_name && (
                    <>
                      <span>→</span>
                      <span>{event.secondary_actor_name}</span>
                    </>
                  )}
                </div>

                {/* Summary */}
                {event.summary && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {event.summary}
                  </p>
                )}
              </div>

              {/* Right side: Money & Trust */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {/* Amount */}
                {event.amount_involved && event.amount_involved > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{event.amount_involved.toLocaleString()}</span>
                  </div>
                )}

                {/* Trust Impact */}
                {event.trust_impact !== null && event.trust_impact !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    isPositive ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}{event.trust_impact} trust
                    </span>
                  </div>
                )}

                {/* Verified Badge */}
                {event.is_verified && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-[10px] text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RealityFeedSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyRealityFeed() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No activity recorded</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-2">
          This feed shows real outcomes: projects completed, money moved, trust earned.
        </p>
        <p className="text-xs text-muted-foreground/70 italic">
          Complete your first project to start building your record.
        </p>
      </CardContent>
    </Card>
  );
}
