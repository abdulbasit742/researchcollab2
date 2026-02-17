import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollText, Shield, TrendingUp, Scale, Clock, Globe, Zap, Lock, Triangle, Eye } from "lucide-react";

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

          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <p className="text-lg font-semibold">There Is No Layer 20</p>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Beyond doctrine, there are only choices. The structure is complete. What remains is not engineering. It is execution.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CivilizationalDoctrinePage;
