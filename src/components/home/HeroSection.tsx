import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Banknote, Brain, TrendingUp, Users, Zap } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import heroNetworkBg from "@/assets/hero-network-bg.jpg";

const heroStats = [
  { value: 12000, suffix: "+", label: "Verified Outcomes", icon: TrendingUp },
  { value: 5000, suffix: "+", label: "Professionals", icon: Users },
  { value: 2.4, suffix: "M", label: "Escrow Protected", prefix: "$", icon: Shield },
  { value: 98, suffix: "%", label: "Delivery Rate", icon: Zap },
];

const competitorKills = [
  { platform: "LinkedIn", weakness: "Self-reported claims", ours: "Verified proof-of-work" },
  { platform: "Upwork", weakness: "Race-to-the-bottom pricing", ours: "Trust-weighted value" },
  { platform: "Fiverr", weakness: "No accountability", ours: "Escrow-backed execution" },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [activeKill, setActiveKill] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKill((prev) => (prev + 1) % competitorKills.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Dark hero background with network visualization */}
      <div className="absolute inset-0">
        <img 
          src={heroNetworkBg} 
          alt="" 
          className="w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/95 via-foreground/85 to-foreground/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-2 text-xs md:text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              The Professional Operating System
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[0.95] text-background"
          >
            Stop Claiming.
            <br />
            <span className="text-gradient bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Start Proving.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 md:mt-8 text-base md:text-xl lg:text-2xl text-background/60 max-w-2xl leading-relaxed"
          >
            The world's first escrow-backed professional platform where trust is earned 
            through verified outcomes — not vanity metrics.
          </motion.p>

          {/* Competitor displacement ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-background/40">Replaces</span>
            <div className="flex items-center gap-3 h-8 overflow-hidden">
              {competitorKills.map((kill, i) => (
                <motion.div
                  key={kill.platform}
                  initial={false}
                  animate={{ 
                    opacity: i === activeKill ? 1 : 0.3,
                    scale: i === activeKill ? 1 : 0.95,
                  }}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    i === activeKill 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "bg-background/5 text-background/30 border border-background/10"
                  }`}
                >
                  <span className="line-through opacity-60">{kill.platform}</span>
                  {i === activeKill && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-primary font-semibold"
                    >
                      → {kill.ours}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link to="/auth?tab=signup">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-all duration-300"
              >
                Build Your Proof
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/earn">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-semibold border-background/20 text-background/80 hover:bg-background/10 hover:text-background hover:border-background/40 transition-all"
              >
                <Banknote className="h-5 w-5 mr-2" />
                Start Earning
              </Button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-background/10 pt-8 md:pt-10"
          >
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-primary/60" />
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-background tracking-tight">
                    {stat.prefix || ""}
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} delay={i * 200} />
                  </span>
                </div>
                <span className="text-xs md:text-sm text-background/40 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
