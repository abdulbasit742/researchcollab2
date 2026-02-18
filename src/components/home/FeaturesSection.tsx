import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Brain, DollarSign, Scale, Award, Fingerprint, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Escrow-Backed Execution",
    description: "Every deal is financially protected. Funds are locked until milestones are verified and delivered — no more payment anxiety.",
    tag: "Core",
    color: "from-emerald-500 to-teal-600",
    href: "/deals",
  },
  {
    icon: TrendingUp,
    title: "Non-Gameable Trust Scores",
    description: "Trust earned through verified outcomes, peer reviews, and delivery consistency — with velocity caps and gaming detection.",
    tag: "Unique",
    color: "from-primary to-blue-600",
    href: "/leaderboard",
  },
  {
    icon: Brain,
    title: "AI Capital Intelligence",
    description: "Our proprietary AI allocates capital, predicts project success, and matches talent based on deep outcome data — not keywords.",
    tag: "AI",
    color: "from-violet-500 to-purple-600",
    href: "/tools",
  },
  {
    icon: DollarSign,
    title: "Earn What You're Worth",
    description: "Trust-weighted commissions from 6% to 12%. The more you deliver, the less you pay. No race-to-the-bottom pricing.",
    tag: "Economics",
    color: "from-amber-500 to-orange-600",
    href: "/earn",
  },
  {
    icon: Scale,
    title: "Digital Arbitration Court",
    description: "Structured dispute resolution with evidence submission, faculty mediation, and binding verdicts — not just a support ticket.",
    tag: "Legal",
    color: "from-rose-500 to-red-600",
    href: "/arbitration-court",
  },
  {
    icon: Fingerprint,
    title: "Sovereign Reputation Passport",
    description: "Your trust score, outcomes, and credentials exported as W3C Verifiable Credentials. Own your professional identity.",
    tag: "Identity",
    color: "from-cyan-500 to-blue-600",
    href: "/passport",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_60%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary">
            Not Another Marketplace
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Infrastructure for{" "}
            <span className="text-primary">Professional Execution</span>
          </h2>
          <p className="mt-3 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make professional work safer, faster, and more accountable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Link to={feature.href} className="block h-full group">
                <div className="h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-7 transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold">{feature.tag}</Badge>
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-4 group-hover:gap-2 transition-all">
                    Learn more
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
