import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function StreakCounter() {
  // Streak from localStorage
  const { currentStreak, longestStreak } = useMemo(() => {
    const key = "rcollab_streak";
    const raw = localStorage.getItem(key);
    const today = new Date().toDateString();

    let data: { last: string; current: number; longest: number } = raw
      ? JSON.parse(raw)
      : { last: "", current: 0, longest: 0 };

    const lastDate = new Date(data.last);
    const diff = Math.floor((Date.now() - lastDate.getTime()) / 86400000);

    if (data.last !== today) {
      if (diff <= 1) {
        data.current += 1;
      } else {
        data.current = 1;
      }
      data.last = today;
      data.longest = Math.max(data.longest, data.current);
      localStorage.setItem(key, JSON.stringify(data));
    }

    return { currentStreak: data.current, longestStreak: data.longest };
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10"
            >
              <Flame className="h-5 w-5 text-orange-500" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{longestStreak}</p>
              <p className="text-[10px]">Best</p>
            </div>
          </div>
        </div>
        {/* Mini flame bar */}
        <div className="flex gap-0.5 mt-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < Math.min(currentStreak, 7)
                  ? "bg-orange-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
