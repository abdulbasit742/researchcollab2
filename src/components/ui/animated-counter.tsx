import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000, delay = 0, className = "" }: AnimatedCounterProps) {
  const { count, ref } = useAnimatedCounter({ end, duration, delay });

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
