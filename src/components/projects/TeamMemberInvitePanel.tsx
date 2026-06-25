import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_TEAM_INVITE_REQUIREMENTS,
  TEAM_INVITE_ROLE_OPTIONS,
  getTeamInviteReadiness,
  getTeamInviteStatus,
  getTeamInviteStatusClass,
  getTeamInviteStatusLabel,
} from "@/config/teamMemberInvite";
import { CheckCircle2, MailPlus, ShieldCheck, UserPlus, UsersRound, type LucideIcon } from "lucide-react";

export function TeamMemberInvitePanel() {
  const readiness = getTeamInviteReadiness(DEMO_TEAM_INVITE_REQUIREMENTS);
  const status = getTeamInviteStatus(DEMO_TEAM_INVITE_REQUIREMENTS);
  const missing = DEMO_TEAM_INVITE_REQUIREMENTS.filter((requirement) => !requirement.complete).length;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" />
              Team Member Invite Placeholder
            </CardTitle>
            <CardDescription>
              Plan student, researcher, builder, analyst, designer, and reviewer invitations before enabling real workspace-member writes.
            </CardDescription>
          </div>
          <Badge className={getTeamInviteStatusClass(status)}>{getTeamInviteStatusLabel(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={UserPlus} label="Invite roles" value={`${TEAM_INVITE_ROLE_OPTIONS.length} options`} />
          <InfoCard icon={ShieldCheck} label="Readiness" value={`${readiness}%`} />
          <InfoCard icon={CheckCircle2} label="Missing" value={`${missing} item(s)`} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Team invite readiness</span>
            <span>{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-2" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {TEAM_INVITE_ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{role.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                </div>
                <Badge variant="outline">{role.value}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.suggestedResponsibilities.map((responsibility) => (
                  <Badge key={responsibility} variant="secondary" className="text-[10px]">
                    {responsibility}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Team invite readiness checklist</p>
          {DEMO_TEAM_INVITE_REQUIREMENTS.map((requirement) => (
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
          This is a placeholder. It does not send invitations, create users, or add project members yet. Production invites should connect to project membership permissions, notification logs, and acceptance tracking.
        </div>

        <Button disabled className="w-full" title="Team invite sending will be enabled after project membership permissions are connected.">
          <MailPlus className="mr-2 h-4 w-4" /> Invite Team Member
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
