import { useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";
import { useRef, RefObject } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseParallaxOptions {
  /** Speed multiplier - lower values = slower movement (more distant feel) */
  speed?: number;
  /** Whether to disable on mobile for performance */
  disableOnMobile?: boolean;
  /** Custom scroll container ref (defaults to window) */
  containerRef?: RefObject<HTMLElement>;
}

interface UseElementParallaxOptions extends UseParallaxOptions {
  /** Offset range for when the effect starts/ends relative to element visibility */
  offset?: ["start" | "center" | "end", "start" | "center" | "end"];
}

/**
 * Hook for creating parallax effects based on window scroll position
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, disableOnMobile = true } = options;
  
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollY } = useScroll();
  
  // Disable parallax if user prefers reduced motion or on mobile (when specified)
  const isDisabled = prefersReducedMotion || (disableOnMobile && isMobile);
  
  // Transform scroll position to parallax offset
  const y = useTransform(scrollY, (value) => {
    if (isDisabled) return 0;
    return value * speed;
  });
  
  // Inverted parallax (moves up as user scrolls down)
  const yInverted = useTransform(scrollY, (value) => {
    if (isDisabled) return 0;
    return -value * speed;
  });
  
  // Scale effect based on scroll
  const scale = useTransform(scrollY, [0, 500], [1, isDisabled ? 1 : 1 + speed * 0.1]);
  
  // Opacity fade based on scroll
  const opacity = useTransform(scrollY, [0, 300], [1, isDisabled ? 1 : Math.max(0.3, 1 - speed)]);
  
  // Rotation effect
  const rotate = useTransform(scrollY, (value) => {
    if (isDisabled) return 0;
    return value * speed * 0.02;
  });

  return {
    y,
    yInverted,
    scale,
    opacity,
    rotate,
    scrollY,
    isDisabled,
  };
}

/**
 * Hook for element-specific parallax based on element's position in viewport
 */
export function useElementParallax(options: UseElementParallaxOptions = {}) {
  const { speed = 0.5, disableOnMobile = true, offset = ["start", "end"] } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  
  const isDisabled = prefersReducedMotion || (disableOnMobile && isMobile);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${offset[0]} end`, `${offset[1]} start`],
  });
  
  // Transform based on element visibility
  const y = useTransform(scrollYProgress, [0, 1], isDisabled ? [0, 0] : [50 * speed, -50 * speed]);
  const ySubtle = useTransform(scrollYProgress, [0, 1], isDisabled ? [0, 0] : [20 * speed, -20 * speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], isDisabled ? [1, 1, 1] : [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);
  
  return {
    ref,
    y,
    ySubtle,
    scale,
    opacity,
    scrollYProgress,
    isDisabled,
  };
}

/**
 * Create multiple parallax values with different speeds for layered effects
 */
export function useLayeredParallax(speeds: number[], disableOnMobile = true) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  const isDisabled = prefersReducedMotion || (disableOnMobile && isMobile);
  
  const layers = speeds.map((speed) => ({
    y: useTransform(scrollY, (value) => (isDisabled ? 0 : value * speed)),
    yInverted: useTransform(scrollY, (value) => (isDisabled ? 0 : -value * speed)),
  }));
  
  return { layers, isDisabled, scrollY };
}

export type { UseParallaxOptions, UseElementParallaxOptions };
