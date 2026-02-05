 import { useState } from "react";
 import { 
   Bell, 
   Clock, 
   Volume2, 
   Calendar, 
   Briefcase, 
   Users,
   Mail,
   Smartphone
 } from "lucide-react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Separator } from "@/components/ui/separator";
 import { toast } from "sonner";
 
 interface NotificationSettings {
   weekReview: boolean;
   dealStatus: boolean;
   networkPulse: boolean;
   deliveryTime: string;
   emailNotifications: boolean;
   pushNotifications: boolean;
 }
 
 export function BriefingSettings() {
   const [settings, setSettings] = useState<NotificationSettings>({
     weekReview: true,
     dealStatus: true,
     networkPulse: false,
     deliveryTime: "09:00",
     emailNotifications: false,
     pushNotifications: true,
   });
 
   const handleToggle = (key: keyof NotificationSettings) => {
     setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
     toast.success("Settings updated");
   };
 
   const handleTimeChange = (value: string) => {
     setSettings((prev) => ({ ...prev, deliveryTime: value }));
     toast.success("Delivery time updated");
   };
 
   return (
     <div className="space-y-6">
       {/* Briefing Preferences */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Volume2 className="h-5 w-5" />
             Briefing Preferences
           </CardTitle>
           <CardDescription>
             Choose which briefings you want to receive
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Calendar className="h-4 w-4 text-primary" />
               </div>
               <div>
                 <Label htmlFor="week-review" className="font-medium">Week in Review</Label>
                 <p className="text-xs text-muted-foreground">
                   Weekly summary of your professional activity
                 </p>
               </div>
             </div>
             <Switch
               id="week-review"
               checked={settings.weekReview}
               onCheckedChange={() => handleToggle("weekReview")}
             />
           </div>
 
           <Separator />
 
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                 <Briefcase className="h-4 w-4 text-orange-500" />
               </div>
               <div>
                 <Label htmlFor="deal-status" className="font-medium">Deal Status</Label>
                 <p className="text-xs text-muted-foreground">
                   Updates on active deals and negotiations
                 </p>
               </div>
             </div>
             <Switch
               id="deal-status"
               checked={settings.dealStatus}
               onCheckedChange={() => handleToggle("dealStatus")}
             />
           </div>
 
           <Separator />
 
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                 <Users className="h-4 w-4 text-emerald-500" />
               </div>
               <div>
                 <Label htmlFor="network-pulse" className="font-medium">Network Pulse</Label>
                 <p className="text-xs text-muted-foreground">
                   Insights about your professional network
                 </p>
               </div>
             </div>
             <Switch
               id="network-pulse"
               checked={settings.networkPulse}
               onCheckedChange={() => handleToggle("networkPulse")}
             />
           </div>
         </CardContent>
       </Card>
 
       {/* Delivery Settings */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Clock className="h-5 w-5" />
             Delivery Settings
           </CardTitle>
           <CardDescription>
             Configure when and how you receive briefings
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <Label className="font-medium">Preferred Time</Label>
               <p className="text-xs text-muted-foreground">
                 When to generate your daily briefings
               </p>
             </div>
             <Select value={settings.deliveryTime} onValueChange={handleTimeChange}>
               <SelectTrigger className="w-32">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="07:00">7:00 AM</SelectItem>
                 <SelectItem value="08:00">8:00 AM</SelectItem>
                 <SelectItem value="09:00">9:00 AM</SelectItem>
                 <SelectItem value="10:00">10:00 AM</SelectItem>
                 <SelectItem value="12:00">12:00 PM</SelectItem>
                 <SelectItem value="17:00">5:00 PM</SelectItem>
                 <SelectItem value="18:00">6:00 PM</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </CardContent>
       </Card>
 
       {/* Notification Channels */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Bell className="h-5 w-5" />
             Notification Channels
           </CardTitle>
           <CardDescription>
             Choose how to be notified when briefings are ready
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                 <Smartphone className="h-4 w-4" />
               </div>
               <div>
                 <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                 <p className="text-xs text-muted-foreground">
                   Get notified in-app when briefings are ready
                 </p>
               </div>
             </div>
             <Switch
               id="push-notifications"
               checked={settings.pushNotifications}
               onCheckedChange={() => handleToggle("pushNotifications")}
             />
           </div>
 
           <Separator />
 
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                 <Mail className="h-4 w-4" />
               </div>
               <div>
                 <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                 <p className="text-xs text-muted-foreground">
                   Receive briefing links via email
                 </p>
               </div>
             </div>
             <Switch
               id="email-notifications"
               checked={settings.emailNotifications}
               onCheckedChange={() => handleToggle("emailNotifications")}
             />
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }