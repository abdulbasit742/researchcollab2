 import { useState } from "react";
 import { motion } from "framer-motion";
 import { 
   Volume2, 
   Calendar, 
   Briefcase, 
   Users, 
   Clock, 
   RefreshCw,
   Bell,
   Settings,
   Play,
   History
 } from "lucide-react";
 import { MainLayout } from "@/components/layout/MainLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Switch } from "@/components/ui/switch";
 import { Label } from "@/components/ui/label";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { AudioBriefingPlayer } from "@/components/briefings/AudioBriefingPlayer";
 import { BriefingHistory } from "@/components/briefings/BriefingHistory";
 import { BriefingSettings } from "@/components/briefings/BriefingSettings";
 import { useBriefingTypes, type BriefingType } from "@/hooks/useAudioBriefings";
 
 const iconMap = {
   calendar: Calendar,
   briefcase: Briefcase,
   users: Users,
 };
 
 export default function BriefingsPage() {
   const briefingTypes = useBriefingTypes();
   const [selectedType, setSelectedType] = useState<BriefingType>("week_review");
 
   return (
     <MainLayout>
       <div className="container max-w-5xl py-6 px-4">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           {/* Header */}
           <div className="flex items-center gap-4 mb-6">
             <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
               <Volume2 className="h-6 w-6 text-primary" />
             </div>
             <div>
               <h1 className="text-2xl font-bold">Audio Briefings</h1>
               <p className="text-muted-foreground">
                 Personalized AI-generated audio summaries for your professional life
               </p>
             </div>
           </div>
 
           {/* Main Content */}
           <Tabs defaultValue="player" className="space-y-6">
             <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="player" className="gap-2">
                 <Play className="h-4 w-4" />
                 Player
               </TabsTrigger>
               <TabsTrigger value="history" className="gap-2">
                 <History className="h-4 w-4" />
                 History
               </TabsTrigger>
               <TabsTrigger value="settings" className="gap-2">
                 <Settings className="h-4 w-4" />
                 Settings
               </TabsTrigger>
             </TabsList>
 
             <TabsContent value="player" className="space-y-6">
               <div className="grid gap-6 lg:grid-cols-3">
                 {/* Briefing Type Cards */}
                 <div className="lg:col-span-1 space-y-4">
                   <h3 className="text-sm font-medium text-muted-foreground">
                     Available Briefings
                   </h3>
                   {briefingTypes.map((type) => {
                     const Icon = iconMap[type.icon as keyof typeof iconMap];
                     const isSelected = selectedType === type.type;
 
                     return (
                       <motion.div
                         key={type.type}
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                       >
                         <Card
                           className={`cursor-pointer transition-all ${
                             isSelected
                               ? "ring-2 ring-primary border-primary"
                               : "hover:border-primary/50"
                           }`}
                           onClick={() => setSelectedType(type.type)}
                         >
                           <CardContent className="p-4">
                             <div className="flex items-start gap-3">
                               <div
                                 className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                   isSelected
                                     ? "bg-primary text-primary-foreground"
                                     : "bg-muted"
                                 }`}
                               >
                                 <Icon className="h-5 w-5" />
                               </div>
                               <div className="flex-1">
                                 <h4 className="font-medium text-sm">{type.title}</h4>
                                 <p className="text-xs text-muted-foreground mt-1">
                                   {type.description}
                                 </p>
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       </motion.div>
                     );
                   })}
                 </div>
 
                 {/* Main Player */}
                 <div className="lg:col-span-2">
                   <AudioBriefingPlayer className="h-full" />
                 </div>
               </div>
 
               {/* Features Info */}
               <Card className="bg-muted/30 border-dashed">
                 <CardContent className="p-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                     <div>
                       <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                       <p className="text-sm font-medium">2-3 Minutes</p>
                       <p className="text-xs text-muted-foreground">Average briefing length</p>
                     </div>
                     <div>
                       <RefreshCw className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                       <p className="text-sm font-medium">Updated Daily</p>
                       <p className="text-xs text-muted-foreground">Fresh insights every day</p>
                     </div>
                     <div>
                       <Bell className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                       <p className="text-sm font-medium">Smart Alerts</p>
                       <p className="text-xs text-muted-foreground">Get notified when ready</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
 
             <TabsContent value="history">
               <BriefingHistory />
             </TabsContent>
 
             <TabsContent value="settings">
               <BriefingSettings />
             </TabsContent>
           </Tabs>
         </motion.div>
       </div>
     </MainLayout>
   );
 }