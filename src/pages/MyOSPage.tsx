import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrustProfile } from "@/hooks/useTrustEngine";
import { useLiquidityIndex } from "@/hooks/useLiquidityIndex";
import { useOpportunityPipeline, useOpportunityScore } from "@/hooks/useOpportunityGraph";
import { useSkillGapEngine } from "@/hooks/useSkillGapEngine";
import { useCareerEvolution } from "@/hooks/useCareerEvolution";
import { useRiskIndex } from "@/hooks/useRiskIndex";
import { Shield, TrendingUp, Briefcase, AlertTriangle, Target, Brain, ArrowRight } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

function KPICard({ icon: Icon, label, value, subtitle, color }: any) {
  return (
    <Card variant="glass">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SkillGapRadar() {
  const { gaps } = useSkillGapEngine();

  const radarData = (gaps || []).slice(0, 6).map((g: any) => ({
    skill: g.capability || g.skill_name || "Skill",
    current: g.currentStrength ?? 50,
    required: g.requiredStrength ?? 80,
  }));

  if (radarData.length === 0) {
    radarData.push(
      { skill: "Technical", current: 60, required: 85 },
      { skill: "Research", current: 45, required: 75 },
      { skill: "Leadership", current: 55, required: 70 },
      { skill: "Communication", current: 70, required: 80 },
      { skill: "Analytics", current: 50, required: 90 },
    );
  }

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" /> Skill Gap Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
              <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              <Radar name="Required" dataKey="required" stroke="hsl(var(--destructive))" fill="none" strokeDasharray="4 4" />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const CAREER_PHASES = ["early_career", "growth", "mastery", "leadership", "legacy"] as const;

const phaseLabels: Record<string, string> = {
  early_career: "Early Career",
  growth: "Growth",
  mastery: "Mastery",
  leadership: "Leadership",
  legacy: "Legacy",
};

function CareerProjection() {
  const { getCurrentPhase } = useCareerEvolution();
  const currentPhase = getCurrentPhase();

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Career Projection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {CAREER_PHASES.map((phase, i) => (
            <div key={phase} className="flex items-center gap-1">
              <Badge
                variant={phase === currentPhase ? "default" : "outline"}
                className="text-[10px]"
              >
                {phaseLabels[phase]}
              </Badge>
              {i < CAREER_PHASES.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
        {currentPhase && (
          <div>
            <p className="text-sm font-medium">{phaseLabels[currentPhase] || currentPhase}</p>
            <p className="text-xs text-muted-foreground mt-1">Keep building your professional profile to advance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NextBestAction() {
  const { data: score } = useOpportunityScore();

  const lowestDimension = score
    ? Object.entries(score)
        .filter(([k]) => k !== "overall")
        .sort(([, a], [, b]) => (a as number) - (b as number))[0]
    : null;

  const actions: Record<string, string> = {
    skill: "Complete a project in a new domain to boost your skill match score.",
    trust: "Maintain consistent delivery timelines to improve trust fit.",
    outcomes: "Publish verified outcomes to strengthen your outcome history.",
    network: "Connect with professionals in adjacent fields to expand network reach.",
    readiness: "Update your profile and availability to increase readiness.",
  };

  const action = lowestDimension ? actions[lowestDimension[0]] || "Keep building your professional presence." : "Complete your profile to get started.";

  return (
    <Card variant="glass" className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Next Best Action</p>
            <p className="text-xs text-muted-foreground mt-1">{action}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyOSPage() {
  const { profile: trustProfile } = useTrustProfile();
  const { avgLiquidity } = useLiquidityIndex();
  const { data: pipeline } = useOpportunityPipeline();
  const { metrics: riskMetrics } = useRiskIndex("user");
  const [showDetails, setShowDetails] = useState(false);

  const trustScore = trustProfile?.trust_score ?? 0;
  const pipelineSize = pipeline?.total ?? 0;
  const riskLevel = riskMetrics?.composite_risk_score ?? 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Operating System</h1>
          <p className="text-sm text-muted-foreground">Your professional command center.</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Shield} label="Trust Score" value={trustScore} subtitle={trustProfile?.base_trust_level} color="primary" />
          <KPICard icon={TrendingUp} label="Avg Liquidity" value={avgLiquidity} color="emerald-500" />
          <KPICard icon={Briefcase} label="Pipeline" value={pipelineSize} subtitle={`${pipeline?.active ?? 0} active`} color="blue-500" />
          <KPICard icon={AlertTriangle} label="Risk Level" value={riskLevel} color="amber-500" />
        </div>

        {/* Middle Row */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="text-xs text-primary hover:underline mb-4 block">
            {showDetails ? "Hide details" : "Show full breakdown →"}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SkillGapRadar />
              <CareerProjection />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bottom */}
        <NextBestAction />
      </div>
    </MainLayout>
  );
}
