import { useActivationFunnel } from "@/hooks/useActivationFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Rocket } from "lucide-react";

const EVENT_LABELS: Record<string, string> = {
  signup_completed: "Sign Up",
  profile_completed: "Complete Profile",
  first_project_created: "Create Project",
  first_project_joined: "Join Project",
  first_milestone_created: "Create Milestone",
  first_submission_made: "Submit Work",
  first_review_completed: "Complete Review",
  first_message_sent: "Send Message",
  first_artifact_uploaded: "Upload Artifact",
};

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "text-muted-foreground" },
  exploring: { label: "Exploring", color: "text-amber-600" },
  engaged: { label: "Engaged", color: "text-blue-600" },
  active: { label: "Active", color: "text-emerald-600" },
  power_user: { label: "Power User", color: "text-primary" },
};

export function ActivationProgressBar() {
  const { events, progress, stage, completedCount, totalCount, isLoading } = useActivationFunnel();

  if (isLoading) return null;
  if (progress === 100) return null;

  const stageInfo = STAGE_LABELS[stage] ?? STAGE_LABELS.new;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Activation Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {completedCount}/{totalCount}
            </Badge>
            <span className={`text-xs font-semibold ${stageInfo.color}`}>
              {stageInfo.label}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        {events.map((ev) => (
          <div
            key={ev.type}
            className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${
              ev.completed ? "opacity-60" : ""
            }`}
          >
            {ev.completed ? (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={ev.completed ? "line-through" : "font-medium"}>
              {EVENT_LABELS[ev.type] ?? ev.type}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
