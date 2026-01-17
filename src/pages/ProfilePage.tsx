import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Shield, Save, Loader2, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, userRole, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
    });

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-6 sm:py-8 px-4">
          <Skeleton className="h-8 w-48 mb-6 sm:mb-8" />
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  const roleColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    researcher: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl py-6 sm:py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Profile</h1>

          <div className="space-y-4 sm:space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-sm">
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg touch-manipulation">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm sm:text-base truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg touch-manipulation">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Role</p>
                    <Badge className={`mt-1 ${roleColors[userRole?.role || "student"]}`}>
                      {userRole?.role || "Student"}
                    </Badge>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg touch-manipulation">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium text-sm sm:text-base">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Edit Profile</CardTitle>
                <CardDescription className="text-sm">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Mobile: Stack vertically, Tablet+: Side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="h-11 sm:h-10 touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="h-11 sm:h-10 touch-manipulation"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full sm:w-auto h-11 sm:h-10 gap-2 touch-manipulation"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions - Mobile Optimized */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <button 
                    onClick={() => navigate("/verification")}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors touch-manipulation active:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Verify Account</p>
                        <p className="text-xs text-muted-foreground">Get verified status</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  
                  <button 
                    onClick={() => navigate("/wallet")}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors touch-manipulation active:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">My Wallet</p>
                        <p className="text-xs text-muted-foreground">Manage funds</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  
                  <button 
                    onClick={() => navigate("/subscriptions")}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors touch-manipulation active:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Subscriptions</p>
                        <p className="text-xs text-muted-foreground">View active plans</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
