 import { Shield, ShieldCheck, ShieldAlert, Eye, FileText } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import { PowerLevel, PowerRequirements } from "@/hooks/usePowerDampening";
 
 interface PowerTransparencyBadgeProps {
   powerLevel: PowerLevel;
   requirements: PowerRequirements;
   recentActionsCount: number;
   pendingReviews: number;
   compact?: boolean;
 }
 
 const LEVEL_CONFIG: Record<PowerLevel, {
   icon: typeof Shield;
   color: string;
   label: string;
   description: string;
 }> = {
   low: {
     icon: Shield,
     color: "text-muted-foreground",
     label: "Standard",
     description: "Standard transparency requirements",
   },
   medium: {
     icon: ShieldCheck,
     color: "text-blue-500",
     label: "Enhanced",
     description: "Enhanced oversight on significant actions",
   },
   high: {
     icon: ShieldAlert,
     color: "text-amber-500",
     label: "Full Transparency",
     description: "All actions logged and reviewed",
   },
 };
 
 export function PowerTransparencyBadge({
   powerLevel,
   requirements,
   recentActionsCount,
   pendingReviews,
   compact = false,
 }: PowerTransparencyBadgeProps) {
   const config = LEVEL_CONFIG[powerLevel];
   const Icon = config.icon;
 
   if (compact) {
     return (
       <Tooltip>
         <TooltipTrigger asChild>
           <div className="flex items-center gap-1">
             <Icon className={`h-4 w-4 ${config.color}`} />
             {pendingReviews > 0 && (
               <span className="h-2 w-2 rounded-full bg-amber-500" />
             )}
           </div>
         </TooltipTrigger>
         <TooltipContent>
           <p className="font-medium">{config.label} Transparency</p>
           <p className="text-xs text-muted-foreground">{config.description}</p>
         </TooltipContent>
       </Tooltip>
     );
   }
 
   return (
     <Popover>
       <PopoverTrigger asChild>
         <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors">
           <Icon className={`h-4 w-4 ${config.color}`} />
           <span className="text-sm font-medium">{config.label}</span>
           {pendingReviews > 0 && (
             <Badge variant="destructive" className="h-5 px-1.5">
               {pendingReviews}
             </Badge>
           )}
         </button>
       </PopoverTrigger>
       <PopoverContent className="w-80" align="end">
         <div className="space-y-4">
           <div>
             <h4 className="font-semibold flex items-center gap-2">
               <Icon className={`h-5 w-5 ${config.color}`} />
               {config.label} Transparency
             </h4>
             <p className="text-sm text-muted-foreground mt-1">
               {config.description}
             </p>
           </div>
 
           <div className="space-y-2">
             <div className="flex items-center justify-between text-sm">
               <span className="flex items-center gap-1.5">
                 <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                 Transparency Level
               </span>
               <Badge variant="outline">{requirements.transparencyLevel}</Badge>
             </div>
 
             <div className="flex items-center justify-between text-sm">
               <span className="flex items-center gap-1.5">
                 <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                 Audit Frequency
               </span>
               <Badge variant="outline">{requirements.auditFrequency}</Badge>
             </div>
           </div>
 
           {requirements.oversightCheckpoints.length > 0 && (
             <div>
               <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                 Oversight Required For
               </h5>
               <div className="flex flex-wrap gap-1.5">
                 {requirements.oversightCheckpoints.map((checkpoint) => (
                   <Badge key={checkpoint} variant="secondary" className="text-xs">
                     {checkpoint.replace(/_/g, " ")}
                   </Badge>
                 ))}
               </div>
             </div>
           )}
 
           <div className="pt-2 border-t text-xs text-muted-foreground">
             <p>
               {recentActionsCount} actions this week
               {pendingReviews > 0 && ` • ${pendingReviews} pending review`}
             </p>
           </div>
 
           {requirements.explanationRequired && (
             <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
               <p className="text-xs text-amber-600">
                 High-impact actions require explanation
               </p>
             </div>
           )}
         </div>
       </PopoverContent>
     </Popover>
   );
 }