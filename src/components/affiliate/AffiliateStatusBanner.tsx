import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, Ban, PauseCircle, CheckCircle2, Clock, 
  Shield, ArrowRight, MessageSquare, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { Affiliate } from "@/hooks/useMyAffiliate";
import { formatDistanceToNow } from "date-fns";

interface AffiliateStatusBannerProps {
  affiliate: Affiliate;
}

export function AffiliateStatusBanner({ affiliate }: AffiliateStatusBannerProps) {
  const lifecycleStatus = affiliate.lifecycle_status || affiliate.status || "active";

  // Active status - no banner needed
  if (lifecycleStatus === "active") {
    return null;
  }

  // Paused status
  if (lifecycleStatus === "paused") {
    return (
      <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <PauseCircle className="h-5 w-5" />
              Account Paused
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Temporarily Inactive
            </Badge>
          </div>
          <CardDescription className="text-amber-700/80 dark:text-amber-300/80">
            Your affiliate account is currently paused. You cannot earn commissions during this period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason for pause */}
          <div className="p-4 rounded-lg bg-background/50 border border-amber-500/20">
            <h4 className="font-medium text-sm mb-2">Why was my account paused?</h4>
            <p className="text-sm text-muted-foreground">
              Accounts may be paused due to policy violations, suspicious activity patterns, 
              or pending verification requirements. This is a temporary measure.
            </p>
          </div>

          {/* What you can do */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What you can do:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Review our affiliate guidelines and ensure compliance</li>
              <li>Check for any pending violations that need resolution</li>
              <li>Contact support if you believe this was in error</li>
              <li>Your existing earnings remain safe and can be withdrawn</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/help">
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Revoked status
  if (lifecycleStatus === "revoked" || lifecycleStatus === "suspended") {
    return (
      <Card className="mb-8 border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Affiliate Status Revoked
            </CardTitle>
            <Badge variant="destructive">Permanently Inactive</Badge>
          </div>
          <CardDescription className="text-destructive/80">
            Your affiliate privileges have been revoked due to policy violations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason */}
          <div className="p-4 rounded-lg bg-background/50 border border-destructive/20">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Revocation Reason
            </h4>
            <p className="text-sm text-muted-foreground">
              Affiliates are revoked for serious or repeated policy violations including:
              spam behavior, deceptive practices, commission fraud, or misrepresentation of the platform.
            </p>
          </div>

          {/* Consequences */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Consequences:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You can no longer earn commissions from referrals</li>
              <li>Pending commissions under review may be forfeited</li>
              <li>Your affiliate links are deactivated</li>
              <li>You cannot reapply to the affiliate program</li>
              <li>This may affect your overall trust score on the platform</li>
            </ul>
          </div>

          {/* Appeal option */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium text-sm mb-2">Believe this was a mistake?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you believe your account was revoked in error, you may submit an appeal 
              with supporting evidence within 30 days of revocation.
            </p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/help">
                <MessageSquare className="h-4 w-4" />
                Submit Appeal
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending activation (approved but not yet active)
  if (lifecycleStatus === "pending" || lifecycleStatus === "approved") {
    return (
      <Card className="mb-8 border-blue-500/30 bg-blue-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
              Activation Pending
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
              Almost Ready
            </Badge>
          </div>
          <CardDescription className="text-blue-700/80 dark:text-blue-300/80">
            Your affiliate account is being set up. This usually takes a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm">
            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">
              Your referral links will be active shortly...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Smaller inline status indicator for the header
export function AffiliateStatusIndicator({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return { 
          icon: CheckCircle2, 
          color: "text-green-500", 
          bg: "bg-green-500/10",
          label: "Active" 
        };
      case "paused":
        return { 
          icon: PauseCircle, 
          color: "text-amber-500", 
          bg: "bg-amber-500/10",
          label: "Paused" 
        };
      case "revoked":
      case "suspended":
        return { 
          icon: Ban, 
          color: "text-destructive", 
          bg: "bg-destructive/10",
          label: "Revoked" 
        };
      case "pending":
      case "approved":
        return { 
          icon: Clock, 
          color: "text-blue-500", 
          bg: "bg-blue-500/10",
          label: "Pending" 
        };
      default:
        return { 
          icon: Shield, 
          color: "text-muted-foreground", 
          bg: "bg-muted",
          label: status 
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} gap-1 capitalize`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
