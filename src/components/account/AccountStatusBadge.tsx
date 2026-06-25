import { AlertTriangle, CheckCircle, Clock, Lock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAccountStatusConfig,
  getAccountStatusToneClass,
  isAccountLimited,
  type AccountStatus,
} from "@/config/accountStatus";

const getStatusIcon = (status: AccountStatus) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-3 w-3" />;
    case "pending_review":
      return <Clock className="h-3 w-3" />;
    case "restricted":
      return <ShieldAlert className="h-3 w-3" />;
    case "suspended":
    case "deactivated":
      return <Lock className="h-3 w-3" />;
    default:
      return <AlertTriangle className="h-3 w-3" />;
  }
};

type AccountStatusBadgeProps = {
  status?: string | null;
  showDescription?: boolean;
  className?: string;
};

export function AccountStatusBadge({ status, showDescription = false, className = "" }: AccountStatusBadgeProps) {
  const config = getAccountStatusConfig(status);

  return (
    <Badge className={`gap-1 border ${getAccountStatusToneClass(config.tone)} ${className}`} title={config.description}>
      {getStatusIcon(config.status)}
      {config.label}
      {showDescription ? <span className="ml-1 hidden sm:inline text-xs opacity-80">— {config.description}</span> : null}
    </Badge>
  );
}

type AccountStatusNoticeProps = {
  status?: string | null;
  reason?: string | null;
};

export function AccountStatusNotice({ status, reason }: AccountStatusNoticeProps) {
  const config = getAccountStatusConfig(status);

  if (!isAccountLimited(config.status)) return null;

  return (
    <Card className={`border ${getAccountStatusToneClass(config.tone)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" /> Account Status: {config.label}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {reason ? <p><span className="font-medium text-foreground">Reason:</span> {reason}</p> : null}
        <p><span className="font-medium text-foreground">Action:</span> {config.userAction}</p>
      </CardContent>
    </Card>
  );
}

type AccountCapabilitySummaryProps = {
  status?: string | null;
};

export function AccountCapabilitySummary({ status }: AccountCapabilitySummaryProps) {
  const config = getAccountStatusConfig(status);

  const capabilities = [
    { label: "Sign in", allowed: config.canSignIn },
    { label: "Create projects", allowed: config.canCreateProjects },
    { label: "Messaging", allowed: config.canMessage },
    { label: "Marketplace", allowed: config.canUseMarketplace },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          Account Capabilities
          <AccountStatusBadge status={config.status} />
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {capabilities.map((capability) => (
            <div key={capability.label} className="flex items-center justify-between rounded-lg border p-3">
              <span>{capability.label}</span>
              <Badge variant={capability.allowed ? "secondary" : "outline"}>
                {capability.allowed ? "Allowed" : "Limited"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
