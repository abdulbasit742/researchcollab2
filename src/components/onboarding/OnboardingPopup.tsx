import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  DollarSign,
  Target,
  Handshake,
  X,
} from "lucide-react";

const options = [
  {
    id: "create-fyp",
    icon: Briefcase,
    title: "Create a FYP",
    description: "Submit your final year project and find sponsors",
    href: "/fyp/submit-problem",
    color: "from-primary to-primary/80",
  },
  {
    id: "fund-project",
    icon: DollarSign,
    title: "Fund a Project",
    description: "Sponsor student FYPs with escrow-backed capital",
    href: "/industry/fyp",
    color: "from-primary to-primary/80",
  },
  {
    id: "browse-opportunities",
    icon: Target,
    title: "Browse Opportunities",
    description: "Find projects matching your skills",
    href: "/offers",
    color: "from-primary to-primary/80",
  },
  {
    id: "track-deals",
    icon: Handshake,
    title: "Track My Deals",
    description: "Monitor milestones, escrow, and payments",
    href: "/deals",
    color: "from-primary to-primary/80",
  },
];

export function OnboardingPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the popup
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (href: string) => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
    navigate(href);
  };

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[94%] sm:max-w-[520px] max-h-[80vh] sm:max-h-[75vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header - compact */}
        <div className="relative gradient-primary px-4 py-3 sm:px-5 sm:py-4 text-primary-foreground flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-primary-foreground pr-6">
              Welcome to RCollab! 🎓
            </DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-sm text-primary-foreground/90">
            What would you like to do today?
          </p>
        </div>

        {/* Scrollable content */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          <div className="grid gap-2">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => handleSelect(option.href)}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-accent/50 transition-all text-left group"
              >
                <div
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br ${option.color} flex-shrink-0`}
                >
                  <option.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors truncate">
                    {option.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {option.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            You can explore all features from the navigation menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
