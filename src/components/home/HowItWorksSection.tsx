import { motion } from "framer-motion";
import { UserPlus, Search, Shield, TrendingUp, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Build Your Proof",
    description: "Create a verified profile backed by real outcomes — not self-reported claims. Your trust score starts building from day one.",
    color: "bg-primary",
  },
  {
    icon: Search,
    number: "02",
    title: "Get Matched by AI",
    description: "Our intelligence engine finds opportunities based on your skills, trust score, and success probability — not just keywords.",
    color: "bg-violet-500",
  },
  {
    icon: Shield,
    number: "03",
    title: "Execute with Protection",
    description: "Every deal is escrow-backed with milestone triggers. Funds are locked until you deliver. Both sides are protected.",
    color: "bg-emerald-500",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Compound Your Value",
    description: "Every completed project increases your trust score, unlocks better rates, and attracts higher-quality opportunities automatically.",
    color: "bg-amber-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden bg-muted/20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            How Professional <span className="text-primary">Execution</span> Works
          </h2>
          <p className="mt-3 text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">
            A self-reinforcing loop where every outcome makes you more valuable.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className={`h-12 w-12 rounded-xl ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary/50 uppercase tracking-widest">{step.number}</span>
                      <h3 className="text-lg md:text-xl font-bold mt-1 mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Connector arrow */}
                {i < steps.length - 1 && i % 2 === 0 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowDown className="h-4 w-4 text-primary/30 rotate-[-90deg]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Loop indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                ↻
              </motion.div>
              Self-reinforcing loop — every outcome compounds your value
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
