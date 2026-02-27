 import { MainLayout } from "@/components/layout/MainLayout";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { InfrastructureStabilityReport } from "@/components/admin/InfrastructureStabilityReport";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Button } from "@/components/ui/button";
 import { motion } from "framer-motion";
 import {
   Layers,
   Shield,
   Target,
   Sparkles,
   FileCode,
   Brain,
   Building2,
   Workflow,
   Clock,
 } from "lucide-react";
 
 const SYSTEMS = [
   {
     id: "upom",
     name: "Universal Object Model",
     icon: Layers,
     status: "active",
     description: "First-class objects for all professional entities",
     metrics: { objects: 12450, relationships: 34200, versions: 89000 },
   },
   {
     id: "trust",
     name: "Trust Computation Engine",
     icon: Shield,
     status: "active",
     description: "Dynamic trust as a computation system",
     metrics: { inputs: 156000, transformations: 4200, profiles: 8900 },
   },
   {
     id: "outcome",
     name: "Outcome Graph",
     icon: Target,
     status: "active",
     description: "People → Work → Results → Impact connections",
     metrics: { nodes: 45000, edges: 120000, verified: 32000 },
   },
   {
     id: "matching",
     name: "Continuous Matching",
     icon: Sparkles,
     status: "active",
     description: "Proactive opportunity discovery",
     metrics: { matches: 23000, broadcasts: 1200, predictions: 45000 },
   },
   {
     id: "deal",
     name: "Deal Execution Runtime",
     icon: FileCode,
     status: "active",
     description: "Deals as executable programs",
     metrics: { active: 890, completed: 12400, templates: 156 },
   },
   {
     id: "ai",
     name: "AI System Intelligence",
     icon: Brain,
     status: "active",
     description: "Advisory AI with human oversight",
     metrics: { recommendations: 89000, followed: 67000, overrides: 4500 },
   },
   {
     id: "institutional",
     name: "Institutional Layer",
     icon: Building2,
     status: "active",
     description: "Universities, governments, NGOs integration",
     metrics: { institutions: 450, policies: 1200, dashboards: 89 },
   },
   {
     id: "extensibility",
     name: "Extensibility System",
     icon: Workflow,
     status: "active",
     description: "API-first, event-driven, plugin-ready",
     metrics: { events: 2340000, plugins: 45, webhooks: 890 },
   },
   {
     id: "memory",
     name: "Long-Term Memory",
     icon: Clock,
     status: "active",
     description: "Career trajectories and knowledge preservation",
     metrics: { trajectories: 8900, skills: 45000, legacy: 12000 },
   },
 ];
 
 export default function InfrastructureDashboardPage() {
   return (
     <MainLayout>
       {/* Hero */}
       <div className="gradient-hero py-8 sm:py-12">
         <div className="container px-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <Badge variant="secondary" className="mb-3">
               <Layers className="h-3 w-3 mr-1" />
               Infrastructure Systems
             </Badge>
             <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
               Professional <span className="text-gradient">Infrastructure</span>
             </h1>
             <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
               The foundational systems powering professional civilization. Not features—infrastructure.
             </p>
           </motion.div>
         </div>
       </div>
 
       <div className="container px-4 py-6 sm:py-8">
         <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="stability">Stability Audit</TabsTrigger>
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="health">Health Monitor</TabsTrigger>
              <TabsTrigger value="events">Event Stream</TabsTrigger>
            </TabsList>

            <TabsContent value="stability">
              <InfrastructureStabilityReport />
            </TabsContent>
 
           <TabsContent value="overview" className="space-y-6">
             {/* System Grid */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {SYSTEMS.map((system, index) => (
                 <motion.div
                   key={system.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <Card className="h-full hover:shadow-md transition-shadow">
                     <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="p-2 rounded-lg bg-primary/10">
                             <system.icon className="h-4 w-4 text-primary" />
                           </div>
                           <CardTitle className="text-sm font-medium">
                             {system.name}
                           </CardTitle>
                         </div>
                         <Badge
                           variant={system.status === "active" ? "default" : "secondary"}
                           className="text-xs"
                         >
                           {system.status}
                         </Badge>
                       </div>
                       <CardDescription className="text-xs mt-1">
                         {system.description}
                       </CardDescription>
                     </CardHeader>
                     <CardContent className="pt-2">
                       <div className="grid grid-cols-3 gap-2 text-center">
                         {Object.entries(system.metrics).map(([key, value]) => (
                           <div key={key} className="space-y-1">
                             <p className="text-lg font-bold text-primary">
                               {value.toLocaleString()}
                             </p>
                             <p className="text-[10px] text-muted-foreground capitalize">
                               {key}
                             </p>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
             </div>
 
             {/* Architecture Diagram */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">System Architecture</CardTitle>
                 <CardDescription>
                   How infrastructure systems connect and compose
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="bg-muted/50 rounded-lg p-6 text-center">
                   <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                     {/* Layer 1: Foundation */}
                     <div className="col-span-3 p-3 bg-background rounded-lg border">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Foundation Layer</p>
                       <div className="flex justify-center gap-2">
                         <Badge variant="outline">UPOM</Badge>
                         <Badge variant="outline">Trust Engine</Badge>
                         <Badge variant="outline">Memory</Badge>
                       </div>
                     </div>
                     
                     {/* Layer 2: Intelligence */}
                     <div className="col-span-3 p-3 bg-background rounded-lg border">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Intelligence Layer</p>
                       <div className="flex justify-center gap-2">
                         <Badge variant="outline">Outcome Graph</Badge>
                         <Badge variant="outline">Matching Engine</Badge>
                         <Badge variant="outline">AI Advisory</Badge>
                       </div>
                     </div>
                     
                     {/* Layer 3: Execution */}
                     <div className="col-span-3 p-3 bg-background rounded-lg border">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Execution Layer</p>
                       <div className="flex justify-center gap-2">
                         <Badge variant="outline">Deal Runtime</Badge>
                         <Badge variant="outline">Workflows</Badge>
                         <Badge variant="outline">Events</Badge>
                       </div>
                     </div>
                     
                     {/* Layer 4: Integration */}
                     <div className="col-span-3 p-3 bg-background rounded-lg border">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Integration Layer</p>
                       <div className="flex justify-center gap-2">
                         <Badge variant="outline">Institutions</Badge>
                         <Badge variant="outline">APIs</Badge>
                         <Badge variant="outline">Plugins</Badge>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           <TabsContent value="health" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">System Health</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {SYSTEMS.map((system) => (
                   <div key={system.id} className="flex items-center gap-4">
                     <system.icon className="h-4 w-4 text-muted-foreground" />
                     <div className="flex-1">
                       <div className="flex justify-between mb-1">
                         <span className="text-sm font-medium">{system.name}</span>
                         <span className="text-sm text-green-600">99.9%</span>
                       </div>
                       <Progress value={99.9} className="h-2" />
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>
           </TabsContent>
 
           <TabsContent value="events" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Recent Platform Events</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   {[
                     { type: "deal.completed", time: "2m ago", details: "Deal #4521 completed successfully" },
                     { type: "outcome.verified", time: "5m ago", details: "Outcome verified by peer review" },
                     { type: "opportunity.matched", time: "8m ago", details: "High-fit match discovered (92%)" },
                     { type: "trust.updated", time: "12m ago", details: "Trust score recalculated for user" },
                     { type: "plugin.installed", time: "15m ago", details: "Analytics plugin activated" },
                   ].map((event, i) => (
                     <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                       <div className="flex items-center gap-3">
                         <Badge variant="outline" className="text-xs font-mono">
                           {event.type}
                         </Badge>
                         <span className="text-sm">{event.details}</span>
                       </div>
                       <span className="text-xs text-muted-foreground">{event.time}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </MainLayout>
   );
 }