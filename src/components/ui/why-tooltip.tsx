import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WhyTooltipProps {
  why: string;
  problem?: string;
  ignoreConsequence?: string;
  className?: string;
}

/**
 * System 74: "Why This Exists" Explanation Layer
 * Provides inline clarity for every major surface
 */
export function WhyTooltip({ 
  why, 
  problem, 
  ignoreConsequence,
  className = "" 
}: WhyTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted transition-colors ${className}`}
            aria-label="Why this exists"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 space-y-2"
          sideOffset={5}
        >
          <div>
            <p className="text-xs font-medium text-foreground">Why am I seeing this?</p>
            <p className="text-xs text-muted-foreground">{why}</p>
          </div>
          {problem && (
            <div>
              <p className="text-xs font-medium text-foreground">What problem does this solve?</p>
              <p className="text-xs text-muted-foreground">{problem}</p>
            </div>
          )}
          {ignoreConsequence && (
            <div>
              <p className="text-xs font-medium text-foreground">What if I ignore this?</p>
              <p className="text-xs text-muted-foreground">{ignoreConsequence}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
