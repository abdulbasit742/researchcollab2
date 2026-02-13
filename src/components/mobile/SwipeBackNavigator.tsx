import { ReactNode, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeBackNavigatorProps {
  children: ReactNode;
}

const EDGE_THRESHOLD = 30; // px from left edge to start swipe
const SWIPE_TRIGGER = 100; // px needed to trigger back

export function SwipeBackNavigator({ children }: SwipeBackNavigatorProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const isSwipingRef = useRef(false);
  const startXRef = useRef(0);

  const indicatorOpacity = useTransform(x, [0, SWIPE_TRIGGER], [0, 0.6]);
  const indicatorScale = useTransform(x, [0, SWIPE_TRIGGER], [0.5, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX <= EDGE_THRESHOLD) {
      isSwipingRef.current = true;
      startXRef.current = touch.clientX;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    const touch = e.touches[0];
    const diff = Math.max(0, touch.clientX - startXRef.current);
    x.set(diff);
  }, [x]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const currentX = x.get();
    if (currentX >= SWIPE_TRIGGER) {
      navigate(-1);
    }
    animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
  }, [x, navigate]);

  if (!isMobile) return <>{children}</>;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Swipe edge indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity, scale: indicatorScale }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-20 rounded-r-full pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-r-full bg-gradient-to-r from-primary/40 to-transparent backdrop-blur-sm" />
      </motion.div>
      {children}
    </div>
  );
}
