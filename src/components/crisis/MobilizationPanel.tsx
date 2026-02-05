import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { MobilizedUnit, MobilizationCandidate } from "@/types/crisis-coordination";

interface MobilizationPanelProps {
  unit?: MobilizedUnit;
  candidates?: MobilizationCandidate[];
  onMobilize?: (candidates: MobilizationCandidate[]) => void;
  onDisband?: () => void;
}

const purposeLabels: Record<string, { label: string; color: string }> = {
  task_force: { label: "Task Force", color: "bg-blue-500" },
  expert_panel: { label: "Expert Panel", color: "bg-purple-500" },
  response_team: { label: "Response Team", color: "bg-red-500" },
  advisory_council: { label: "Advisory Council", color: "bg-amber-500" },
  emergency_unit: { label: "Emergency Unit", color: "bg-red-600" },
};

const statusColors = {
  forming: "bg-yellow-500",
  active: "bg-green-500",
  completing: "bg-blue-500",
  disbanded: "bg-muted",
};

export function MobilizationPanel({ unit, candidates, onMobilize, onDisband }: MobilizationPanelProps) {
  if (unit) {
    const purposeInfo = purposeLabels[unit.purpose] || { label: unit.purpose, color: "bg-muted" };
    const elapsed = unit.status !== "disbanded" 
      ? Math.round((Date.now() - new Date(unit.activatedAt).getTime()) / 3600000)
      : unit.actualDuration || 0;
    const progress = Math.min(100, (elapsed / unit.expectedDuration) * 100);

    return (
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{unit.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={purposeInfo.color}>{purposeInfo.label}</Badge>
              <Badge variant="outline" className={statusColors[unit.status]}>
                {unit.status}
              </Badge>
            </div>
          </div>
          <CardDescription>{unit.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{unit.members.length} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{elapsed}h / {unit.expectedDuration}h</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Objectives</h4>
            <ul className="space-y-1">
              {unit.objectives.map((obj, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-1 text-green-500" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Team Members</h4>
            <div className="flex flex-wrap gap-2">
              {unit.members.slice(0, 5).map((member) => (
                <Badge key={member.userId} variant="secondary" className="text-xs">
                  {member.userName}
                  <span className="ml-1 opacity-60">({Math.round(member.matchScore * 100)}%)</span>
                </Badge>
              ))}
              {unit.members.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{unit.members.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {unit.status === "active" && onDisband && (
            <Button variant="outline" size="sm" onClick={onDisband} className="w-full">
              Complete & Disband Unit
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Candidate selection view
  if (candidates && candidates.length > 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Matched Candidates</CardTitle>
          </div>
          <CardDescription>
            {candidates.length} professionals match your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidates.map((candidate) => (
            <div 
              key={candidate.userId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-medium">{candidate.userName}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Match: {Math.round(candidate.matchScore * 100)}%</span>
                  <span>Trust: {candidate.trustScore}</span>
                  <span>Ready: L{candidate.readinessLevel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={candidate.availabilityStatus === "immediate" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {candidate.availabilityStatus === "immediate" && <Zap className="h-3 w-3 mr-1" />}
                  {candidate.availabilityStatus.replace("_", " ")}
                </Badge>
                {candidate.currentCommitments > 2 && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          ))}

          {onMobilize && (
            <Button className="w-full" onClick={() => onMobilize(candidates)}>
              <Users className="h-4 w-4 mr-2" />
              Mobilize Selected Team
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
