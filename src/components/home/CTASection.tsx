import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-center"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-medium text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Start your research journey today
            </div>

            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Ready to Transform Your Research?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
              Join thousands of researchers, students, and experts already collaborating 
              and earning on our platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?tab=signup">
                <Button
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/tools">
                <Button
                  size="xl"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Explore AI Tools
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-primary-foreground/70">
              No credit card required • Free to start • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
