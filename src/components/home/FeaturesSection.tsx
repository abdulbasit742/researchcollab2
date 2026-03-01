import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, DollarSign, Scale, Award, Fingerprint, TrendingUp, Microscope, Globe, GraduationCap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Escrow-Backed Execution",
    description: "Funds locked until milestones verified. Atomic release with double-entry ledger. Zero payment anxiety.",
    tag: "CORE",
    href: "/deals",
  },
  {
    icon: TrendingUp,
    title: "Non-Gameable Trust Scores",
    description: "Velocity-capped, entropy-weighted scoring from real outcomes. Reciprocal dampening blocks collusion.",
    tag: "UNIQUE",
    href: "/leaderboard",
  },
  {
    icon: Brain,
    title: "AI Capital Intelligence",
    description: "Predictive matching, risk scoring, and opportunity detection trained on outcome data — not keywords.",
    tag: "AI",
    href: "/tools",
  },
  {
    icon: Scale,
    title: "Digital Arbitration Court",
    description: "Evidence-based dispute resolution with faculty mediation, binding verdicts, and trust impact.",
    tag: "LEGAL",
    href: "/arbitration-court",
  },
  {
    icon: Fingerprint,
    title: "Sovereign Reputation Passport",
    description: "W3C Verifiable Credentials you own forever. Export your trust score, outcomes, and identity anywhere.",
    tag: "IDENTITY",
    href: "/passport",
  },
  {
    icon: Microscope,
    title: "Research Intelligence Engine",
    description: "AI-powered gap detection, literature review generation, paper analysis. Beyond Google Scholar.",
    tag: "RESEARCH",
    href: "/research",
  },
  {
    icon: GraduationCap,
    title: "Academic Integration Layer",
    description: "FYP tracking, course linking, supervisor tools, and institutional dashboards built natively.",
    tag: "ACADEMIC",
    href: "/academic",
  },
  {
    icon: Globe,
    title: "Sovereign Node Architecture",
    description: "Multi-country deployment with data residency compliance, government reporting, and federation.",
    tag: "ENTERPRISE",
    href: "/enterprise",
  },
  {
    icon: DollarSign,
    title: "Trust-Weighted Economics",
    description: "Commission rates from 6-12% — the more you deliver, the less you pay. Incentives aligned with quality.",
    tag: "ECONOMICS",
    href: "/earn",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary mb-6 uppercase tracking-wider">
            9 Core Pillars
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Not a Marketplace.
            <br />
            <span className="text-primary">A Professional Operating System.</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make professional work safer, faster, and more accountable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              viewport={{ once: true }}
            >
              <Link to={feature.href} className="block h-full group">
                <div className="h-full rounded-lg border bg-card p-6 transition-shadow duration-200 hover:shadow-md flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-4 group-hover:gap-2.5 transition-all">
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
