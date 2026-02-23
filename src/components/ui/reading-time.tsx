import { Clock } from "lucide-react";

interface ReadingTimeProps {
  text: string;
  wordsPerMinute?: number;
  className?: string;
}

export function ReadingTime({ text, wordsPerMinute = 200, className }: ReadingTimeProps) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className ?? ""}`}>
      <Clock className="h-3 w-3" />
      {minutes} min read
    </span>
  );
}
