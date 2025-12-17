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
  Wrench,
  Users,
  DollarSign,
  FileText,
  Search,
  X,
} from "lucide-react";

const options = [
  {
    id: "tools",
    icon: Wrench,
    title: "AI Research Tools",
    description: "Access powerful AI tools for your research",
    href: "/tools",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "collaborate",
    icon: Users,
    title: "Find Research Collaborators",
    description: "Connect with researchers worldwide",
    href: "/collaborations",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "earn",
    icon: DollarSign,
    title: "Earn by Working on Projects",
    description: "Get paid for your research skills",
    href: "/earn",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "project",
    icon: FileText,
    title: "Post a Project / FYP",
    description: "Find experts for your academic work",
    href: "/fyp-services",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "grants",
    icon: Search,
    title: "Explore Grants & Calls",
    description: "Discover funding opportunities",
    href: "/grants",
    color: "from-pink-500 to-rose-500",
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
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="relative gradient-primary p-6 text-primary-foreground">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-foreground">
              Welcome to ResearcherCollab Pro! 🎓
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-primary-foreground/90">
            What would you like to do today?
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(option.href)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 hover:border-primary/30 hover:bg-accent/50 transition-all text-left group"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.color}`}
                >
                  <option.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            You can explore all features from the navigation menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
