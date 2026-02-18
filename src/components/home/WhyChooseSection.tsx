import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, CheckCircle2 } from "lucide-react";

const outcomes = [
  {
    metric: "3.2x",
    label: "Higher delivery rates than Upwork",
    description: "Escrow + trust scoring eliminates low-quality bids and no-shows.",
  },
  {
    metric: "67%",
    label: "Faster talent matching",
    description: "AI matching with fit scoring replaces manual search and scroll.",
  },
  {
    metric: "0",
    label: "Payment disputes unresolved",
    description: "Digital arbitration court resolves every case with evidence-based verdicts.",
  },
  {
    metric: "6-12%",
    label: "Commission rates",
    description: "Trust-weighted fees that reward reliability. Top performers pay the least.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary">
            By The Numbers
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Results That <span className="text-primary">Speak For Themselves</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={outcome.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/50 bg-card/80 p-6 md:p-8 group hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2">
                {outcome.metric}
              </div>
              <h3 className="text-sm md:text-base font-bold mb-2">{outcome.label}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{outcome.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
