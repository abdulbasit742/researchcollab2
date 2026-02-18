import { motion } from "framer-motion";
import { Check, X, Minus, Shield, TrendingUp, Brain, Banknote, Scale, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    icon: Shield,
    label: "Payment Protection",
    linkedin: "none",
    upwork: "partial",
    fiverr: "partial",
    rcollab: "full",
    rcollabDetail: "Escrow-backed with milestone triggers",
  },
  {
    icon: TrendingUp,
    label: "Verified Trust Scores",
    linkedin: "none",
    upwork: "basic",
    fiverr: "basic",
    rcollab: "full",
    rcollabDetail: "Non-gameable, outcome-based scoring",
  },
  {
    icon: Brain,
    label: "AI-Powered Matching",
    linkedin: "basic",
    upwork: "basic",
    fiverr: "none",
    rcollab: "full",
    rcollabDetail: "Skills + trust + timing fit scoring",
  },
  {
    icon: Banknote,
    label: "Fair Pricing",
    linkedin: "none",
    upwork: "none",
    fiverr: "none",
    rcollab: "full",
    rcollabDetail: "Trust-weighted commissions (6-12%)",
  },
  {
    icon: Scale,
    label: "Dispute Resolution",
    linkedin: "none",
    upwork: "basic",
    fiverr: "basic",
    rcollab: "full",
    rcollabDetail: "Digital arbitration court with evidence",
  },
  {
    icon: Award,
    label: "Portable Credentials",
    linkedin: "basic",
    upwork: "none",
    fiverr: "none",
    rcollab: "full",
    rcollabDetail: "W3C Verifiable Credentials (DID)",
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "full") return <Check className="h-5 w-5 text-primary" />;
  if (status === "partial" || status === "basic") return <Minus className="h-4 w-4 text-warning" />;
  return <X className="h-4 w-4 text-destructive/50" />;
}

export function CompetitorComparisonSection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary">
            Why We Win
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            They Connect People.
            <br />
            <span className="text-primary">We Guarantee Outcomes.</span>
          </h2>
          <p className="mt-4 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is built to protect your work, money, and reputation.
          </p>
        </motion.div>

        {/* Comparison table - Desktop */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 border-b border-border/50 bg-muted/50">
              <div className="p-4 text-sm font-semibold text-foreground">Feature</div>
              <div className="p-4 text-center text-sm font-medium text-muted-foreground">LinkedIn</div>
              <div className="p-4 text-center text-sm font-medium text-muted-foreground">Upwork</div>
              <div className="p-4 text-center text-sm font-medium text-muted-foreground">Fiverr</div>
              <div className="p-4 text-center text-sm font-bold text-primary bg-primary/5">RCollab</div>
            </div>

            {/* Rows */}
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="grid grid-cols-5 gap-0 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="p-4 flex items-center gap-3">
                  <cat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <div className="p-4 flex items-center justify-center"><StatusIcon status={cat.linkedin} /></div>
                <div className="p-4 flex items-center justify-center"><StatusIcon status={cat.upwork} /></div>
                <div className="p-4 flex items-center justify-center"><StatusIcon status={cat.fiverr} /></div>
                <div className="p-4 flex flex-col items-center justify-center gap-1 bg-primary/5">
                  <StatusIcon status={cat.rcollab} />
                  <span className="text-[10px] text-primary/70 font-medium text-center leading-tight">{cat.rcollabDetail}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison cards - Mobile */}
        <div className="md:hidden space-y-3 max-w-lg mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border/50 bg-card/50 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <cat.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{cat.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={cat.linkedin} />
                  <span className="text-[10px] text-muted-foreground">LinkedIn</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={cat.upwork} />
                  <span className="text-[10px] text-muted-foreground">Upwork</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={cat.fiverr} />
                  <span className="text-[10px] text-muted-foreground">Fiverr</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-primary/5 rounded-lg py-1">
                  <StatusIcon status={cat.rcollab} />
                  <span className="text-[10px] text-primary font-bold">RCollab</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-primary/70 font-medium">{cat.rcollabDetail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
