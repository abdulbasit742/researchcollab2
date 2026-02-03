import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Briefcase,
  Handshake,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const STEPS = [
  {
    icon: Shield,
    title: "Trust is earned, not claimed",
    description:
      "Your reputation is built from verified outcomes — projects completed, money handled, collaborators satisfied. Claims mean nothing here.",
  },
  {
    icon: Briefcase,
    title: "Opportunities match your proof",
    description:
      "The platform shows you opportunities that fit your verified skills and trust level. Higher trust = better opportunities.",
  },
  {
    icon: Handshake,
    title: "Deals are protected",
    description:
      "All transactions use escrow protection. Funds are held securely until work is verified and approved. Safe for everyone.",
  },
];

export function FirstTimeUserOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOverlay = localStorage.getItem("rcollab_first_time_seen");
    if (!hasSeenOverlay) {
      // Slight delay to let page load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("rcollab_first_time_seen", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 py-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleNext} className="w-full gap-2">
            {currentStep < STEPS.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Got it, let's go
              </>
            )}
          </Button>
          {currentStep < STEPS.length - 1 && (
            <Button variant="ghost" onClick={handleSkip} className="w-full text-sm">
              Skip introduction
            </Button>
          )}
        </div>

        {/* Trust Signal */}
        <div className="pt-4 border-t text-center">
          <Badge variant="outline" className="text-[10px]">
            No ads • No followers • No vanity metrics
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
