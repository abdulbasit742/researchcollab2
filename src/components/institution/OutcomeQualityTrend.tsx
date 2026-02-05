 import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { OutcomeQualityTrend as TrendData } from "@/hooks/useInstitutionalFeedback";
 
 interface OutcomeQualityTrendProps {
   trends: TrendData[];
   title?: string;
 }
 
 export function OutcomeQualityTrend({ trends, title = "Outcome Quality Trends" }: OutcomeQualityTrendProps) {
   const latestTrend = trends[trends.length - 1];
   const previousTrend = trends[trends.length - 2];
 
   const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
     switch (trend) {
       case "improving":
         return <TrendingUp className="h-4 w-4 text-green-500" />;
       case "declining":
         return <TrendingDown className="h-4 w-4 text-red-500" />;
       default:
         return <Minus className="h-4 w-4 text-muted-foreground" />;
     }
   };
 
   const getTrendColor = (trend: "improving" | "declining" | "stable") => {
     switch (trend) {
       case "improving":
         return "text-green-500";
       case "declining":
         return "text-red-500";
       default:
         return "text-muted-foreground";
     }
   };
 
   if (!latestTrend) {
     return (
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">{title}</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-muted-foreground text-sm">No trend data available</p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg">{title}</CardTitle>
           <Badge variant={latestTrend.trend === "improving" ? "default" : latestTrend.trend === "declining" ? "destructive" : "secondary"}>
             {getTrendIcon(latestTrend.trend)}
             <span className="ml-1 capitalize">{latestTrend.trend}</span>
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Key Metrics */}
         <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground">Success Rate</span>
               <span className={`text-sm font-medium ${getTrendColor(latestTrend.trend)}`}>
                 {(latestTrend.successRate * 100).toFixed(1)}%
               </span>
             </div>
             <Progress value={latestTrend.successRate * 100} className="h-2" />
           </div>
 
           <div className="space-y-1">
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground">Dispute Rate</span>
               <span className={`text-sm font-medium ${latestTrend.disputeRate > 0.1 ? "text-red-500" : "text-green-500"}`}>
                 {(latestTrend.disputeRate * 100).toFixed(1)}%
               </span>
             </div>
             <Progress 
               value={latestTrend.disputeRate * 100} 
               className="h-2"
             />
           </div>
         </div>
 
         {/* Additional Metrics */}
         <div className="flex items-center justify-between py-2 border-t">
           <div className="flex items-center gap-2">
             <CheckCircle className="h-4 w-4 text-green-500" />
             <span className="text-sm">Avg Trust Impact</span>
           </div>
           <span className="font-medium">+{latestTrend.avgTrustImpact.toFixed(1)}</span>
         </div>
 
         <div className="flex items-center justify-between py-2 border-t">
           <div className="flex items-center gap-2">
             <TrendingUp className="h-4 w-4 text-blue-500" />
             <span className="text-sm">Avg Completion Time</span>
           </div>
           <span className="font-medium">{latestTrend.completionVelocityDays.toFixed(0)} days</span>
         </div>
 
         {/* Trend History */}
         <div className="pt-2 border-t">
           <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
             Recent Periods
           </h5>
           <div className="flex gap-2">
             {trends.slice(-4).map((trend, i) => (
               <div key={trend.period} className="flex-1 text-center">
                 <div className="text-xs text-muted-foreground mb-1">{trend.period}</div>
                 <div className="flex justify-center">
                   {getTrendIcon(trend.trend)}
                 </div>
               </div>
             ))}
           </div>
         </div>
 
         {/* Alert if declining */}
         {latestTrend.trend === "declining" && (
           <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
             <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
             <div>
               <p className="text-sm font-medium text-amber-600">Quality metrics declining</p>
               <p className="text-xs text-muted-foreground mt-0.5">
                 Consider reviewing onboarding standards or increasing trust thresholds
               </p>
             </div>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }