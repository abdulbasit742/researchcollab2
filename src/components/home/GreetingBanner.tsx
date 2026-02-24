import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";

function getGreeting(): { text: string; icon: React.ElementType; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "Good night", icon: Moon, emoji: "🌙" };
  if (hour < 12) return { text: "Good morning", icon: Sunrise, emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", icon: Sun, emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", icon: Sunset, emoji: "🌅" };
  return { text: "Good night", icon: Moon, emoji: "🌙" };
}

function getMotivational(): string {
  const msgs = [
    "Ready to build something great?",
    "Every milestone starts with a first step.",
    "Your trust score opens doors.",
    "Execution beats intention.",
    "Consistency compounds trust.",
    "Great outcomes start here.",
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

interface GreetingBannerProps {
  name?: string;
}

export function GreetingBanner({ name }: GreetingBannerProps) {
  const { text, icon: Icon, emoji } = useMemo(getGreeting, []);
  const motivational = useMemo(getMotivational, []);
  const firstName = name?.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
        {emoji}
      </div>
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          {text}{firstName ? `, ${firstName}` : ""}
          <Icon className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground">{motivational}</p>
      </div>
    </motion.div>
  );
}
