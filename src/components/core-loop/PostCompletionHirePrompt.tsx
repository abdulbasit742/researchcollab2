import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Briefcase, Award, Calendar, ArrowRight, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PostCompletionHirePromptProps {
  studentName: string;
  studentTrustScore: number;
  projectTitle: string;
  completionDate: string;
  onHire?: () => void;
  onScheduleInterview?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PostCompletionHirePrompt({
  studentName,
  studentTrustScore,
  projectTitle,
  completionDate,
  onHire,
  onScheduleInterview,
  onDismiss,
  className,
}: PostCompletionHirePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <Card className={cn(
          "border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden",
          className
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Ready to Hire?
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{studentName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px]">
                    Trust: {studentTrustScore}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Project Complete
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground">Completed Project</p>
              <p className="text-sm font-semibold mt-0.5">{projectTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Completed on {new Date(completionDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={onHire} className="flex-1 gap-2">
                <Briefcase className="h-4 w-4" />
                Make Offer
              </Button>
              <Button variant="outline" onClick={onScheduleInterview} className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              This hire will be tracked as a verified employment conversion
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
