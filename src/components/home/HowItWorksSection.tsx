import { motion } from "framer-motion";
import { UserPlus, Users, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up Free",
    description: "Create your academic profile in under 2 minutes.",
  },
  {
    icon: Users,
    title: "Find Collaborators",
    description: "AI matches you with researchers in your field worldwide.",
  },
  {
    icon: Trophy,
    title: "Publish & Earn",
    description: "Collaborate on papers, complete tasks, and earn real income.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to transform your research career.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border hidden md:block" />
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-px bg-primary origin-left hidden md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <div className="relative mb-5">
                  <motion.div
                    className="h-16 w-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center relative z-10 bg-background"
                    whileInView={{
                      borderColor: ["hsl(var(--primary) / 0.3)", "hsl(var(--primary) / 0.8)", "hsl(var(--primary) / 0.3)"],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    viewport={{ once: true }}
                  >
                    <step.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-20">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[220px]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
