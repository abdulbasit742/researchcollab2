import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  Calendar, 
  Key, 
  Copy, 
  Eye, 
  EyeOff,
  RefreshCw,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Flexible subscription type that works with both database and mock data
export interface SubscriptionCardData {
  id: string;
  toolId: string;
  toolName: string;
  toolIcon?: string;
  planType: string;
  planName: string;
  status: "active" | "expiring" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
  credentials?: any;
  deliveryDetails?: {
    method?: string;
    email?: string;
    password?: string;
    inviteUrl?: string;
    notes?: string;
  };
  cancellationDate?: string;
}

// Helper function to calculate days remaining
function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface SubscriptionCardProps {
  subscription: SubscriptionCardData;
  onRenew?: () => void;
  onCancel?: () => void;
  onReportIssue?: () => void;
}

const statusConfig: Record<SubscriptionCardData["status"], {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
}> = {
  active: { label: "Active", variant: "success" },
  expiring: { label: "Expiring Soon", variant: "warning" },
  expired: { label: "Expired", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

const planTypeConfig: Record<string, { label: string; color: string }> = {
  "semi-private": { label: "Semi-Private", color: "bg-blue-500/10 text-blue-600" },
  "private": { label: "Private", color: "bg-emerald-500/10 text-emerald-600" },
  "byo": { label: "BYO Account", color: "bg-violet-500/10 text-violet-600" },
  "team": { label: "Team", color: "bg-amber-500/10 text-amber-600" },
};

export function SubscriptionCard({ 
  subscription, 
  onRenew, 
  onCancel, 
  onReportIssue 
}: SubscriptionCardProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const daysRemaining = calculateDaysRemaining(subscription.endDate);
  const progressPercent = Math.min(100, Math.max(0, (30 - daysRemaining) / 30 * 100));
  const status = statusConfig[subscription.status];
  const planType = planTypeConfig[subscription.planType];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const hasCredentials = subscription.deliveryDetails && 
    (subscription.deliveryDetails.email || subscription.deliveryDetails.inviteUrl);

  return (
    <Card className={`overflow-hidden ${subscription.status === "expiring" ? "border-amber-500/50" : ""}`}>
      {subscription.status === "expiring" && (
        <div className="bg-amber-500/10 px-4 py-2 flex items-center gap-2 text-amber-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Expires in {daysRemaining} days - Renew now to avoid interruption</span>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {subscription.toolName}
              <Badge className={planType.color}>{planType.label}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Plan: {subscription.planName}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {subscription.status === "active" || subscription.status === "expiring" ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className={`font-medium ${daysRemaining <= 7 ? "text-amber-500" : ""}`}>
                {daysRemaining} days
              </span>
            </div>
            <Progress value={100 - progressPercent} className="h-2" />
          </div>
        ) : null}

        {/* Auto Renew Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Auto Renew</span>
          <Badge variant={subscription.autoRenew ? "success" : "secondary"}>
            {subscription.autoRenew ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Credentials Section */}
        {hasCredentials && subscription.status !== "expired" && subscription.status !== "cancelled" && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Access Credentials
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                {showCredentials ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>

            {showCredentials && subscription.deliveryDetails && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                {subscription.deliveryDetails.method === "invite_link" ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Invite Link</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={subscription.deliveryDetails.inviteUrl || ""} 
                          readOnly 
                          className="text-sm"
                        />
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => copyToClipboard(subscription.deliveryDetails!.inviteUrl!, "Invite link")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a 
                          href={subscription.deliveryDetails.inviteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="secondary">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {subscription.deliveryDetails.email && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email / Username</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={subscription.deliveryDetails.email} 
                            readOnly 
                            className="text-sm"
                          />
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => copyToClipboard(subscription.deliveryDetails!.email!, "Email")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {subscription.deliveryDetails.password && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Password</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={subscription.deliveryDetails.password} 
                            readOnly 
                            className="text-sm font-mono"
                          />
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => copyToClipboard(subscription.deliveryDetails!.password!, "Password")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {subscription.deliveryDetails.notes && (
                  <p className="text-xs text-muted-foreground">
                    Note: {subscription.deliveryDetails.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancellation Info */}
        {subscription.cancellationDate && (
          <div className="p-3 rounded-lg bg-destructive/10 text-sm">
            <p className="text-destructive">
              Cancelled on {new Date(subscription.cancellationDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {(subscription.status === "active" || subscription.status === "expiring") && (
          <>
            <Button size="sm" onClick={onRenew} className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Renew
            </Button>
            <Button size="sm" variant="outline" onClick={onReportIssue} className="gap-1">
              <MessageSquare className="h-3 w-3" />
              Report Issue
            </Button>
            {!subscription.cancellationDate && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onCancel}
                className="text-destructive hover:text-destructive gap-1"
              >
                <XCircle className="h-3 w-3" />
                Cancel
              </Button>
            )}
          </>
        )}
        {subscription.status === "expired" && (
          <Button size="sm" onClick={onRenew} className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Resubscribe
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
