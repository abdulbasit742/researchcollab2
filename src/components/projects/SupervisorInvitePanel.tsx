import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_SUPERVISOR_INVITE,
  getSupervisorInviteReadiness,
  getSupervisorInviteStatus,
  getSupervisorInviteStatusClass,
  getSupervisorInviteStatusLabel,
  type SupervisorInvitePreview,
} from "@/config/supervisorInvite";
import { CheckCircle2, ClipboardList, GraduationCap, MailPlus, ShieldCheck, UserCheck } from "lucide-react";

type SupervisorInvitePanelProps = {
  invite?: SupervisorInvitePreview;
};

export function SupervisorInvitePanel({ invite = DEMO_SUPERVISOR_INVITE }: SupervisorInvitePanelProps) {
  const readiness = getSupervisorInviteReadiness(invite.requirements);
  const status = getSupervisorInviteStatus(invite.requirements);
  const remaining = invite.requirements.filter((requirement) => !requirement.complete).length;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Supervisor Invite Placeholder
            </CardTitle>
            <CardDescription>
              Prepare a supervisor invitation before enabling email, notification, or workspace-member writes.
            </CardDescription>
          </div>
          <Badge className={getSupervisorInviteStatusClass(status)}>{getSupervisorInviteStatusLabel(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={UserCheck} label="Role" value={invite.supervisorRole} />
          <InfoCard icon={ClipboardList} label="Readiness" value={`${readiness}%`} />
          <InfoCard icon={ShieldCheck} label="Remaining" value={`${remaining} item(s)`} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Invite readiness</span>
            <span>{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-2" />
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Suggested invite message</p>
          <p className="mt-2 text-sm text-muted-foreground">{invite.suggestedMessage}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Invite readiness checklist</p>
          {invite.requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-start gap-3 rounded-lg border p-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 ${requirement.complete ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{requirement.label}</p>
                  <Badge variant={requirement.complete ? "secondary" : "outline"}>{requirement.complete ? "Ready" : "Missing"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{requirement.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
          This is a placeholder. It does not send an email or add a supervisor yet. Production invite sending should connect to verified project records, notification logs, and permission checks.
        </div>

        <Button disabled className="w-full" title="Supervisor invite sending will be enabled after project member permissions are connected.">
          <MailPlus className="mr-2 h-4 w-4" /> Invite Supervisor
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof UserCheck; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
