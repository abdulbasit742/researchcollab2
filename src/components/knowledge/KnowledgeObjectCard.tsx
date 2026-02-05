import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { KnowledgeObject, KnowledgeLifecycleState, ValidationLevel } from "@/types/knowledge-civilization";

interface KnowledgeObjectCardProps {
  object: KnowledgeObject;
  onView?: () => void;
  onValidate?: () => void;
  compact?: boolean;
}

const lifecycleColors: Record<KnowledgeLifecycleState, string> = {
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  validated: "bg-green-500/20 text-green-700 dark:text-green-300",
  contested: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  superseded: "bg-slate-500/20 text-slate-600 dark:text-slate-300",
  legacy: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  archived: "bg-slate-400/20 text-slate-500",
};

const validationLabels: Record<ValidationLevel, { label: string; color: string }> = {
  unvalidated: { label: "Unvalidated", color: "text-muted-foreground" },
  peer_reviewed: { label: "Peer Reviewed", color: "text-blue-600 dark:text-blue-400" },
  institution_endorsed: { label: "Institution Endorsed", color: "text-indigo-600 dark:text-indigo-400" },
  field_validated: { label: "Field Validated", color: "text-green-600 dark:text-green-400" },
  consensus: { label: "Consensus", color: "text-emerald-600 dark:text-emerald-400" },
};

export function KnowledgeObjectCard({
  object,
  onView,
  onValidate,
  compact = false,
}: KnowledgeObjectCardProps) {
  const validation = validationLabels[object.validationLevel];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{object.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={validation.color}>{validation.label}</span>
              <span>•</span>
              <span>{object.type.replace("_", " ")}</span>
            </div>
          </div>
        </div>
        <Badge className={lifecycleColors[object.lifecycleState]} variant="secondary">
          {object.lifecycleState}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{object.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{object.domain}</p>
          </div>
          <Badge className={lifecycleColors[object.lifecycleState]} variant="secondary">
            {object.lifecycleState}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {object.abstract}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credibility</span>
            <span className="font-medium">{object.credibilityScore}%</span>
          </div>
          <Progress value={object.credibilityScore} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">{object.authors.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Authors</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">{object.validatorCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Validators</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">{object.citationCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Citations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${validation.color}`}>
            {validation.label}
          </span>
          {object.contestationCount > 0 && (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs">{object.contestationCount} contestations</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>v{object.currentVersion}</span>
          </div>
          <div className="flex gap-2">
            {onValidate && object.lifecycleState !== "archived" && (
              <Button size="sm" variant="outline" onClick={onValidate}>
                Validate
              </Button>
            )}
            {onView && (
              <Button size="sm" onClick={onView}>
                View
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact list component
interface KnowledgeObjectListProps {
  objects: KnowledgeObject[];
  onSelect?: (object: KnowledgeObject) => void;
  emptyMessage?: string;
}

export function KnowledgeObjectList({
  objects,
  onSelect,
  emptyMessage = "No knowledge objects found",
}: KnowledgeObjectListProps) {
  if (objects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {objects.map((object) => (
        <div
          key={object.id}
          className="cursor-pointer"
          onClick={() => onSelect?.(object)}
        >
          <KnowledgeObjectCard object={object} compact />
        </div>
      ))}
    </div>
  );
}
