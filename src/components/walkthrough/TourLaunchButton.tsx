import { Play } from "lucide-react";
import { useDemoWalkthrough } from "@/contexts/DemoWalkthroughContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export const TourLaunchButton = () => {
  const { isActive, startTour } = useDemoWalkthrough();
  const isMobile = useIsMobile();

  if (isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
      className={`fixed right-6 z-50 ${isMobile ? "bottom-20" : "bottom-6"}`}
    >
      <Button
        onClick={startTour}
        size={isMobile ? "default" : "lg"}
        className="rounded-full shadow-lg gap-2 px-5 bg-primary hover:bg-primary/90 touch-manipulation"
      >
        <Play className="w-4 h-4" />
        {isMobile ? "Tour" : "Take a Tour"}
      </Button>
    </motion.div>
  );
};
