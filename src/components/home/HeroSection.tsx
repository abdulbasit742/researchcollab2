import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, TrendingUp, Shield, Users, Zap, Lock } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import heroDarkMesh from "@/assets/hero-dark-mesh.jpg";

const heroStats = [
  { value: 342, suffix: "+", label: "Active FYPs", icon: TrendingUp },
  { value: 186, suffix: "+", label: "Funded Projects", icon: Shield },
  { value: 2.1, suffix: "M", label: "Escrow Locked", prefix: "PKR ", icon: Lock },
  { value: 94, suffix: "%", label: "Milestone Rate", icon: Zap },
  { value: 47, suffix: "", label: "Hired", icon: Users },
];

const loopSteps = [
  "Student creates FYP",
  "Sponsor funds project",
  "Escrow locks capital",
  "Milestones executed",
  "Trust updated",
  "Hired",
];

export function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loopSteps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img src={heroDarkMesh} alt="" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/70 to-[#030712]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,65%,45%)]/8 via-transparent to-[hsl(215,65%,45%)]/4" />
      </div>

      {/* Scan lines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,100,255,0.015)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Pulsing orb */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[700px] h-[700px] rounded-full blur-[180px]"
        style={{ background: "radial-gradient(circle, hsl(215 65% 45% / 0.15), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 py-24 md:py-32 lg:py-40 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Live core loop ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Core Loop</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-semibold text-white"
                >
                  <span className="text-white/50 mr-2">0{activeStep + 1}</span>
                  {loopSteps[activeStep]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Main headline — FYP-first */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-extrabold tracking-[-0.03em] leading-[0.9] text-white"
          >
            Your FYP.
            <br />
            <span className="bg-gradient-to-r from-[hsl(215,65%,55%)] via-[hsl(200,80%,60%)] to-[hsl(215,65%,55%)] bg-clip-text text-transparent">
              Funded. Executed.
            </span>
            <br />
            Career Launched.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 text-lg md:text-xl lg:text-2xl text-white/50 max-w-3xl leading-relaxed font-light"
          >
            Students create FYPs. Sponsors fund them with escrow-protected capital.
            Milestones execute. Trust compounds. The best students get hired.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/auth?tab=signup">
              <Button
                size="lg"
                className="h-16 px-10 text-base font-bold bg-white text-[#030712] hover:bg-white/90 shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] transition-all duration-500 rounded-xl"
              >
                Create Your FYP
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </Link>
            <Link to="/fyp">
              <Button
                size="lg"
                variant="ghost"
                className="h-16 px-10 text-base font-semibold border border-white/15 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all rounded-xl backdrop-blur-sm"
              >
                <Banknote className="h-5 w-5 mr-2" />
                Fund a Project
              </Button>
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 md:mt-28 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 border-t border-white/8 pt-10"
          >
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {stat.prefix || ""}
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} delay={i * 150} />
                </div>
                <div className="mt-1 text-xs text-white/35 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
