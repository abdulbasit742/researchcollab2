import { useState, useEffect, useCallback } from "react";

interface UseAppLoadingReturn {
  isLoading: boolean;
  progress: number;
  isComplete: boolean;
}

const MIN_DISPLAY_TIME = 1800; // Minimum time to show loading screen (ms)
const PROGRESS_INTERVAL = 50; // How often to update progress (ms)

export function useAppLoading(): UseAppLoadingReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const completeLoading = useCallback(() => {
    setIsComplete(true);
    // Small delay before hiding to allow fade-out animation
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    let lastTime = Date.now();

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const deltaTime = now - lastTime;
      lastTime = now;

      // Calculate progress based on elapsed time
      // Fast at first, then slow down as it approaches 100%
      setProgress((prev) => {
        if (prev >= 100) return 100;
        
        // Ease-out progress calculation
        const targetProgress = Math.min(100, (elapsed / MIN_DISPLAY_TIME) * 100);
        const remaining = targetProgress - prev;
        const increment = remaining * (deltaTime / 200); // Smooth easing
        
        return Math.min(100, prev + Math.max(0.5, increment));
      });

      // Check if minimum time has passed and progress is complete
      if (elapsed >= MIN_DISPLAY_TIME) {
        setProgress(100);
        completeLoading();
        return;
      }

      animationFrame = requestAnimationFrame(updateProgress);
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [startTime, completeLoading]);

  return { isLoading, progress, isComplete };
}
