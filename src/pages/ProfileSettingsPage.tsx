 import { useState } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { Separator } from "@/components/ui/separator";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { AudioBioSettings } from "@/components/profile/AudioBioSettings";
 import {
 User,
 Volume2,
 Shield,
 Bell,
 Download,
 Lock,
 Mail,
 Eye,
 EyeOff,
 ArrowLeft,
 } from "lucide-react";
 import { Link } from "react-router-dom";
 import { toast } from "sonner";
 
 export default function ProfileSettingsPage() {
 const { user } = useAuth();
 const [profileVisibility, setProfileVisibility] = useState(true);
 const [showEmail, setShowEmail] = useState(false);
 const [activityStatus, setActivityStatus] = useState(true);
 
 const handleExportData = () => {
   toast.info("Data export will be sent to your email within 24 hours.");
 };
 
 return (
   <div className="min-h-screen bg-background flex flex-col">
     <Navbar />
     <main className="flex-1 container mx-auto px-4 py-8">
       <div className="max-w-3xl mx-auto">
         {/* Header */}
         <div className="flex items-center gap-4 mb-6">
           <Button variant="ghost" size="icon" asChild>
             <Link to="/profile">
               <ArrowLeft className="h-5 w-5" />
             </Link>
           </Button>
           <div>
             <h1 className="text-2xl font-bold">Profile Settings</h1>
             <p className="text-muted-foreground">Manage your account and preferences</p>
           </div>
         </div>
 
         <Tabs defaultValue="audio" className="space-y-6">
           <TabsList className="grid grid-cols-5 w-full">
             <TabsTrigger value="audio" className="gap-2">
               <Volume2 className="h-4 w-4" />
               <span className="hidden sm:inline">Audio</span>
             </TabsTrigger>
             <TabsTrigger value="account" className="gap-2">
               <User className="h-4 w-4" />
               <span className="hidden sm:inline">Account</span>
             </TabsTrigger>
             <TabsTrigger value="privacy" className="gap-2">
               <Shield className="h-4 w-4" />
               <span className="hidden sm:inline">Privacy</span>
             </TabsTrigger>
             <TabsTrigger value="notifications" className="gap-2">
               <Bell className="h-4 w-4" />
               <span className="hidden sm:inline">Alerts</span>
             </TabsTrigger>
             <TabsTrigger value="data" className="gap-2">
               <Download className="h-4 w-4" />
               <span className="hidden sm:inline">Data</span>
             </TabsTrigger>
           </TabsList>
 
           {/* Audio Introduction */}
           <TabsContent value="audio">
             <AudioBioSettings />
           </TabsContent>
 
           {/* Account Settings */}
           <TabsContent value="account">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <User className="h-5 w-5 text-primary" />
                   Account Settings
                 </CardTitle>
                 <CardDescription>
                   Manage your email and password
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                   <Label htmlFor="email">Email Address</Label>
                   <div className="flex gap-2">
                     <Input
                       id="email"
                       type="email"
                       value={user?.email || ""}
                       disabled
                       className="flex-1"
                     />
                     <Button variant="outline" size="icon">
                       <Mail className="h-4 w-4" />
                     </Button>
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Contact support to change your email address
                   </p>
                 </div>
 
                 <Separator />
 
                 <div className="space-y-2">
                   <Label>Password</Label>
                   <Button variant="outline" className="w-full justify-start gap-2">
                     <Lock className="h-4 w-4" />
                     Change Password
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Privacy Settings */}
           <TabsContent value="privacy">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Shield className="h-5 w-5 text-primary" />
                   Privacy Settings
                 </CardTitle>
                 <CardDescription>
                   Control who can see your information
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                     <Label>Profile Visibility</Label>
                     <p className="text-sm text-muted-foreground">
                       Allow others to view your profile
                     </p>
                   </div>
                   <Switch
                     checked={profileVisibility}
                     onCheckedChange={setProfileVisibility}
                   />
                 </div>
 
                 <Separator />
 
                 <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                     <Label>Show Email</Label>
                     <p className="text-sm text-muted-foreground">
                       Display email on your public profile
                     </p>
                   </div>
                   <Switch
                     checked={showEmail}
                     onCheckedChange={setShowEmail}
                   />
                 </div>
 
                 <Separator />
 
                 <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                     <Label>Activity Status</Label>
                     <p className="text-sm text-muted-foreground">
                       Show when you're online
                     </p>
                   </div>
                   <Switch
                     checked={activityStatus}
                     onCheckedChange={setActivityStatus}
                   />
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Notifications */}
           <TabsContent value="notifications">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Bell className="h-5 w-5 text-primary" />
                   Notification Preferences
                 </CardTitle>
                 <CardDescription>
                   Manage how you receive updates
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <Button variant="outline" className="w-full" asChild>
                   <Link to="/settings/notifications">
                     Open Notification Settings
                   </Link>
                 </Button>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Data Export */}
           <TabsContent value="data">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Download className="h-5 w-5 text-primary" />
                   Your Data
                 </CardTitle>
                 <CardDescription>
                   Export or download your data
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">
                   Request a copy of all your data including profile information,
                   messages, projects, and activity history.
                 </p>
                 <Button onClick={handleExportData} className="gap-2">
                   <Download className="h-4 w-4" />
                   Request Data Export
                 </Button>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </main>
     <Footer />
   </div>
 );
 }