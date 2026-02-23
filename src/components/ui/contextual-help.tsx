import { ReactNode, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ContextualHelpProps {
  title: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function ContextualHelp({ title, children, side = "top", className }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
          aria-label={`Help: ${title}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72 p-0" align="center">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
          <span className="text-sm font-medium">{title}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-3 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface HelpTooltipProps {
  text: string;
  className?: string;
}

export function HelpTooltip({ text, className }: HelpTooltipProps) {
  return (
    <ContextualHelp title="Help" className={className}>
      {text}
    </ContextualHelp>
  );
}
