import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, Shield, TrendingUp, CheckCircle2, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const testimonials = [
  {
    quote: "The escrow system gave me confidence to hire a statistician I'd never met. Deliverables were exactly as promised.",
    name: "Dr. Amara Osei",
    role: "Postdoctoral Researcher",
    institution: "University of Cape Town",
    initials: "AO",
    escrowValue: 12500,
    trustScore: 94,
    dealsCompleted: 7,
    verifiedType: "Escrow Verified",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    quote: "I found a co-author for my thesis within a week. The trust scores helped me pick someone reliable.",
    name: "Lucas Chen",
    role: "PhD Student",
    institution: "ETH Zürich",
    initials: "LC",
    escrowValue: 8200,
    trustScore: 91,
    dealsCompleted: 4,
    verifiedType: "Identity Verified",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    quote: "The AI literature review tool saved me dozens of hours. It surfaces connections I would have missed.",
    name: "Prof. María Gutierrez",
    role: "Full Professor",
    institution: "Universidad de Buenos Aires",
    initials: "MG",
    escrowValue: 31000,
    trustScore: 97,
    dealsCompleted: 12,
    verifiedType: "Escrow Verified",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    quote: "As an independent researcher, this platform levels the playing field. I can collaborate with anyone, anywhere.",
    name: "Kenji Nakamura",
    role: "Independent Researcher",
    institution: "Freelance",
    initials: "KN",
    escrowValue: 5600,
    trustScore: 88,
    dealsCompleted: 3,
    verifiedType: "Identity Verified",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    quote: "We use it to connect our R&D team with academic experts. The accountability records are invaluable.",
    name: "Sarah Mitchell",
    role: "Industry Collaborator",
    institution: "BioTech Solutions Ltd",
    initials: "SM",
    escrowValue: 47000,
    trustScore: 96,
    dealsCompleted: 15,
    verifiedType: "Escrow Verified",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    quote: "I started using this as an undergrad research assistant. The guided workflows made my first collaboration seamless.",
    name: "Priya Sharma",
    role: "Undergraduate Student",
    institution: "IIT Delhi",
    initials: "PS",
    escrowValue: 2100,
    trustScore: 82,
    dealsCompleted: 2,
    verifiedType: "Identity Verified",
    gradient: "from-teal-400 to-emerald-500",
  },
];

const aggregateStats = [
  { value: 1247, label: "Verified Reviews", suffix: "" },
  { value: 0, label: "Fake Reviews Detected", suffix: "" },
  { value: 4.7, label: "in Reviewed Transactions", suffix: "M", prefix: "$" },
];

function formatEscrow(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value}`;
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
                {stat.prefix || ""}
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
