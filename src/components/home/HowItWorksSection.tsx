import { motion } from "framer-motion";
import { UserPlus, Search, Shield, TrendingUp, Repeat } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Build Your Proof",
    description: "Create a verified profile backed by real outcomes. Your trust score starts computing from your first action.",
    gradient: "from-primary to-blue-600",
  },
  {
    icon: Search,
    number: "02",
    title: "Get Matched by AI",
    description: "Our intelligence engine finds opportunities based on skills, trust, and success probability — not just keywords.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Shield,
    number: "03",
    title: "Execute with Protection",
    description: "Every deal is escrow-backed with milestone triggers. Both sides financially protected. Disputes resolved by arbitration.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Compound Your Value",
    description: "Every completed project boosts your trust score, unlocks better rates, and attracts higher-value opportunities.",
    gradient: "from-amber-500 to-orange-600",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-muted/20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            How <span className="text-primary">Execution</span> Works
          </h2>
          <p className="mt-4 text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">
            A self-reinforcing flywheel where every outcome makes you exponentially more valuable.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-7 md:p-8 transition-all duration-500 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 relative overflow-hidden">
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500`} />
                  
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="shrink-0">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">{step.number}</span>
                      <h3 className="text-xl font-bold mt-1 mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loop indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Repeat className="h-4 w-4" />
              </motion.div>
              Self-reinforcing flywheel — every outcome compounds exponentially
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
