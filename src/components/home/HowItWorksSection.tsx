import { motion } from "framer-motion";
import { Briefcase, DollarSign, Lock, CheckCircle2, Shield, UserCheck, Repeat } from "lucide-react";

const steps = [
  {
    icon: Briefcase,
    number: "01",
    title: "Student Creates FYP",
    description: "Submit your final year project with clear scope, milestones, and deliverables. Faculty approves the structure.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: DollarSign,
    number: "02",
    title: "Sponsor Funds Project",
    description: "Industry sponsors discover and fund student FYPs. Capital is deposited and locked in escrow — protected for both sides.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Lock,
    number: "03",
    title: "Escrow Locks Capital",
    description: "Funds are secured with milestone-based release triggers. No money moves until deliverables are verified and approved.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "Milestones Executed",
    description: "Students submit work at each milestone. Faculty validates. Sponsor reviews. Payment releases automatically on approval.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Shield,
    number: "05",
    title: "Trust Updated",
    description: "Every completed milestone updates trust scores for all parties. Verified outcomes compound your professional reputation.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: UserCheck,
    number: "06",
    title: "Hiring Outcome Captured",
    description: "Top performers get hired by their sponsors. The platform tracks FYP-to-employment conversions — real ROI for universities.",
    gradient: "from-primary to-primary/70",
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
            The <span className="text-primary">Core Loop</span>
          </h2>
          <p className="mt-4 text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">
            Create → Fund → Execute → Complete → Hire. Everything else is noise.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-7 transition-all duration-500 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 relative overflow-hidden">
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
              Every completed FYP compounds trust, revenue, and hiring outcomes
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
