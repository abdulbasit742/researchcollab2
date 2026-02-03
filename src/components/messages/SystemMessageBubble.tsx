import { Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SystemMessageBubbleProps {
  body: string;
  createdAt: string;
}

export function SystemMessageBubble({ body, createdAt }: SystemMessageBubbleProps) {
  return (
    <div className="flex justify-center my-4">
      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-muted/60 text-muted-foreground text-sm",
        "border border-border/50"
      )}>
        <Info className="h-4 w-4 shrink-0" />
        <span>{body}</span>
      </div>
    </div>
  );
}
