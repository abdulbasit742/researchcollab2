import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  Building2,
  CheckCircle,
  Lock,
  Eye,
} from "lucide-react";
import type { AntiCaptureAlert, MultiInstitutionAnchor, TransparencyRecord } from "@/types/knowledge-civilization";

interface AntiCaptureBadgeProps {
  anchorStrength: number;
  institutionCount: number;
  compact?: boolean;
}

export function AntiCaptureBadge({
  anchorStrength,
  institutionCount,
  compact = false,
}: AntiCaptureBadgeProps) {
  const strengthLevel = 
    anchorStrength >= 0.7 ? "strong" :
    anchorStrength >= 0.4 ? "moderate" :
    anchorStrength > 0 ? "weak" : "none";

  const config = {
    strong: { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/20" },
    moderate: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/20" },
    weak: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/20" },
    none: { color: "text-muted-foreground", bg: "bg-muted" },
  };

  if (compact) {
    return (
      <Badge variant="outline" className={`${config[strengthLevel].color}`}>
        <Shield className="h-3 w-3 mr-1" />
        {institutionCount}
      </Badge>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config[strengthLevel].bg}`}>
      <Shield className={`h-4 w-4 ${config[strengthLevel].color}`} />
      <span className={`text-sm font-medium ${config[strengthLevel].color}`}>
        {institutionCount} Institution{institutionCount !== 1 ? "s" : ""} Anchoring
      </span>
    </div>
  );
}

// Multi-institution anchor card
interface AnchorCardProps {
  anchor: MultiInstitutionAnchor;
  onAddInstitution?: () => void;
}

export function MultiInstitutionAnchorCard({ anchor, onAddInstitution }: AnchorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Multi-Institution Anchor
          </CardTitle>
          <Badge 
            variant="outline" 
            className={anchor.consensusStrength >= 0.7 ? "text-green-600" : "text-yellow-600"}
          >
            {(anchor.consensusStrength * 100).toFixed(0)}% Consensus
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={anchor.consensusStrength * 100} className="h-2" />

        <div className="space-y-2">
          {anchor.anchoringInstitutions.map((inst, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Institution #{i + 1}</span>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {inst.endorsementLevel}
              </Badge>
            </div>
          ))}
        </div>

        {anchor.disputeCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{anchor.disputeCount} dispute(s) recorded</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Anti-capture alert display
interface AlertDisplayProps {
  alert: AntiCaptureAlert;
  onResolve?: () => void;
}

const severityConfig = {
  low: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/20" },
  medium: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/20" },
  high: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/20" },
  critical: { color: "text-red-600 dark:text-red-400", bg: "bg-red-500/20" },
};

export function AntiCaptureAlertCard({ alert, onResolve }: AlertDisplayProps) {
  const severity = severityConfig[alert.severity];

  return (
    <Card className={`border-l-4 ${alert.severity === "critical" ? "border-l-red-500" : "border-l-orange-500"}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${severity.bg}`}>
            <AlertTriangle className={`h-4 w-4 ${severity.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium capitalize">
                {alert.violationType.replace(/_/g, " ")}
              </p>
              <Badge className={severity.bg} variant="secondary">
                {alert.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Affecting {alert.affectedObjectIds.length} object(s)
            </p>
          </div>
          {!alert.resolvedAt && onResolve && (
            <button
              onClick={onResolve}
              className="text-sm text-primary hover:underline"
            >
              Resolve
            </button>
          )}
          {alert.resolvedAt && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Transparency record display
interface TransparencyRecordDisplayProps {
  record: TransparencyRecord;
}

export function TransparencyRecordDisplay({ record }: TransparencyRecordDisplayProps) {
  return (
    <div className="flex items-start gap-3 p-3 border-l-2 border-muted-foreground/30">
      <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">
            {record.action.replace(/_/g, " ")}
          </span>
          {record.witnesses.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {record.witnesses.length} witness(es)
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{record.rationale}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span className="font-mono truncate">{record.immutableHash.slice(0, 16)}...</span>
        </div>
      </div>
    </div>
  );
}
