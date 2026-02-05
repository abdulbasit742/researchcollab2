 import { Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 import { LoopExecution, LoopType } from "@/hooks/useAutonomousValueLoops";
 
 interface LoopStatusIndicatorProps {
   executions: LoopExecution[];
   isRunning: boolean;
   compact?: boolean;
 }
 
 const LOOP_ICONS: Record<LoopType, string> = {
   deal_excellence: "💼",
   skill_growth: "📈",
   correction: "🔧",
   relationship_value: "🤝",
 };
 
 const LOOP_NAMES: Record<LoopType, string> = {
   deal_excellence: "Deal Excellence",
   skill_growth: "Skill Growth",
   correction: "Correction",
   relationship_value: "Relationship Value",
 };
 
 export function LoopStatusIndicator({ executions, isRunning, compact = false }: LoopStatusIndicatorProps) {
   const recentExecutions = executions.slice(-5);
   const runningCount = recentExecutions.filter(e => e.status === "running").length;
   const successCount = recentExecutions.filter(e => e.status === "completed").length;
   const failedCount = recentExecutions.filter(e => e.status === "failed").length;
 
   if (compact) {
     return (
       <Tooltip>
         <TooltipTrigger asChild>
           <div className="flex items-center gap-1.5">
             {isRunning ? (
               <Activity className="h-4 w-4 text-green-500 animate-pulse" />
             ) : (
               <Activity className="h-4 w-4 text-muted-foreground" />
             )}
             <span className="text-xs text-muted-foreground">
               {runningCount > 0 ? `${runningCount} running` : "Idle"}
             </span>
           </div>
         </TooltipTrigger>
         <TooltipContent>
           <div className="text-sm">
             <p className="font-medium">Autonomous Value Loops</p>
             <p className="text-muted-foreground">
               {successCount} completed, {failedCount} failed
             </p>
           </div>
         </TooltipContent>
       </Tooltip>
     );
   }
 
   return (
     <div className="space-y-3">
       <div className="flex items-center justify-between">
         <h4 className="text-sm font-medium">Autonomous Loops</h4>
         <Badge variant={isRunning ? "default" : "secondary"}>
           {isRunning ? "Active" : "Paused"}
         </Badge>
       </div>
 
       <div className="space-y-2">
         {recentExecutions.length === 0 ? (
           <p className="text-sm text-muted-foreground">No recent executions</p>
         ) : (
           recentExecutions.map(execution => (
             <div
               key={execution.id}
               className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50"
             >
               <div className="flex items-center gap-2">
                 <span>{LOOP_ICONS[execution.loopType]}</span>
                 <span className="text-sm">{LOOP_NAMES[execution.loopType]}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 {execution.status === "running" && (
                   <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                 )}
                 {execution.status === "completed" && (
                   <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                 )}
                 {execution.status === "failed" && (
                   <XCircle className="h-3.5 w-3.5 text-destructive" />
                 )}
                 <span className="text-xs text-muted-foreground">
                   {formatTime(execution.startedAt)}
                 </span>
               </div>
             </div>
           ))
         )}
       </div>
 
       {executions.length > 0 && (
         <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t">
           <span className="flex items-center gap-1">
             <CheckCircle className="h-3 w-3 text-green-500" />
             {successCount} completed
           </span>
           <span className="flex items-center gap-1">
             <XCircle className="h-3 w-3 text-destructive" />
             {failedCount} failed
           </span>
         </div>
       )}
     </div>
   );
 }
 
 function formatTime(date: Date): string {
   const now = new Date();
   const diffMs = now.getTime() - date.getTime();
   const diffMins = Math.floor(diffMs / 60000);
 
   if (diffMins < 1) return "just now";
   if (diffMins < 60) return `${diffMins}m ago`;
   
   const diffHours = Math.floor(diffMins / 60);
   if (diffHours < 24) return `${diffHours}h ago`;
   
   return date.toLocaleDateString();
 }