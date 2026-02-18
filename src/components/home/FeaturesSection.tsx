import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, DollarSign, Scale, Award, Fingerprint, TrendingUp, Microscope, Globe, GraduationCap, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Escrow-Backed Execution",
    description: "Funds locked until milestones verified. Atomic release with double-entry ledger. Zero payment anxiety.",
    tag: "CORE",
    gradient: "from-emerald-500 to-teal-600",
    href: "/deals",
  },
  {
    icon: TrendingUp,
    title: "Non-Gameable Trust Scores",
    description: "Velocity-capped, entropy-weighted scoring from real outcomes. Reciprocal dampening blocks collusion.",
    tag: "UNIQUE",
    gradient: "from-primary to-blue-600",
    href: "/leaderboard",
  },
  {
    icon: Brain,
    title: "AI Capital Intelligence",
    description: "Predictive matching, risk scoring, and opportunity detection trained on outcome data — not keywords.",
    tag: "AI",
    gradient: "from-violet-500 to-purple-600",
    href: "/tools",
  },
  {
    icon: Scale,
    title: "Digital Arbitration Court",
    description: "Evidence-based dispute resolution with faculty mediation, binding verdicts, and trust impact.",
    tag: "LEGAL",
    gradient: "from-rose-500 to-red-600",
    href: "/arbitration-court",
  },
  {
    icon: Fingerprint,
    title: "Sovereign Reputation Passport",
    description: "W3C Verifiable Credentials you own forever. Export your trust score, outcomes, and identity anywhere.",
    tag: "IDENTITY",
    gradient: "from-cyan-500 to-blue-600",
    href: "/passport",
  },
  {
    icon: Microscope,
    title: "Research Intelligence Engine",
    description: "AI-powered gap detection, literature review generation, paper analysis. Beyond Google Scholar.",
    tag: "RESEARCH",
    gradient: "from-indigo-500 to-violet-600",
    href: "/research",
  },
  {
    icon: GraduationCap,
    title: "Academic Integration Layer",
    description: "FYP tracking, course linking, supervisor tools, and institutional dashboards built natively.",
    tag: "ACADEMIC",
    gradient: "from-amber-500 to-orange-600",
    href: "/academic",
  },
  {
    icon: Globe,
    title: "Sovereign Node Architecture",
    description: "Multi-country deployment with data residency compliance, government reporting, and federation.",
    tag: "ENTERPRISE",
    gradient: "from-slate-500 to-zinc-600",
    href: "/enterprise",
  },
  {
    icon: DollarSign,
    title: "Trust-Weighted Economics",
    description: "Commission rates from 6-12% — the more you deliver, the less you pay. Incentives aligned with quality.",
    tag: "ECONOMICS",
    gradient: "from-emerald-600 to-green-700",
    href: "/earn",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_60%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 uppercase tracking-wider">
            9 Core Pillars
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Not a Marketplace.
            <br />
            <span className="text-primary">A Professional Operating System.</span>
          </h2>
          <p className="mt-4 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make professional work safer, faster, and more accountable than any platform on earth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
            >
              <Link to={feature.href} className="block h-full group">
                <div className="h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 flex flex-col relative overflow-hidden">
                  {/* Hover gradient */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500`} />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded-md">{feature.tag}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors relative z-10">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 relative z-10">{feature.description}</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-4 group-hover:gap-3 transition-all relative z-10">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
