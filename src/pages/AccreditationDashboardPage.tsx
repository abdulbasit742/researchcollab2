import {
  useAccreditationLevel, useAccreditationHistory, useMilestoneCertifications,
  useProjectCertificates, useCertificationAuditLog,
} from "@/hooks/useAccreditation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Award, Shield, CheckCircle2, Clock, FileText, Activity, Star,
} from "lucide-react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  Bronze: { color: "text-amber-700", icon: "🥉" },
  Silver: { color: "text-slate-500", icon: "🥈" },
  Gold: { color: "text-yellow-500", icon: "🥇" },
  Platinum: { color: "text-indigo-500", icon: "💎" },
};

function scoreColor(v: number) {
  if (v >= 80) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

export default function AccreditationDashboardPage() {
  const { data: level } = useAccreditationLevel(INST_ID);
  const { data: history = [] } = useAccreditationHistory(INST_ID);
  const { data: msCerts = [] } = useMilestoneCertifications(INST_ID);
  const { data: projCerts = [] } = useProjectCertificates(INST_ID);
  const { data: auditLog = [] } = useCertificationAuditLog(INST_ID);

  const tier = level?.accreditation_tier ?? "Bronze";
  const tierCfg = TIER_CONFIG[tier] ?? TIER_CONFIG.Bronze;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Accreditation & Certification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Institutional accreditation level, certifications, and credentials</p>
      </div>

      {/* Current Tier */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center">
              <span className="text-5xl">{tierCfg.icon}</span>
              <p className={`text-xl font-bold mt-2 ${tierCfg.color}`}>{tier}</p>
              <p className="text-[10px] text-muted-foreground">Accreditation Tier</p>
            </div>
            {level ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Completion Rate", value: level.completion_rate },
                  { label: "Governance Score", value: level.governance_score },
                  { label: "Compliance Score", value: level.compliance_score },
                  { label: "Engagement Score", value: level.engagement_score },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className={`text-lg font-bold ${scoreColor(m.value)}`}>{m.value.toFixed(0)}%</p>
                    <Progress value={m.value} className="h-1.5 mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No accreditation data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tier History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tier History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No history available.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                    <div className="flex items-center gap-2">
                      <span>{TIER_CONFIG[h.accreditation_tier]?.icon ?? "🔘"}</span>
                      <span className="font-medium text-foreground">{h.accreditation_tier}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(h.issued_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certification Volume */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Certification Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{msCerts.length}</p>
                <p className="text-[10px] text-muted-foreground">Milestone Certifications</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{projCerts.length}</p>
                <p className="text-[10px] text-muted-foreground">Project Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Recent Milestone Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {msCerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No certifications issued yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {msCerts.slice(0, 15).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded text-sm hover:bg-muted/30">
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{c.certification_type}</span>
                    <span className="text-muted-foreground"> · Score: </span>
                    <span className={scoreColor(c.certification_score)}>{c.certification_score.toFixed(0)}</span>
                  </div>
                  <code className="text-[9px] text-muted-foreground font-mono">{c.verification_hash.slice(0, 12)}...</code>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(c.issued_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certification Audit Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Certification Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No audit events.</p>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {(auditLog as any[]).slice(0, 15).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded text-sm hover:bg-muted/30">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{e.action}</span>
                    <span className="text-muted-foreground"> on </span>
                    <span className="text-foreground">{e.entity_type}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
