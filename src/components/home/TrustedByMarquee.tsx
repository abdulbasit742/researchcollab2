import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const institutions = [
  { name: "MIT", domain: "mit.edu" },
  { name: "Stanford", domain: "stanford.edu" },
  { name: "Oxford", domain: "ox.ac.uk" },
  { name: "ETH Zurich", domain: "ethz.ch" },
  { name: "University of Tokyo", domain: "u-tokyo.ac.jp" },
  { name: "Tsinghua University", domain: "tsinghua.edu.cn" },
  { name: "Cambridge", domain: "cam.ac.uk" },
  { name: "Harvard", domain: "harvard.edu" },
  { name: "NUS", domain: "nus.edu.sg" },
  { name: "Imperial College", domain: "imperial.ac.uk" },
  { name: "University of Melbourne", domain: "unimelb.edu.au" },
  { name: "Sorbonne", domain: "sorbonne-universite.fr" },
];

function InstitutionLogo({ name, domain }: { name: string; domain: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <GraduationCap className="h-5 w-5 text-white/40 shrink-0" />;
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      className="h-5 w-5 rounded-full ring-1 ring-white/10 object-contain bg-white/10 shrink-0"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...institutions, ...institutions];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className={`flex shrink-0 gap-6 py-3 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {items.map((inst, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 whitespace-nowrap px-5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-white/15 text-sm text-white/60 font-medium transition-colors duration-300"
          >
            <InstitutionLogo name={inst.name} domain={inst.domain} />
            {inst.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrustedByMarquee() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-b from-[#030712] via-[#060e1f] to-[#030712]">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-white/40">
            Trusted by researchers at
          </p>
        </motion.div>
      </div>
      <MarqueeRow />
      <div className="mt-3" />
      <MarqueeRow reverse />

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
