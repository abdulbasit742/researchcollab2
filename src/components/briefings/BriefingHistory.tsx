 import { useState } from "react";
 import { motion } from "framer-motion";
 import { 
   Calendar, 
   Briefcase, 
   Users, 
   Play, 
   Clock,
   ChevronRight,
   Volume2
 } from "lucide-react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { formatDistanceToNow, format } from "date-fns";
 
 interface HistoryItem {
   id: string;
   type: "week_review" | "deal_status" | "network_pulse";
   generatedAt: Date;
   duration: number; // seconds
   played: boolean;
 }
 
 const iconMap = {
   week_review: Calendar,
   deal_status: Briefcase,
   network_pulse: Users,
 };
 
 const labelMap = {
   week_review: "Week in Review",
   deal_status: "Deal Status",
   network_pulse: "Network Pulse",
 };
 
 // Mock history data
 const mockHistory: HistoryItem[] = [
   { id: "1", type: "week_review", generatedAt: new Date(), duration: 145, played: false },
   { id: "2", type: "deal_status", generatedAt: new Date(Date.now() - 86400000), duration: 98, played: true },
   { id: "3", type: "network_pulse", generatedAt: new Date(Date.now() - 86400000), duration: 120, played: true },
   { id: "4", type: "week_review", generatedAt: new Date(Date.now() - 172800000), duration: 156, played: true },
   { id: "5", type: "deal_status", generatedAt: new Date(Date.now() - 259200000), duration: 89, played: true },
   { id: "6", type: "week_review", generatedAt: new Date(Date.now() - 604800000), duration: 134, played: true },
 ];
 
 export function BriefingHistory() {
   const [history] = useState<HistoryItem[]>(mockHistory);
 
   const formatDuration = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, "0")}`;
   };
 
   // Group by date
   const grouped = history.reduce((acc, item) => {
     const date = format(item.generatedAt, "yyyy-MM-dd");
     if (!acc[date]) acc[date] = [];
     acc[date].push(item);
     return acc;
   }, {} as Record<string, HistoryItem[]>);
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="text-lg">Briefing History</CardTitle>
         <CardDescription>
           Access your previously generated audio briefings
         </CardDescription>
       </CardHeader>
       <CardContent>
         <ScrollArea className="h-[400px] pr-4">
           <div className="space-y-6">
             {Object.entries(grouped).map(([date, items]) => (
               <div key={date}>
                 <h4 className="text-sm font-medium text-muted-foreground mb-3">
                   {format(new Date(date), "EEEE, MMMM d, yyyy")}
                 </h4>
                 <div className="space-y-2">
                   {items.map((item, index) => {
                     const Icon = iconMap[item.type];
                     
                     return (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: index * 0.05 }}
                       >
                         <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                           <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                             <Icon className="h-4 w-4 text-muted-foreground" />
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                               <p className="font-medium text-sm">
                                 {labelMap[item.type]}
                               </p>
                               {!item.played && (
                                 <Badge variant="secondary" className="text-[10px] h-4">
                                   New
                                 </Badge>
                               )}
                             </div>
                             <p className="text-xs text-muted-foreground">
                               {format(item.generatedAt, "h:mm a")} • {formatDuration(item.duration)}
                             </p>
                           </div>
 
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Play className="h-4 w-4" />
                           </Button>
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
               </div>
             ))}
           </div>
         </ScrollArea>
 
         {history.length === 0 && (
           <div className="py-12 text-center">
             <Volume2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
             <h4 className="font-medium mb-1">No briefings yet</h4>
             <p className="text-sm text-muted-foreground">
               Generate your first briefing to start building history
             </p>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }