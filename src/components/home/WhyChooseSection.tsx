import { motion, useTransform } from "framer-motion";
import { ShieldCheck, Lock, Brain, Globe, BarChart3, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParallax } from "@/hooks/useParallax";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Verified Trust System",
    description: "Every collaborator is scored on real outcomes, not self-reported claims.",
  },
  {
    icon: Lock,
    title: "Escrow-Protected Payments",
    description: "Funds are locked until deliverables are verified.",
  },
  {
    icon: Brain,
    title: "AI-Powered Research Tools",
    description: "Built-in AI for summarization, analysis, and literature review.",
  },
  {
    icon: Globe,
    title: "Global Researcher Network",
    description: "Connect with academics across disciplines and borders.",
  },
  {
    icon: BarChart3,
    title: "No Vanity Metrics",
    description: "Every statistic reflects actual platform activity.",
  },
  {
    icon: Server,
    title: "Institutional-Grade Security",
    description: "Enterprise-level encryption and access controls.",
  },
];

export function WhyChooseSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.15 });
  const patternY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.04));

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y: patternY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,hsl(var(--primary)/0.1)_1px,transparent_0)] bg-[length:32px_32px]" />
      </motion.div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Why Choose{" "}
            <span className="text-primary">ResearchCollabPro</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for researchers who value integrity, security, and real results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="h-full group hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <reason.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
