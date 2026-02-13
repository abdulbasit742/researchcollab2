import { useEffect, useState, useRef } from "react";
import { useDemoWalkthrough } from "@/contexts/DemoWalkthroughContext";
import { X, ChevronLeft, ChevronRight, Play, Sparkles, BookOpen, Handshake, Brain, FileText, Shield, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  trust: { icon: Shield, color: "text-emerald-400" },
  research: { icon: BookOpen, color: "text-blue-400" },
  deals: { icon: Handshake, color: "text-amber-400" },
  ai: { icon: Brain, color: "text-violet-400" },
  productivity: { icon: FileText, color: "text-cyan-400" },
  governance: { icon: Shield, color: "text-rose-400" },
  social: { icon: Users, color: "text-pink-400" },
  institution: { icon: Building2, color: "text-orange-400" },
};

export const WalkthroughOverlay = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, endTour } = useDemoWalkthrough();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const el = document.querySelector(step.targetSelector!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    // Retry finding the element after navigation
    const timer = setTimeout(findTarget, 500);
    const interval = setInterval(findTarget, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isActive, step, currentStep]);

  if (!isActive) return null;

  const CategoryIcon = CATEGORY_CONFIG[step.category]?.icon || Sparkles;
  const categoryColor = CATEGORY_CONFIG[step.category]?.color || "text-primary";
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <div ref={overlayRef} className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto"
          onClick={endTour}
          style={{
            background: targetRect
              ? `radial-gradient(ellipse ${Math.max(targetRect.width + 40, 200)}px ${Math.max(targetRect.height + 40, 120)}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 0%, rgba(0,0,0,0.75) 100%)`
              : "rgba(0,0,0,0.75)",
          }}
        />

        {/* Spotlight ring */}
        {targetRect && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute rounded-xl border-2 border-primary/60 pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 30px hsl(var(--primary) / 0.15)",
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="absolute pointer-events-auto"
          style={{
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(480px, calc(100vw - 32px))",
          }}
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg bg-muted ${categoryColor}`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  </div>
                </div>
                <button
                  onClick={endTour}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Step dots */}
              <div className="flex items-center gap-1 mb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                        ? "w-2 bg-primary/40"
                        : "w-2 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="gap-1 text-muted-foreground"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>

                <Button
                  size="sm"
                  onClick={nextStep}
                  className="gap-1"
                >
                  {currentStep === steps.length - 1 ? "Finish Tour" : "Next"}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
