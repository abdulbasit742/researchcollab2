import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, TrendingUp, Zap } from "lucide-react";

const proofPoints = [
  { icon: Shield, text: "Escrow-protected payments" },
  { icon: TrendingUp, text: "Trust score from day one" },
  { icon: Zap, text: "AI-matched opportunities" },
];

export function CTASection() {
  return (
    <section className="py-16 md:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Dark premium background */}
          <div className="absolute inset-0 bg-foreground" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/15 blur-[120px] rounded-full" />

          <div className="relative p-8 md:p-16 lg:p-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs md:text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Join the professional revolution
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-background tracking-tight leading-tight">
              Your Work Deserves
              <br />
              <span className="text-primary">More Than a Like.</span>
            </h2>

            <p className="mx-auto mt-4 md:mt-6 max-w-2xl text-sm md:text-lg text-background/60 leading-relaxed">
              Build a professional identity backed by verified outcomes, protected by escrow, 
              and powered by AI that actually works for you.
            </p>

            {/* Proof points */}
            <div className="mt-8 flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              {proofPoints.map((point) => (
                <div key={point.text} className="flex items-center gap-2 text-xs md:text-sm text-background/50">
                  <point.icon className="h-4 w-4 text-primary/60" />
                  {point.text}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link to="/auth?tab=signup">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)] transition-all duration-300"
                >
                  Get Started — It's Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 px-8 text-base text-background/70 hover:text-background hover:bg-background/10 transition-all"
                >
                  View Plans
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-background/40">
              No credit card required • Free tier forever • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
