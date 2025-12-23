import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { reason: "spam" | "harassment" | "fake" | "offensive" | "other"; description?: string }) => void;
  isSubmitting?: boolean;
  targetName?: string;
  isMessage?: boolean;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam", description: "Unwanted promotional content" },
  { value: "harassment", label: "Harassment", description: "Abusive or threatening behavior" },
  { value: "fake", label: "Fake Account", description: "Impersonation or fake identity" },
  { value: "offensive", label: "Offensive Content", description: "Inappropriate or offensive material" },
  { value: "other", label: "Other", description: "Another reason not listed" },
] as const;

export function ReportModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  targetName,
  isMessage,
}: ReportModalProps) {
  const [reason, setReason] = useState<typeof REPORT_REASONS[number]["value"]>("spam");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit({
      reason,
      description: description.trim() || undefined,
    });
    setReason("spam");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Report {isMessage ? "Message" : targetName || "User"}
          </DialogTitle>
          <DialogDescription>
            Help us understand what's wrong. Your report will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-start space-x-3 py-2">
                  <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                  <label htmlFor={r.value} className="flex-1 cursor-pointer">
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about this report..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
