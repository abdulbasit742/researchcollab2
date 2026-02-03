import { useState } from "react";
import { useContextualReport, CONTEXTUAL_REPORT_TYPES, ContextualReportType } from "@/hooks/useSafetyQuality";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualReportModalProps {
  targetId: string;
  targetType: 'post' | 'comment' | 'opportunity' | 'user';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextualReportModal({
  targetId,
  targetType,
  open,
  onOpenChange,
}: ContextualReportModalProps) {
  const submitReport = useContextualReport();
  const [reportType, setReportType] = useState<ContextualReportType | "">("");
  const [explanation, setExplanation] = useState("");

  const handleSubmit = async () => {
    if (!reportType || !explanation.trim()) return;

    await submitReport.mutateAsync({
      targetId,
      targetType,
      reportType,
      explanation: explanation.trim(),
    });

    setReportType("");
    setExplanation("");
    onOpenChange(false);
  };

  const selectedConfig = reportType ? CONTEXTUAL_REPORT_TYPES[reportType] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Contextual Quality Report
          </DialogTitle>
          <DialogDescription>
            Help maintain professional standards. Your report will be weighted by your trust score.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label>What type of issue are you reporting?</Label>
            <RadioGroup 
              value={reportType} 
              onValueChange={(v) => setReportType(v as ContextualReportType)}
            >
              {(Object.entries(CONTEXTUAL_REPORT_TYPES) as [ContextualReportType, typeof CONTEXTUAL_REPORT_TYPES[ContextualReportType]][]).map(
                ([type, config]) => (
                  <div 
                    key={type} 
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                      reportType === type 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <RadioGroupItem value={type} id={type} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={type} className="font-medium cursor-pointer">
                          {config.label}
                        </Label>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            config.severity === 'high' && "border-destructive/50 text-destructive",
                            config.severity === 'medium' && "border-amber-500/50 text-amber-600",
                            config.severity === 'low' && "border-muted-foreground/50"
                          )}
                        >
                          {config.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </RadioGroup>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label>
              Detailed explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Provide specific details about why you're reporting this (minimum 20 characters)..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {explanation.length}/20 characters minimum
            </p>
          </div>

          {/* Trust Impact Warning */}
          {selectedConfig?.severity === 'high' && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  High-severity report
                </p>
                <p className="text-xs text-muted-foreground">
                  False reports may affect your own trust score. Please ensure accuracy.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reportType || explanation.length < 20 || submitReport.isPending}
          >
            {submitReport.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
