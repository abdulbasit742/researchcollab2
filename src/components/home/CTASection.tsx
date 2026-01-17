import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 md:py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-primary p-6 md:p-10 lg:p-16 text-center"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl" />

          <div className="relative">
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-foreground">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              Start your research journey today
            </div>

            <h2 className="text-xl xs:text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl xl:text-5xl">
              Ready to Transform Your Research?
            </h2>

            <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-sm md:text-lg text-primary-foreground/90 px-2">
              Join thousands of researchers, students, and experts already collaborating 
              and earning on our platform.
            </p>

            <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link to="/auth?tab=signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 md:h-14 text-sm md:text-base touch-manipulation"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link to="/tools" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-primary-foreground hover:bg-primary-foreground/10 h-12 md:h-14 text-sm md:text-base touch-manipulation"
                >
                  Explore AI Tools
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
