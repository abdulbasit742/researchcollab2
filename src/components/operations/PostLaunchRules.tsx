import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Ban, CheckCircle2, Clock, Target, Zap } from "lucide-react";

export function PostLaunchRules() {
  return (
    <div className="space-y-6">
      {/* Mission Statement */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold italic text-primary">
            "ResearchCollabPro grows by staying calm while others panic."
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For the first 90 days: Nothing critical breaks. No panic decisions. Signal separated from noise.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Non-Negotiable Rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              90-Day Operating Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">No new core features for 60 days</p>
                  <p className="text-xs text-muted-foreground">All features go through 30-day cooling</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">No schema changes without incident report</p>
                  <p className="text-xs text-muted-foreground">Database stability is paramount</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">No UI expansion without usage proof</p>
                  <p className="text-xs text-muted-foreground">Data before design</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-start gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm"><span className="font-medium">Bug fixes</span> — always allowed</p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm"><span className="font-medium">Clarity improvements</span> — always allowed</p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm"><span className="font-medium">Safety patches</span> — always allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absolute Constraints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Absolute Constraints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { rule: "Chase competitors", why: "Others' chaos is not your roadmap" },
                { rule: "Copy LinkedIn behavior", why: "Engagement patterns destroy trust" },
                { rule: "Optimize for engagement", why: "Time on platform ≠ value created" },
                { rule: "Announce roadmaps", why: "Promise only what exists today" },
                { rule: "React to loud feedback", why: "One user ≠ signal, emotion ≠ priority" },
                { rule: "Add vanity dashboards", why: "No DAU counters, no like metrics" },
              ].map(({ rule, why }) => (
                <div key={rule} className="flex items-start gap-2 p-2 rounded border">
                  <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Don't {rule}</p>
                    <p className="text-xs text-muted-foreground">{why}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident Response Playbook */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Incident Response Playbook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  level: "P0 — Critical",
                  color: "border-destructive/50 bg-destructive/5",
                  badge: "bg-destructive text-destructive-foreground",
                  response: "15 min",
                  who: "Founder acts immediately",
                  actions: ["Freeze affected systems", "Communicate to affected users", "All other work stops"],
                },
                {
                  level: "P1 — High",
                  color: "border-amber-500/50 bg-amber-500/5",
                  badge: "bg-amber-500 text-white",
                  response: "1 hour",
                  who: "Founder investigates",
                  actions: ["Assess blast radius", "Prepare mitigation", "Monitor closely"],
                },
                {
                  level: "P2 — Medium",
                  color: "border-yellow-500/50 bg-yellow-500/5",
                  badge: "bg-yellow-500 text-black",
                  response: "24 hours",
                  who: "Founder observes",
                  actions: ["Log the issue", "Schedule fix", "No panic"],
                },
                {
                  level: "P3 — Low",
                  color: "border-muted bg-muted/20",
                  badge: "bg-muted text-muted-foreground",
                  response: "Next weekly review",
                  who: "Observe only",
                  actions: ["Add to backlog", "Track frequency", "May resolve itself"],
                },
              ].map(p => (
                <Card key={p.level} className={p.color}>
                  <CardContent className="p-3">
                    <Badge className={p.badge}>{p.level}</Badge>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs"><span className="font-medium">Response:</span> {p.response}</p>
                      <p className="text-xs"><span className="font-medium">Who:</span> {p.who}</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                        {p.actions.map(a => <li key={a}>{a}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
