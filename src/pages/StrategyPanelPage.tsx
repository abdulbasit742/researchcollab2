import { usePlatformIdentity, useMarketDifferentiation } from "@/hooks/useStrategicPositioning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, CheckCircle } from "lucide-react";

const MATURITY_LAYERS = [
  "Architecture", "UX", "Analytics", "Integrity", "Performance", "Security",
  "AI Assistance", "Engagement", "Discovery", "Multi-Tenancy", "Compliance",
  "Executive Intelligence", "Safe Automation", "Adaptive Intelligence",
  "Accreditation", "Institutional Expansion", "Monetization",
  "Predictive Modeling", "Governance Intelligence", "AI Orchestration",
  "Federation Infrastructure", "Strategic Positioning",
];

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

export default function StrategyPanelPage() {
  const { data: identity } = usePlatformIdentity();
  const { data: diff } = useMarketDifferentiation();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" /> Internal Strategy Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Platform maturity, competitive edge, and expansion readiness</p>
      </div>

      {/* Category */}
      {identity && (
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <Badge variant="default" className="text-xs mb-1">{identity.category_label}</Badge>
          <p className="text-sm text-foreground">{identity.positioning_statement}</p>
        </div>
      )}

      {/* Maturity Layers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform Maturity — {MATURITY_LAYERS.length} Layers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {MATURITY_LAYERS.map((layer) => (
              <div key={layer} className="flex items-center gap-1.5 text-xs text-foreground p-1.5 rounded bg-muted/30">
                <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                {layer}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Strength */}
      {diff && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Strategic Strength Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Execution Strength", value: diff.execution_strength_score },
                { label: "Governance Depth", value: diff.governance_strength_score },
                { label: "Predictive Intelligence", value: diff.predictive_intelligence_score },
                { label: "Accreditation Depth", value: diff.accreditation_depth_score },
                { label: "Federation Readiness", value: diff.federation_readiness_score },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{m.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(m.value, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${sc(m.value)}`}>{m.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Position Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Strategic Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          <p>RCollab does not compete with compute platforms, project management tools, or academic LMS systems.</p>
          <p>RCollab is <span className="font-medium text-primary">Institutional Execution Infrastructure</span> — the coordination layer above all of them.</p>
          <div className="pt-2 space-y-1 text-xs text-muted-foreground">
            <p>• Compute platforms become subsystems</p>
            <p>• Project tools handle fragments — RCollab coordinates the lifecycle</p>
            <p>• LMS tracks attendance — RCollab verifies outcomes</p>
            <p>• Funding portals distribute — RCollab executes with escrow integrity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
