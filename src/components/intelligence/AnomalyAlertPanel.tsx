import { useIntelligenceAnomalies } from "@/hooks/useIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Zap, Users, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, any> = {
  trust_spike: Zap,
  funding_anomaly: DollarSign,
  escrow_inconsistency: Shield,
  dispute_pattern: AlertTriangle,
  multi_account: Users,
};

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export function AnomalyAlertPanel() {
  const { data: anomalies } = useIntelligenceAnomalies(false);

  if (!anomalies?.length) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-success">✓ No anomalies detected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Active Anomalies
          <Badge variant="destructive" className="text-[10px]">{anomalies.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {anomalies.slice(0, 10).map((a) => {
          const Icon = typeIcons[a.anomaly_type] || AlertTriangle;
          return (
            <div key={a.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
              <Icon className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{a.description}</p>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </p>
              </div>
              <Badge className={`text-[10px] shrink-0 ${severityColors[a.severity] || ""}`}>
                {a.severity}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
