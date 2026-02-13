import { Link } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useParallax, useElementParallax } from "@/hooks/useParallax";

export function CTASection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.1 });
  const { ref, scale } = useElementParallax({ speed: 0.3 });
  
  // Background decorations parallax
  const decoration1Y = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.08));
  const decoration2Y = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.05));

  return (
    <section data-tour="cta" className="py-12 md:py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ scale: isDisabled ? 1 : scale }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-primary p-6 md:p-10 lg:p-16 text-center will-change-transform"
        >
          {/* Background decorations with parallax */}
          <motion.div 
            className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl"
            style={{ y: decoration1Y }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl"
            style={{ y: decoration2Y }}
          />

          <div className="relative">
            <motion.div 
              className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              Start your research journey today
            </motion.div>

            <h2 className="text-xl xs:text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl xl:text-5xl">
              Ready to Transform Your Research?
            </h2>

            <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-sm md:text-lg text-primary-foreground/90 px-2">
              Start collaborating with researchers, students, and professionals 
              on a platform built for real outcomes.
            </p>

            <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 md:h-14 text-sm md:text-base touch-manipulation"
                >
                  View Pricing Plans
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link to="/earn" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-primary-foreground hover:bg-primary-foreground/10 h-12 md:h-14 text-sm md:text-base touch-manipulation"
                >
                  Start Earning
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-4 md:mt-6 text-xs md:text-sm text-primary-foreground/70">
              No credit card required • Free to start • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
