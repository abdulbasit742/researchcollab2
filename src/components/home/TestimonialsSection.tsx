import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, Shield, TrendingUp, CheckCircle2, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const testimonials = [
  {
    quote: "I submitted my FYP, got funded within a week, and the milestone-based escrow meant I got paid as I delivered. No chasing invoices.",
    name: "Ahmed Raza",
    role: "Final Year Student",
    institution: "LUMS",
    initials: "AR",
    escrowValue: 45000,
    trustScore: 91,
    dealsCompleted: 3,
    verifiedType: "Escrow Verified",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    quote: "We funded 5 student FYPs last quarter. The escrow system protects our investment and the milestone tracking keeps projects on schedule.",
    name: "Sarah Mitchell",
    role: "Industry Sponsor",
    institution: "TechVentures Ltd",
    initials: "SM",
    escrowValue: 250000,
    trustScore: 96,
    dealsCompleted: 12,
    verifiedType: "Escrow Verified",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    quote: "Two of the students we sponsored through RCollab now work for us full-time. Best hiring pipeline we've found.",
    name: "Dr. Farhan Ali",
    role: "R&D Director",
    institution: "DataSoft Pakistan",
    initials: "FA",
    escrowValue: 180000,
    trustScore: 94,
    dealsCompleted: 8,
    verifiedType: "Escrow Verified",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    quote: "The trust score system makes it easy to find reliable students. Every completed milestone builds their verified track record.",
    name: "Prof. Ayesha Khan",
    role: "FYP Supervisor",
    institution: "NUST",
    initials: "AK",
    escrowValue: 75000,
    trustScore: 97,
    dealsCompleted: 15,
    verifiedType: "Identity Verified",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    quote: "As a CS student, I built a real product for a real company. The escrow gave me security, and the completion record helped me land my first job.",
    name: "Zara Imran",
    role: "CS Graduate",
    institution: "FAST-NUCES",
    initials: "ZI",
    escrowValue: 35000,
    trustScore: 88,
    dealsCompleted: 2,
    verifiedType: "Identity Verified",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    quote: "Our department uses RCollab to connect students with industry. The impact dashboard shows real FYP-to-employment conversion rates.",
    name: "Dr. Hassan Malik",
    role: "Department Chair",
    institution: "UET Lahore",
    initials: "HM",
    escrowValue: 120000,
    trustScore: 95,
    dealsCompleted: 10,
    verifiedType: "Escrow Verified",
    gradient: "from-teal-400 to-emerald-500",
  },
];

const aggregateStats = [
  { value: 342, label: "Active FYPs", suffix: "+" },
  { value: 47, label: "Hiring Conversions", suffix: "" },
  { value: 2.1, label: "PKR Escrow Protected", suffix: "M" },
];

function formatEscrow(value: number) {
  if (value >= 1000) return `PKR ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `PKR ${value}`;
}

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(100,150,255,0.08)] p-5 sm:p-6 flex flex-col gap-4">
        {/* Header: Quote + Trust pill */}
        <div className="flex items-center justify-between">
          <Quote className="h-5 w-5 text-white/25" />
          <div className="flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-2.5 py-1">
            <TrendingUp className="h-3 w-3 text-white/50" />
            <span className="text-[11px] font-medium text-white/70">Trust: {t.trustScore}</span>
          </div>
        </div>

        {/* Quote */}
        <p className="text-sm text-white/70 leading-relaxed italic flex-1">
          "{t.quote}"
        </p>

        {/* Author row */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/8">
          <div className={`rounded-full p-[2px] bg-gradient-to-br ${t.gradient}`}>
            <Avatar className="h-9 w-9 border-2 border-[#0a1628]">
              <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
                {t.initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
              {t.name}
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            </p>
            <p className="text-xs text-white/40 truncate">
              {t.role} · {t.institution}
            </p>
          </div>
          <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5 shrink-0 hidden sm:inline-flex">
            {t.verifiedType}
          </span>
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1 rounded-full bg-white/8 border border-white/10 px-2.5 py-1">
            <Shield className="h-3 w-3 text-white/40" />
            <span className="text-[11px] text-white/60">{formatEscrow(t.escrowValue)} Protected</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/8 border border-white/10 px-2.5 py-1">
            <Briefcase className="h-3 w-3 text-white/40" />
            <span className="text-[11px] text-white/60">{t.dealsCompleted} Deals</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);
  const mobileTestimonials = showAll ? testimonials : testimonials.slice(0, 3);

  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#030712] via-[#0a1628] to-[#030712]">
      {/* Scan lines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,100,255,0.015)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Radial glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(215 65% 45% / 0.1), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,150,255,0.06)_1px,transparent_0)] bg-[length:32px_32px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Verified Outcomes.{" "}
            <span className="text-white/35">Not Testimonials.</span>
          </h2>
          <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Every review is linked to an escrow-verified transaction. No fake reviews. No bought endorsements.
          </p>
        </motion.div>

        {/* Aggregate stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12 sm:mb-16"
        >
          {aggregateStats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {"prefix" in stat ? (stat as any).prefix : ""}
                <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} delay={i * 200} />
              </div>
              <div className="text-[11px] sm:text-xs text-white/35 font-medium uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {mobileTestimonials.map((t, index) => (
            <TestimonialCard key={t.name} t={t} index={index} />
          ))}
          {!showAll && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="text-xs text-white/40 hover:text-white/60 hover:bg-white/5 touch-manipulation"
              >
                Show {testimonials.length - 3} more verified outcomes
              </Button>
            </div>
          )}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <TestimonialCard key={t.name} t={t} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
