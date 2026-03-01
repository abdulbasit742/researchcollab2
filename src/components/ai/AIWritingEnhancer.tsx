/**
 * AIWritingEnhancer — Inline writing enhancement button.
 * Advisory only. User must confirm before applying.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Check, AlertTriangle } from "lucide-react";
import { useAIWorkflow } from "@/hooks/useAIWorkflow";

interface AIWritingEnhancerProps {
  text: string;
  onApply: (enhancedText: string) => void;
  context?: string;
  buttonSize?: "sm" | "default" | "icon";
}

export function AIWritingEnhancer({
  text,
  onApply,
  context,
  buttonSize = "sm",
}: AIWritingEnhancerProps) {
  const [open, setOpen] = useState(false);
  const { generate, isLoading, result, reset } = useAIWorkflow<{
    enhanced_text: string;
    changes_made: string[];
    tone: string;
  }>();

  const handleEnhance = async () => {
    if (!text.trim()) return;
    setOpen(true);
    await generate("enhance-writing", text, context ? { context } : undefined);
  };

  const handleApply = () => {
    if (result?.result?.enhanced_text) {
      onApply(result.result.enhanced_text);
      setOpen(false);
      reset();
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={handleEnhance}
        disabled={!text.trim() || isLoading}
        className="gap-1.5 text-xs"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Enhance
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Writing Enhancement
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="h-3 w-3" />
              AI-generated — verify before applying.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : result?.result ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm whitespace-pre-wrap">{result.result.enhanced_text}</p>
              </div>
              {result.result.changes_made?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Changes made:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {result.result.changes_made.map((change, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-success mt-0.5 shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              size="sm"
              disabled={!result?.result?.enhanced_text}
            >
              Apply Enhancement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
