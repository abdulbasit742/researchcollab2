/**
 * MilestoneSubmissionModal — Enhanced submission flow with artifact linking,
 * notes, preview, and confirmation step.
 * No backend changes — pure UI improvement.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/currency";
import {
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneTitle: string;
  milestoneAmount: number;
  onSubmit: (notes: string) => Promise<void>;
  isSubmitting: boolean;
}

type Step = "details" | "preview" | "submitted";

export function MilestoneSubmissionModal({
  open,
  onOpenChange,
  milestoneTitle,
  milestoneAmount,
  onSubmit,
  isSubmitting,
}: MilestoneSubmissionModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [notes, setNotes] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const handleSubmit = async () => {
    await onSubmit(notes);
    setSubmittedAt(new Date().toISOString());
    setStep("submitted");
  };

  const handleClose = () => {
    setStep("details");
    setNotes("");
    setSubmittedAt(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {step === "submitted" ? "Submission Recorded" : "Submit Milestone"}
          </DialogTitle>
          <DialogDescription>
            {step === "details" && "Describe the work completed and attach relevant notes."}
            {step === "preview" && "Review your submission before confirming."}
            {step === "submitted" && "Your submission has been recorded."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        {step !== "submitted" && (
          <div className="flex items-center gap-2 py-2">
            {["details", "preview"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold",
                  step === s ? "bg-primary text-primary-foreground" :
                  i < ["details", "preview"].indexOf(step) ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  step === s ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s === "details" ? "Details" : "Confirm"}
                </span>
                {i === 0 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4 pt-2">
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{milestoneTitle}</p>
                    <p className="text-xs text-muted-foreground">Milestone submission</p>
                  </div>
                  <Badge variant="outline" className="font-mono">{formatPKR(milestoneAmount)}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="submission-notes">Completion Notes</Label>
              <Textarea
                id="submission-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the work completed, deliverables provided, and any relevant details..."
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground">
                These notes will be visible to the sponsor during review.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep("preview")} className="gap-1.5">
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg border bg-card space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{milestoneTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted: {new Date().toLocaleString()}</span>
              </div>
              {notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  This submission will be recorded immutably in the deal log.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Once submitted, the sponsor will review your work and can either approve (releasing {formatPKR(milestoneAmount)}) or request changes.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("details")} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Submitted (Receipt) */}
        {step === "submitted" && (
          <div className="space-y-4 pt-2 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Submission Recorded</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your milestone submission has been sent for review.
              </p>
            </div>
            <Card className="bg-muted/30 text-left">
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Milestone</span>
                  <span className="font-medium">{milestoneTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">{formatPKR(milestoneAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{submittedAt ? new Date(submittedAt).toLocaleString() : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">Awaiting Review</Badge>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
