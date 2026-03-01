import { useOnboardingStatus, useRolloutPhases } from "@/hooks/useInstitutionalExpansion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Rocket, ListChecks } from "lucide-react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

const CHECKLIST = [
  { key: "departments_configured", label: "Configure Departments" },
  { key: "roles_assigned", label: "Assign Admin Roles" },
  { key: "projects_created", label: "Create First Project" },
  { key: "first_milestone_completed", label: "Complete First Milestone" },
  { key: "first_certification_issued", label: "Issue First Certification" },
  { key: "first_analytics_reviewed", label: "Review Analytics Report" },
] as const;

export default function InstitutionOnboardingPage() {
  const { data: status } = useOnboardingStatus(INST_ID);
  const { data: phases = [] } = useRolloutPhases(INST_ID);

  const completedCount = status
    ? CHECKLIST.filter((c) => !!(status as any)[c.key]).length
    : 0;
  const progress = Math.round((completedCount / CHECKLIST.length) * 100);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Institutional Onboarding
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track your institution's rollout progress</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <Badge variant={progress === 100 ? "default" : "secondary"}>{progress}%</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Onboarding Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CHECKLIST.map((item) => {
              const done = status ? !!(status as any)[item.key] : false;
              return (
                <div key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rollout Phases */}
      {phases.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rollout Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phases.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                  <span className="font-medium text-foreground">{p.phase_name}</span>
                  <Badge variant={p.phase_status === "completed" ? "default" : "secondary"}>
                    {p.phase_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
