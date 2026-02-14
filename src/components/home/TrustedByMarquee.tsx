import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const institutions = [
  "Massachusetts Institute of Technology",
  "Stanford University",
  "University of Oxford",
  "ETH Zurich",
  "University of Tokyo",
  "Tsinghua University",
  "University of Cambridge",
  "Harvard University",
  "National University of Singapore",
  "Imperial College London",
  "University of Melbourne",
  "Sorbonne University",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className={`flex shrink-0 gap-8 py-4 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {[...institutions, ...institutions].map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg bg-card/50 border border-border/30 text-sm text-muted-foreground font-medium"
          >
            <GraduationCap className="h-4 w-4 text-primary/60 shrink-0" />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrustedByMarquee() {
  return (
    <section className="py-10 md:py-14 overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6"
        >
          Trusted by researchers at
        </motion.p>
      </div>
      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  );
}
