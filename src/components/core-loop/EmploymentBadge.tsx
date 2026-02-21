import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmploymentBadgeProps {
  companyName?: string;
  role?: string;
  verified?: boolean;
  className?: string;
}

export function EmploymentBadge({ companyName, role, verified = true, className }: EmploymentBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            "gap-1 text-xs font-semibold",
            verified
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              : "bg-muted text-muted-foreground",
            className
          )}
        >
          <Briefcase className="h-3 w-3" />
          Hired
          {verified && <CheckCircle2 className="h-3 w-3" />}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs font-medium">Verified Employment</p>
        {companyName && <p className="text-xs text-muted-foreground">Company: {companyName}</p>}
        {role && <p className="text-xs text-muted-foreground">Role: {role}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Converted from FYP completion — verified outcome
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
