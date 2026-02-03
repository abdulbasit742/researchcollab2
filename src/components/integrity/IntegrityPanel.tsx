import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlatformIntegrity, useDataPortability } from "@/hooks/usePlatformIntegrity";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  Download,
  Trash2,
  Clock,
  Activity,
  Eye,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function IntegrityScorePanel() {
  const { integrityScore, qualityMetrics, gamingStatus, loading, acknowledgeFlag } = usePlatformIntegrity();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!integrityScore) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Integrity data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Integrity Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Account Integrity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <div className={cn(
              "text-4xl font-bold",
              integrityScore.overall >= 80 ? "text-green-600" :
              integrityScore.overall >= 60 ? "text-amber-600" :
              "text-red-600"
            )}>
              {Math.round(integrityScore.overall)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Integrity Score</div>
          </div>

          {/* Component Breakdown */}
          <div className="space-y-3">
            {Object.entries(integrityScore.components).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{key}</span>
                  <span className="font-medium">{Math.round(value)}%</span>
                </div>
                <Progress 
                  value={value} 
                  className={cn(
                    "h-2",
                    value >= 80 ? "[&>div]:bg-green-500" :
                    value >= 60 ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-red-500"
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flags */}
      {integrityScore.flags.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrityScore.flags.map((flag) => (
                <div 
                  key={flag.id}
                  className={cn(
                    "p-3 rounded-lg",
                    flag.severity === "critical" ? "bg-red-100 dark:bg-red-950/50" :
                    flag.severity === "high" ? "bg-red-50 dark:bg-red-950/30" :
                    flag.severity === "medium" ? "bg-amber-50 dark:bg-amber-950/30" :
                    "bg-yellow-50 dark:bg-yellow-950/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {flag.category}
                    </Badge>
                    <Badge 
                      variant={flag.severity === "critical" || flag.severity === "high" ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {flag.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{flag.description}</p>
                  {flag.expiresAt && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Expires: {format(flag.expiresAt, "MMM d, yyyy")}
                    </div>
                  )}
                  {!flag.acknowledged && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => acknowledgeFlag(flag.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restrictions */}
      {integrityScore.restrictions.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-red-500" />
              Account Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrityScore.restrictions.map((restriction) => (
                <div key={restriction.id} className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="capitalize">
                      {restriction.type.replace("_", " ")}
                    </Badge>
                    {restriction.appealable && (
                      <Button size="sm" variant="outline">
                        Appeal
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">{restriction.reason}</p>
                  {restriction.expiresAt && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Expires: {format(restriction.expiresAt, "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Metrics */}
      {qualityMetrics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{Math.round(qualityMetrics.completionRate)}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{Math.round(qualityMetrics.responseRate)}%</div>
                <div className="text-xs text-muted-foreground">Response Rate</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className={cn(
                  "text-2xl font-bold",
                  qualityMetrics.disputeRate < 5 ? "text-green-600" :
                  qualityMetrics.disputeRate < 15 ? "text-amber-600" :
                  "text-red-600"
                )}>
                  {qualityMetrics.disputeRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Dispute Rate</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  {qualityMetrics.qualityTrend === "improving" && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                  {qualityMetrics.qualityTrend === "declining" && (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  {qualityMetrics.qualityTrend === "stable" && (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{qualityMetrics.qualityTrend}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gaming Detection Status */}
      {gamingStatus && gamingStatus.riskScore > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-amber-500" />
              Activity Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gamingStatus.lowValueDeals && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Unusual pattern: High volume of low-value deals</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Last analyzed: {format(gamingStatus.lastChecked, "MMM d, yyyy HH:mm")}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DataExportPanel() {
  const { exportStatus, lastExport, requestExport, requestAccountDeletion } = useDataPortability();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Data Portability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download your data or request account deletion. Your data belongs to you.
        </p>

        {/* Export Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export Your Data</h4>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={exportStatus === "processing"}
              onClick={async () => {
                const url = await requestExport("json");
                if (url) {
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "my-data.json";
                  a.click();
                }
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button 
              variant="outline"
              disabled={exportStatus === "processing"}
              onClick={() => requestExport("csv")}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline"
              disabled={exportStatus === "processing"}
              onClick={() => requestExport("pdf")}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
          
          {exportStatus === "processing" && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              Preparing your export...
            </div>
          )}
          
          {lastExport && (
            <div className="text-xs text-muted-foreground">
              Last export: {format(lastExport, "MMM d, yyyy HH:mm")}
            </div>
          )}
        </div>

        {/* Account Deletion */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
          <p className="text-xs text-muted-foreground">
            Request permanent deletion of your account and data. This cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to request account deletion? This action cannot be undone.")) {
                requestAccountDeletion("User requested");
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Request Deletion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
