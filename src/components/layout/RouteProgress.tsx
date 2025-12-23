import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function RouteProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start progress animation
    setIsVisible(true);
    setProgress(0);

    // Simulate progress
    progressRef.current = setTimeout(() => setProgress(30), 50);
    const midProgress = setTimeout(() => setProgress(60), 150);
    const almostDone = setTimeout(() => setProgress(80), 300);

    // Complete and hide
    timeoutRef.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(midProgress);
      clearTimeout(almostDone);
    };
  }, [location.pathname, location.search]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
      <div
        className={cn(
          "h-full bg-primary transition-all duration-200 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
