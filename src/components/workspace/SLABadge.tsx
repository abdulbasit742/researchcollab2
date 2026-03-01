import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

interface SLABadgeProps {
  projectId?: string;
  institutionId?: string;
}

export function SLABadge({ projectId, institutionId }: SLABadgeProps) {
  const { data: status } = useQuery({
    queryKey: ["sla-badge", projectId, institutionId],
    queryFn: async () => {
      if (!institutionId) return "on_track";

      // Check for active escalation flags on this project
      const { data: flags } = await (supabase as any)
        .from("sla_escalation_flags")
        .select("severity_level")
        .eq("institution_id", institutionId)
        .is("resolved_at", null)
        .limit(5);

      if (!flags?.length) {
        // Check recent breaches
        const { data: breaches } = await (supabase as any)
          .from("sla_breach_events")
          .select("breach_level")
          .eq("institution_id", institutionId)
          .eq("resolved", false)
          .limit(5);

        if (breaches?.some((b: any) => b.breach_level === "breach")) return "breach";
        if (breaches?.some((b: any) => b.breach_level === "warning")) return "warning";
        return "on_track";
      }

      const hasHigh = flags.some((f: any) => f.severity_level === "high");
      return hasHigh ? "breach" : "warning";
    },
    enabled: !!institutionId,
    staleTime: 60_000,
  });

  if (!status || status === "on_track") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className="text-[9px] gap-1">
              <ShieldCheck className="h-3 w-3" /> SLA On Track
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">All SLA targets are being met</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "warning") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="warning" className="text-[9px] gap-1">
              <AlertTriangle className="h-3 w-3" /> SLA Warning
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Some SLA targets approaching threshold</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="text-[9px] gap-1">
            <XCircle className="h-3 w-3" /> SLA Breach
          </Badge>
        </TooltipTrigger>
        <TooltipContent><p className="text-xs">SLA targets breached — review required</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
