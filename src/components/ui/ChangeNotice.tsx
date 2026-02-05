 import { useState } from "react";
 import { X, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { SystemChange, ChangeCategory } from "@/hooks/useChangeExplainer";
 
 interface ChangeNoticeProps {
   change: SystemChange;
   onAcknowledge: (id: string) => void;
   compact?: boolean;
 }
 
 const CATEGORY_COLORS: Record<ChangeCategory, string> = {
   trust: "bg-blue-500/10 text-blue-600 border-blue-500/20",
   visibility: "bg-purple-500/10 text-purple-600 border-purple-500/20",
   access: "bg-green-500/10 text-green-600 border-green-500/20",
   market: "bg-orange-500/10 text-orange-600 border-orange-500/20",
   policy: "bg-red-500/10 text-red-600 border-red-500/20",
   feature: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
 };
 
 const CATEGORY_LABELS: Record<ChangeCategory, string> = {
   trust: "Trust",
   visibility: "Visibility",
   access: "Access",
   market: "Market",
   policy: "Policy",
   feature: "Feature",
 };
 
 export function ChangeNotice({ change, onAcknowledge, compact = false }: ChangeNoticeProps) {
   const [isExpanded, setIsExpanded] = useState(false);
 
   if (compact) {
     return (
       <div className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card">
         <div className="flex items-center gap-2">
           <Badge variant="outline" className={CATEGORY_COLORS[change.category]}>
             {CATEGORY_LABELS[change.category]}
           </Badge>
           <span className="text-sm">{change.title}</span>
         </div>
         <Button
           variant="ghost"
           size="sm"
           onClick={() => onAcknowledge(change.id)}
           className="h-7 w-7 p-0"
         >
           <X className="h-4 w-4" />
         </Button>
       </div>
     );
   }
 
   return (
     <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
       <div className="rounded-lg border bg-card overflow-hidden">
         <div className="p-4">
           <div className="flex items-start justify-between gap-3">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <Badge variant="outline" className={CATEGORY_COLORS[change.category]}>
                   {CATEGORY_LABELS[change.category]}
                 </Badge>
                 <span className="text-xs text-muted-foreground">
                   {formatTimeAgo(change.timestamp)}
                 </span>
               </div>
               <h4 className="font-medium">{change.title}</h4>
               <p className="text-sm text-muted-foreground mt-0.5">{change.description}</p>
             </div>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onAcknowledge(change.id)}
               className="shrink-0"
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
 
           <CollapsibleTrigger asChild>
             <Button variant="ghost" size="sm" className="mt-2 w-full justify-center gap-1">
               {isExpanded ? (
                 <>
                   <ChevronUp className="h-4 w-4" />
                   Less details
                 </>
               ) : (
                 <>
                   <ChevronDown className="h-4 w-4" />
                   Why did this happen?
                 </>
               )}
             </Button>
           </CollapsibleTrigger>
         </div>
 
         <CollapsibleContent>
           <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/30">
             <div className="pt-3">
               <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                 Reason
               </h5>
               <p className="text-sm">{change.reason}</p>
             </div>
 
             <div>
               <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                 How this affects you
               </h5>
               <ul className="space-y-1">
                 {change.impact.map((impact, i) => (
                   <li key={i} className="text-sm flex items-start gap-2">
                     <span className="text-muted-foreground">•</span>
                     {impact}
                   </li>
                 ))}
               </ul>
             </div>
 
             <div className="flex gap-2 pt-1">
               {change.actionUrl && (
                 <Button variant="outline" size="sm" asChild>
                   <a href={change.actionUrl}>
                     <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                     Take action
                   </a>
                 </Button>
               )}
               {change.helpUrl && (
                 <Button variant="ghost" size="sm" asChild>
                   <a href={change.helpUrl} target="_blank" rel="noopener noreferrer">
                     <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                     Learn more
                   </a>
                 </Button>
               )}
             </div>
           </div>
         </CollapsibleContent>
       </div>
     </Collapsible>
   );
 }
 
 function formatTimeAgo(date: Date): string {
   const now = new Date();
   const diffMs = now.getTime() - date.getTime();
   const diffMins = Math.floor(diffMs / 60000);
 
   if (diffMins < 1) return "just now";
   if (diffMins < 60) return `${diffMins} min ago`;
   
   const diffHours = Math.floor(diffMins / 60);
   if (diffHours < 24) return `${diffHours} hours ago`;
   
   const diffDays = Math.floor(diffHours / 24);
   if (diffDays === 1) return "yesterday";
   if (diffDays < 7) return `${diffDays} days ago`;
   
   return date.toLocaleDateString();
 }