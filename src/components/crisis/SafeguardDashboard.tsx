import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Clock, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { PowerSafeguard, OverrideLog } from "@/types/crisis-coordination";

interface SafeguardDashboardProps {
  safeguards: PowerSafeguard[];
  activeOverrides: OverrideLog[];
  pendingReviews: OverrideLog[];
  onToggleSafeguard?: (id: string, isActive: boolean) => void;
  onReviewOverride?: (id: string) => void;
}

const safeguardIcons: Record<string, React.ReactNode> = {
  time_limit: <Clock className="h-4 w-4" />,
  scope_limit: <Shield className="h-4 w-4" />,
  review_required: <Eye className="h-4 w-4" />,
  auto_sunset: <Clock className="h-4 w-4" />,
  escalation_cap: <AlertTriangle className="h-4 w-4" />,
};

export function SafeguardDashboard({ 
  safeguards, 
  activeOverrides, 
  pendingReviews,
  onToggleSafeguard,
  onReviewOverride 
}: SafeguardDashboardProps) {
  const activeSafeguards = safeguards.filter(s => s.isActive).length;
  const totalViolations = safeguards.reduce((sum, s) => sum + s.violationCount, 0);

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Power Safeguards</CardTitle>
            </div>
            <Badge variant={activeSafeguards === safeguards.length ? "default" : "secondary"}>
              {activeSafeguards}/{safeguards.length} Active
            </Badge>
          </div>
          <CardDescription>
            Ethical guardrails preventing permanent power expansion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatBlock 
              value={activeOverrides.length}
              label="Active Overrides"
              color={activeOverrides.length > 0 ? "text-amber-600" : "text-green-600"}
            />
            <StatBlock 
              value={pendingReviews.length}
              label="Pending Reviews"
              color={pendingReviews.length > 0 ? "text-red-600" : "text-green-600"}
            />
            <StatBlock 
              value={totalViolations}
              label="Total Violations"
              color={totalViolations > 0 ? "text-red-600" : "text-green-600"}
            />
          </div>

          {/* Safeguards List */}
          <div className="space-y-2">
            {safeguards.map((safeguard) => (
              <div 
                key={safeguard.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${safeguard.isActive ? "bg-card" : "bg-muted/50 opacity-60"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={safeguard.isActive ? "text-primary" : "text-muted-foreground"}>
                    {safeguardIcons[safeguard.safeguardType]}
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {safeguard.safeguardType.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {safeguard.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {safeguard.violationCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {safeguard.violationCount} violations
                    </Badge>
                  )}
                  {onToggleSafeguard && (
                    <Switch
                      checked={safeguard.isActive}
                      onCheckedChange={(checked) => onToggleSafeguard(safeguard.id, checked)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg">Pending Reviews ({pendingReviews.length})</CardTitle>
            </div>
            <CardDescription>
              Overrides requiring mandatory review within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingReviews.map((override) => (
              <div 
                key={override.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/10"
              >
                <div>
                  <div className="font-medium text-sm">{override.overrideType}</div>
                  <div className="text-xs text-muted-foreground">
                    Granted {new Date(override.grantedAt).toLocaleString()} · Expires {new Date(override.expiresAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reason: {override.reason}
                  </div>
                </div>
                {onReviewOverride && (
                  <button 
                    onClick={() => onReviewOverride(override.id)}
                    className="px-3 py-1 rounded text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Review
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Overrides */}
      {activeOverrides.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Active Overrides ({activeOverrides.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeOverrides.map((override) => (
              <div 
                key={override.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="font-medium text-sm">{override.overrideType}</div>
                  <div className="text-xs text-muted-foreground">
                    Scope: {override.scope}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {override.autoSunset && (
                    <Badge variant="outline" className="text-xs">
                      Auto-sunset
                    </Badge>
                  )}
                  {override.wasReviewed && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatBlock({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
