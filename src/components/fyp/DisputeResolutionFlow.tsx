import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scale, Upload, CheckCircle, AlertTriangle, Clock, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const disputeStatuses = [
  { key: "initiated", label: "Dispute Initiated", icon: AlertTriangle, color: "text-warning" },
  { key: "evidence_submitted", label: "Evidence Submitted", icon: Upload, color: "text-primary" },
  { key: "faculty_mediation", label: "Faculty Mediation", icon: Shield, color: "text-primary" },
  { key: "admin_arbitration", label: "Admin Arbitration", icon: Scale, color: "text-critical" },
  { key: "resolved", label: "Resolved", icon: CheckCircle, color: "text-success" },
];

interface DisputeResolutionFlowProps {
  currentStatus?: string;
  fypTitle?: string;
  className?: string;
  onSubmit?: (data: { type: string; description: string }) => void;
}

export function DisputeResolutionFlow({
  currentStatus = "initiated",
  fypTitle = "FYP Project",
  className,
  onSubmit,
}: DisputeResolutionFlowProps) {
  const [disputeType, setDisputeType] = useState("");
  const [description, setDescription] = useState("");

  const currentIndex = disputeStatuses.findIndex((s) => s.key === currentStatus);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Dispute Resolution</CardTitle>
          </div>
          <Badge variant="outline">{fypTitle}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status Timeline */}
        <div className="flex items-center justify-between gap-1">
          {disputeStatuses.map((status, i) => {
            const Icon = status.icon;
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <div key={status.key} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "flex flex-col items-center gap-1 flex-shrink-0",
                )}>
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center border transition-colors",
                    isPast ? "bg-success border-success text-white" :
                    isActive ? "bg-primary border-primary text-primary-foreground" :
                    "bg-muted border-border text-muted-foreground"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={cn(
                    "text-[10px] text-center leading-tight max-w-[60px]",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {status.label}
                  </span>
                </div>
                {i < disputeStatuses.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 mx-0.5",
                    isPast ? "bg-success" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Form for new dispute */}
        {currentStatus === "initiated" && (
          <div className="space-y-3">
            <Select value={disputeType} onValueChange={setDisputeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milestone_rejection">Milestone Rejection</SelectItem>
                <SelectItem value="quality_issue">Quality Issue</SelectItem>
                <SelectItem value="deadline_breach">Deadline Breach</SelectItem>
                <SelectItem value="payment_dispute">Payment Dispute</SelectItem>
                <SelectItem value="ip_violation">IP Violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Describe the dispute in detail. Include specific milestones, dates, and evidence references."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">Upload evidence (screenshots, documents, communications)</p>
              <Button variant="outline" size="sm" className="mt-2">
                Attach Files
              </Button>
            </div>

            <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-md p-2.5">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                All dispute actions are timestamped and logged. No informal resolution is permitted. Escrow funds will be held until resolution.
              </p>
            </div>

            <Button
              onClick={() => onSubmit?.({ type: disputeType, description })}
              disabled={!disputeType || !description}
              className="w-full"
            >
              <Scale className="h-4 w-4 mr-1.5" />
              Submit Dispute
            </Button>
          </div>
        )}

        {currentStatus !== "initiated" && (
          <div className="rounded-lg bg-muted/50 p-4 text-center space-y-2">
            <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Dispute In Progress</p>
            <p className="text-xs text-muted-foreground">
              Current stage: <span className="font-medium text-foreground">{disputeStatuses[currentIndex]?.label}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              All actions and decisions are being recorded in the audit trail.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
