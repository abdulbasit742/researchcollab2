import { Play } from "lucide-react";
import { useDemoWalkthrough } from "@/contexts/DemoWalkthroughContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const TourLaunchButton = () => {
  const { isActive, startTour } = useDemoWalkthrough();

  if (isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={startTour}
        size="lg"
        className="rounded-full shadow-lg gap-2 px-5 bg-primary hover:bg-primary/90"
      >
        <Play className="w-4 h-4" />
        Take a Tour
      </Button>
    </motion.div>
  );
};
