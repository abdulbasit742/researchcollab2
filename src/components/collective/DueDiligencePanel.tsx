import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DueDiligenceRequest, DueDiligenceContribution } from "@/hooks/useCollectiveIntelligence";

interface DueDiligencePanelProps {
  request: DueDiligenceRequest;
  contributions?: DueDiligenceContribution[];
  onContribute?: (contribution: {
    check_type: string;
    findings: string;
    evidence_urls?: string[];
    risk_level: "low" | "medium" | "high" | "critical";
    confidence_score?: number;
  }) => void;
  className?: string;
}

const riskColors = {
  low: { text: "text-emerald-500", bg: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700" },
  medium: { text: "text-amber-500", bg: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700" },
  high: { text: "text-orange-500", bg: "bg-orange-500", badge: "bg-orange-500/10 text-orange-700" },
  critical: { text: "text-red-500", bg: "bg-red-500", badge: "bg-red-500/10 text-red-700" },
};

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
  in_progress: { icon: Search, color: "text-blue-500", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-emerald-500", label: "Completed" },
  flagged: { icon: AlertTriangle, color: "text-red-500", label: "Flagged" },
};

export function DueDiligencePanel({ 
  request, 
  contributions = [],
  onContribute,
  className 
}: DueDiligencePanelProps) {
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [checkType, setCheckType] = useState("");
  const [findings, setFindings] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState("");
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high" | "critical">("low");
  const [confidenceScore, setConfidenceScore] = useState(80);
  const [submitting, setSubmitting] = useState(false);

  const statusInfo = statusConfig[request.status];
  const StatusIcon = statusInfo.icon;
  const deadline = request.deadline ? new Date(request.deadline) : null;
  const isExpired = deadline && deadline < new Date();

  // Calculate completion
  const completedChecks = request.required_checks.filter(
    check => contributions.some(c => c.check_type === check.type)
  ).length;
  const completionPercentage = request.required_checks.length > 0 
    ? (completedChecks / request.required_checks.length) * 100 
    : 0;

  // Calculate overall risk
  const riskCounts = contributions.reduce((acc, c) => {
    acc[c.risk_level] = (acc[c.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = async () => {
    if (!onContribute || !checkType || !findings) return;
    setSubmitting(true);
    await onContribute({
      check_type: checkType,
      findings,
      evidence_urls: evidenceUrls ? evidenceUrls.split("\n").filter(Boolean) : undefined,
      risk_level: riskLevel,
      confidence_score: confidenceScore,
    });
    setSubmitting(false);
    setShowContributeForm(false);
    setCheckType("");
    setFindings("");
    setEvidenceUrls("");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", statusInfo.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {request.target_type}
              </Badge>
            </div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription className="mt-1">
              {request.scope}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
          {request.reward_amount > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{request.reward_amount} reward</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{contributions.length}/{request.max_investigators} investigators</span>
          </div>
          {deadline && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={isExpired ? "text-red-500" : ""}>
                {isExpired 
                  ? `Expired ${formatDistanceToNow(deadline)} ago`
                  : `Due ${formatDistanceToNow(deadline, { addSuffix: true })}`
                }
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span>Investigation Progress</span>
            <span className="font-medium">{completedChecks}/{request.required_checks.length} checks</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Risk summary */}
        {contributions.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Risk Distribution:</span>
            {Object.entries(riskCounts).map(([level, count]) => (
              <Badge key={level} className={riskColors[level as keyof typeof riskColors].badge}>
                {level}: {count}
              </Badge>
            ))}
          </div>
        )}

        {/* Required checks */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="checks">
            <AccordionTrigger className="text-sm">
              Required Checks ({request.required_checks.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {request.required_checks.map((check, index) => {
                  const contribution = contributions.find(c => c.check_type === check.type);
                  const isComplete = !!contribution;

                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        isComplete && "bg-emerald-500/5 border-emerald-500/20"
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      ) : check.required ? (
                        <Shield className="h-4 w-4 text-amber-500 mt-0.5" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{check.type}</span>
                          {check.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {check.description}
                        </p>
                        {contribution && (
                          <Badge 
                            className={cn(
                              "mt-2 text-xs",
                              riskColors[contribution.risk_level].badge
                            )}
                          >
                            {contribution.risk_level} risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contributions */}
          {contributions.length > 0 && (
            <AccordionItem value="contributions">
              <AccordionTrigger className="text-sm">
                Contributions ({contributions.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {contributions.map((contribution) => (
                    <div 
                      key={contribution.id}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {contribution.check_type}
                          </Badge>
                          <Badge 
                          className={cn(
                            "text-xs",
                            riskColors[contribution.risk_level].badge
                          )}
                        >
                          {contribution.risk_level}
                        </Badge>
                        {contribution.confidence_score && (
                          <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {contribution.confidence_score && (
                          <span className="text-xs text-muted-foreground">
                            {contribution.confidence_score}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{contribution.findings}</p>
                      {contribution.evidence_urls && contribution.evidence_urls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contribution.evidence_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Evidence {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Contribute button or form */}
        {onContribute && request.status !== "completed" && (
          <>
            {!showContributeForm ? (
              <Button
                onClick={() => setShowContributeForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Contribute Findings
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-4 border-t"
              >
                <div>
                  <Label className="text-sm mb-2 block">Check Type</Label>
                  <Select value={checkType} onValueChange={setCheckType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select check type" />
                    </SelectTrigger>
                    <SelectContent>
                      {request.required_checks.map((check) => (
                        <SelectItem key={check.type} value={check.type}>
                          {check.type}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Findings</Label>
                  <Textarea
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Describe your findings in detail..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Risk Level</Label>
                  <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as typeof riskLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="critical">Critical Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Evidence URLs (one per line)</Label>
                  <Textarea
                    value={evidenceUrls}
                    onChange={(e) => setEvidenceUrls(e.target.value)}
                    placeholder="https://example.com/evidence1&#10;https://example.com/evidence2"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowContributeForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!checkType || !findings || submitting}
                    className="flex-1"
                  >
                    {submitting ? "Submitting..." : "Submit Contribution"}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Status message */}
        {request.status === "completed" && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Investigation Complete</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This investigation has been completed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
