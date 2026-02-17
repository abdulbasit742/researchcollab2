import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollText, Shield, TrendingUp, Scale, Clock, Globe, Zap, Lock, Triangle, Eye, Compass, Target, Gem, Sprout, Flame, Heart } from "lucide-react";

const doctrines = [
  {
    numeral: "I",
    title: "The Core Axiom",
    icon: Zap,
    content: "Human civilization scales through verified coordination. Not ideology. Not charisma. Not coercion. When coordination is verified, capital flows efficiently, talent compounds, institutions stabilize, governance resists capture, and civilization accelerates.",
  },
  {
    numeral: "II",
    title: "The Three Permanent Constraints",
    icon: Lock,
    content: "Every civilization must solve three equations: The Trust Equation (can strangers coordinate without collapse?), The Capital Equation (can future productivity be financed without destabilizing the present?), and The Governance Equation (can power evolve without being captured?).",
  },
  {
    numeral: "III",
    title: "The Law of Verified Output",
    icon: Shield,
    content: "Identity must derive from output. Reputation from performance. Capital from productivity. Governance power from contribution. When any detaches from its source, decay begins.",
  },
  {
    numeral: "IV",
    title: "The Stability Triangle",
    icon: Triangle,
    content: "Sustainable civilization requires: Transparent incentives, Constrained power, and Auditable systems. Remove transparency → corruption. Remove constraint → authoritarian capture. Remove auditability → entropy.",
  },
  {
    numeral: "V",
    title: "The Antifragility Principle",
    icon: TrendingUp,
    content: "A civilization must not merely resist shocks. It must improve because of them. This requires feedback loops, transparent failure, adaptive governance, economic stress testing, and non-centralized resilience.",
  },
  {
    numeral: "VI",
    title: "Capital-Trust Symmetry",
    icon: Scale,
    content: "Capital and trust mirror each other. Low trust → high friction → low capital velocity. High trust → low friction → high capital velocity. Trust must be measured through action, not narrative. Execution trust compounds.",
  },
  {
    numeral: "VII",
    title: "The Incentive Alignment Law",
    icon: Eye,
    content: "If incentives are misaligned, no architecture can save the system. Incentives must align individual gain, institutional stability, capital preservation, and long-term productivity.",
  },
  {
    numeral: "VIII",
    title: "The Sovereignty Paradox",
    icon: Globe,
    content: "True sovereignty is not isolation. It is voluntary interoperability. A node that cannot interoperate collapses. A node that surrenders autonomy dissolves. Sovereignty exists in balance.",
  },
  {
    numeral: "IX",
    title: "The Long-Horizon Rule",
    icon: Clock,
    content: "Civilization-scale systems must think in: 5-year cycles for institutions, 10-year cycles for capital, 25-year cycles for infrastructure, 100-year cycles for governance. Short-term dominance destroys long-term viability.",
  },
  {
    numeral: "X",
    title: "The Final Insight",
    icon: ScrollText,
    content: "Civilization is not territory. It is coordination quality. Two small communities with high verified coordination are stronger than large populations with narrative cohesion but unverified execution.",
  },
];

const layer20Doctrines = [
  {
    numeral: "XI",
    title: "The Three Civilizational Directions",
    icon: Compass,
    content: "Any advanced coordination system orients toward one of three ends: Power Maximization (expansion, dominance, control), Wealth Maximization (capital growth, financial optimization), or Capability Maximization (human potential expansion, competence density). Most drift into the first two. Very few anchor in the third.",
  },
  {
    numeral: "XII",
    title: "The Highest-Leverage Direction",
    icon: Target,
    content: "Power without capability decays. Wealth without capability destabilizes. Capability compounds. It creates wealth, enables power, sustains governance, improves resilience, and expands possibility. If a civilization optimizes for capability density per capita, it becomes nearly impossible to suppress.",
  },
  {
    numeral: "XIII",
    title: "The Real Scarcity",
    icon: Gem,
    content: "Energy, information, and capital are abundant relative to history. What is scarce? Verified competence. Trustworthy execution. Aligned long-term incentives. Productive coordination quality. Scarcity defines value. The highest-leverage objective: increase verified capability density across the network.",
  },
  {
    numeral: "XIV",
    title: "The Human Constraint",
    icon: Eye,
    content: "No system can outrun human nature. Humans seek status, respond to incentives, avoid friction, and prefer narrative over accountability. A durable system must channel status toward contribution, align incentives with long-term outcomes, make accountability unavoidable, and replace narrative status with performance status.",
  },
  {
    numeral: "XV",
    title: "The Compounding Mechanism",
    icon: TrendingUp,
    content: "Trust → lowers friction → increases capital velocity → increases opportunity → increases skill acquisition → increases productivity → increases trust. A compounding civilization loop. Break any node — decay begins. Strengthen each node — acceleration begins.",
  },
  {
    numeral: "XVI",
    title: "The End State",
    icon: Globe,
    content: "The most advanced civilization is not one with the most territory, capital, or population. It is one with the highest verified productivity per capita, the lowest corruption entropy, the fastest skill adaptation cycle, the most stable governance under stress, and the most antifragile coordination network.",
  },
];

const layer21Doctrines = [
  {
    numeral: "XVII",
    title: "Trust Must Be Earned Through Observable Contribution",
    icon: Shield,
    content: "If people revert to narrative reputation, political proximity, or inherited status, the system collapses into pre-modern coordination. The only invariant rule that must survive collapse: contribution precedes influence.",
  },
  {
    numeral: "XVIII",
    title: "Capital Must Represent Real Output",
    icon: Scale,
    content: "When capital detaches from productivity, bubbles inflate, inequality destabilizes, and coordination fractures. If everything collapses but this rule survives — value tracks output — recovery is possible.",
  },
  {
    numeral: "XIX",
    title: "Governance Must Be Constrained",
    icon: Lock,
    content: "Power unconstrained corrupts coordination. Even in small communities. Even without technology. The invariant rule: authority must be accountable to contribution and transparent process. If that remains, capture can be reversed.",
  },
  {
    numeral: "XX",
    title: "Feedback Must Be Immediate",
    icon: Flame,
    content: "Civilizations decay when feedback is delayed. If failure is hidden, errors punished instead of corrected, and signals distorted, entropy accelerates. The irreducible principle: systems must expose failure early.",
  },
  {
    numeral: "XXI",
    title: "Status Must Attach to Creation, Not Control",
    icon: Sprout,
    content: "Control-based status breeds stagnation. Creation-based status breeds expansion. If people admire builders more than rulers, the civilization remains productive.",
  },
  {
    numeral: "XXII",
    title: "The Only Durable Asset",
    icon: Heart,
    content: "Not capital. Not infrastructure. Not planetary reach. The only durable asset across centuries is a culture that equates dignity with competence and cooperation. Technology amplifies — it does not replace. If the underlying cultural logic is strong, scaling it compounds strength. Everything else is transient.",
  },
];

const CivilizationalDoctrinePage = () => {
  return (
    <>
      <Helmet><title>Civilizational Doctrine | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <ScrollText className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold tracking-tight">Civilizational Doctrine</h1>
            <p className="text-muted-foreground mt-2 text-lg">The Philosophy of Verified Human Coordination</p>
            <Separator className="mt-6 mx-auto w-24" />
          </div>

          {/* Layer 19 — The Philosophy of Verified Human Coordination */}
          <h2 className="text-2xl font-semibold mt-2">Layer 19 — The Philosophy of Verified Human Coordination</h2>
          <div className="space-y-6">
            {doctrines.map((d) => {
              const Icon = d.icon;
              return (
                <Card key={d.numeral} className="border-l-4 border-l-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground font-mono mr-1">{d.numeral}.</span>
                      {d.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{d.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator className="my-10" />

          {/* Layer 20 — Civilizational Purpose & Direction */}
          <div className="text-center mb-8">
            <Compass className="h-10 w-10 mx-auto text-primary mb-3" />
            <h2 className="text-2xl font-semibold">Layer 20 — Civilizational Purpose & Direction</h2>
            <p className="text-muted-foreground mt-1">The Question of "Why"</p>
          </div>
          <div className="space-y-6">
            {layer20Doctrines.map((d) => {
              const Icon = d.icon;
              return (
                <Card key={d.numeral} className="border-l-4 border-l-accent/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Icon className="h-5 w-5 text-accent-foreground flex-shrink-0" />
                      <span className="text-muted-foreground font-mono mr-1">{d.numeral}.</span>
                      {d.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{d.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator className="my-10" />

          {/* Layer 21 — Irreducible Core */}
          <div className="text-center mb-8">
            <Heart className="h-10 w-10 mx-auto text-primary mb-3" />
            <h2 className="text-2xl font-semibold">Layer 21 — Irreducible Core</h2>
            <p className="text-muted-foreground mt-1">What Survives Collapse</p>
          </div>
          <div className="space-y-6">
            {layer21Doctrines.map((d) => {
              const Icon = d.icon;
              return (
                <Card key={d.numeral} className="border-l-4 border-l-secondary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Icon className="h-5 w-5 text-secondary-foreground flex-shrink-0" />
                      <span className="text-muted-foreground font-mono mr-1">{d.numeral}.</span>
                      {d.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{d.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <p className="text-lg font-semibold">Beyond This, Only Choices Remain</p>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                The structure is complete. Twenty-one layers — from local execution to civilizational philosophy. What remains is not engineering. It is execution. The only durable asset is a culture that equates dignity with competence and cooperation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CivilizationalDoctrinePage;
