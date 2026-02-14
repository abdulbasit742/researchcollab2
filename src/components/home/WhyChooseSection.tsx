import { motion, useTransform } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

const comparisons = [
  {
    without: "Scattered emails, lost threads, no accountability",
    with: "Unified workspace with verified collaboration tracking",
  },
  {
    without: "No way to verify collaborator credibility",
    with: "Trust scores based on real outcomes and peer reviews",
  },
  {
    without: "Payments lost in bureaucratic delays",
    with: "Escrow-protected payments released on delivery",
  },
  {
    without: "Manual literature review takes weeks",
    with: "AI-powered summarization and analysis in minutes",
  },
  {
    without: "Limited to your university network",
    with: "Global researcher network across 50+ disciplines",
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
            See the difference a purpose-built platform makes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {/* Without column header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-destructive mb-4 px-3 py-1 rounded-full bg-destructive/10">
              <XCircle className="h-4 w-4" /> Without ResearchCollabPro
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center md:text-left hidden md:block"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-4 px-3 py-1 rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4" /> With ResearchCollabPro
            </span>
          </motion.div>

          {/* Comparison rows */}
          {comparisons.map((item, i) => (
            <>
              <motion.div
                key={`without-${i}`}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl bg-destructive/5 border border-destructive/15 flex items-start gap-3"
              >
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item.without}</p>
              </motion.div>
              <motion.div
                key={`with-${i}`}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.1 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground font-medium">{item.with}</p>
              </motion.div>
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
