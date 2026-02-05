 import { useState } from "react";
 import { Bell, Filter, CheckCheck } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { ChangeNotice } from "./ChangeNotice";
 import { SystemChange, ChangeCategory, useChangeExplainer } from "@/hooks/useChangeExplainer";
 
 interface SystemChangeLogProps {
   maxHeight?: string;
 }
 
 export function SystemChangeLog({ maxHeight = "400px" }: SystemChangeLogProps) {
   const {
     changes,
     unacknowledgedCount,
     acknowledgeChange,
     acknowledgeAll,
     getRecentChanges,
   } = useChangeExplainer();
 
   const [categoryFilter, setCategoryFilter] = useState<ChangeCategory | "all">("all");
   const [showAcknowledged, setShowAcknowledged] = useState(false);
 
   const filteredChanges = changes.filter(change => {
     if (!showAcknowledged && change.acknowledged) return false;
     if (categoryFilter !== "all" && change.category !== categoryFilter) return false;
     return true;
   });
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Bell className="h-5 w-5 text-muted-foreground" />
           <h3 className="font-semibold">System Changes</h3>
           {unacknowledgedCount > 0 && (
             <Badge variant="destructive" className="h-5 px-1.5">
               {unacknowledgedCount}
             </Badge>
           )}
         </div>
         {unacknowledgedCount > 0 && (
           <Button variant="ghost" size="sm" onClick={acknowledgeAll}>
             <CheckCheck className="h-4 w-4 mr-1.5" />
             Dismiss all
           </Button>
         )}
       </div>
 
       <div className="flex items-center gap-2">
         <Select
           value={categoryFilter}
           onValueChange={(value) => setCategoryFilter(value as ChangeCategory | "all")}
         >
           <SelectTrigger className="w-[140px] h-8">
             <Filter className="h-3.5 w-3.5 mr-1.5" />
             <SelectValue placeholder="Filter" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All changes</SelectItem>
             <SelectItem value="trust">Trust</SelectItem>
             <SelectItem value="visibility">Visibility</SelectItem>
             <SelectItem value="access">Access</SelectItem>
             <SelectItem value="market">Market</SelectItem>
             <SelectItem value="policy">Policy</SelectItem>
             <SelectItem value="feature">Feature</SelectItem>
           </SelectContent>
         </Select>
 
         <Button
           variant={showAcknowledged ? "secondary" : "ghost"}
           size="sm"
           onClick={() => setShowAcknowledged(!showAcknowledged)}
         >
           {showAcknowledged ? "Hide dismissed" : "Show dismissed"}
         </Button>
       </div>
 
       <ScrollArea style={{ maxHeight }} className="pr-2">
         <div className="space-y-3">
           {filteredChanges.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
               <p className="text-sm">No system changes to display</p>
             </div>
           ) : (
             filteredChanges.map(change => (
               <ChangeNotice
                 key={change.id}
                 change={change}
                 onAcknowledge={acknowledgeChange}
                 compact={change.acknowledged}
               />
             ))
           )}
         </div>
       </ScrollArea>
     </div>
   );
 }