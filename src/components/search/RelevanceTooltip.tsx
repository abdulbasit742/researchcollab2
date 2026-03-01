import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface RelevanceTooltipProps {
  reason: string;
}

export function RelevanceTooltip({ reason }: RelevanceTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-3 w-3" />
          Why this result?
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64 text-xs">
        <p className="font-medium mb-1">Relevance factors:</p>
        <p>{reason}</p>
      </TooltipContent>
    </Tooltip>
  );
}
