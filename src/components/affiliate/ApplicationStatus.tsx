import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, CheckCircle2, XCircle, FileText, 
  ArrowRight, AlertTriangle, RefreshCw
} from "lucide-react";
import { AffiliateApplication } from "@/hooks/useAffiliateApplication";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ApplicationStatusProps {
  application: AffiliateApplication;
}

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  const getStatusInfo = () => {
    switch (application.status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          label: "Pending Review",
          description: "Your application is in the queue and will be reviewed shortly.",
        };
      case "under_review":
        return {
          icon: FileText,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          label: "Under Review",
          description: "A team member is actively reviewing your application.",
        };
      case "approved":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          label: "Approved",
          description: "Congratulations! Your application has been approved.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          label: "Not Approved",
          description: application.rejection_reason || "Your application was not approved at this time.",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-muted",
          label: "Unknown",
          description: "Unable to determine application status.",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            {statusInfo.label}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
          </Badge>
        </div>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Application Summary */}
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Trust Score at Application</p>
              <p className="font-medium">{application.trust_score_at_application} points</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trust Tier</p>
              <p className="font-medium capitalize">{application.trust_tier_at_application}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Age</p>
              <p className="font-medium">{application.account_age_days} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Affiliate Type</p>
              <p className="font-medium capitalize">{application.affiliate_type}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {application.status === "approved" && (
          <div className="pt-4 border-t">
            <Button asChild className="w-full gap-2">
              <Link to="/affiliate">
                Go to Affiliate Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {application.status === "rejected" && (
          <div className="pt-4 border-t">
            <div className="bg-background/50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Improve your trust score by completing projects</li>
                <li>Resolve any pending disputes</li>
                <li>Build a stronger track record on the platform</li>
                <li>Wait at least 30 days before reapplying</li>
              </ul>
            </div>
          </div>
        )}

        {(application.status === "pending" || application.status === "under_review") && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Applications are typically reviewed within 24-48 hours.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
