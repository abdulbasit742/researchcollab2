import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Zap, Brain, Globe, Sparkles } from "lucide-react";

const proofPoints = [
  { icon: Shield, text: "Escrow-protected payments" },
  { icon: TrendingUp, text: "Trust score from day one" },
  { icon: Brain, text: "AI-matched opportunities" },
  { icon: Globe, text: "120+ countries connected" },
  { icon: Zap, text: "98% delivery rate" },
];

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Dark background */}
          <div className="absolute inset-0 bg-[#030712]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,65%,45%)]/15 via-transparent to-[hsl(200,80%,60%)]/10" />
          <div className="absolute inset-0 bg-[linear-gradient(hsl(215,65%,45%,0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(215,65%,45%,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/12 blur-[150px] rounded-full" />

          <div className="relative p-10 md:p-20 lg:p-28 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              The future of professional work
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[0.95]">
              Your Work Deserves
              <br />
              <span className="bg-gradient-to-r from-primary via-[hsl(200,80%,60%)] to-primary bg-clip-text text-transparent">
                More Than a Like.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-white/40 leading-relaxed">
              Build a professional identity backed by verified outcomes, protected by escrow, 
              and powered by AI that actually works for you. Not another social network.
            </p>

            {/* Proof points */}
            <div className="mt-10 flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              {proofPoints.map((point) => (
                <div key={point.text} className="flex items-center gap-2 text-xs md:text-sm text-white/35">
                  <point.icon className="h-4 w-4 text-primary/50" />
                  {point.text}
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?tab=signup">
                <Button
                  size="lg"
                  className="h-16 px-12 text-base font-bold bg-white text-[#030712] hover:bg-white/90 shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-all duration-500 rounded-xl"
                >
                  Get Started — It's Free
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-16 px-10 text-base text-white/50 hover:text-white hover:bg-white/5 transition-all rounded-xl"
                >
                  View Plans
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-white/25">
              No credit card required · Free tier forever · Full data ownership
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
