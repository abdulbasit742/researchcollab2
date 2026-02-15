import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Mail,
  Smartphone,
  Moon,
  Clock,
  Shield,
  Briefcase,
  MessageSquare,
  Users,
  Calendar,
  AlertCircle,
  FileText,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGroupedNotificationPreferences,
  useGlobalNotificationSettings,
  useUpdateNotificationPreference,
  useUpdateGlobalSettings,
} from "@/hooks/useNotificationPreferences";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  projects: {
    icon: <Briefcase className="h-5 w-5" />,
    label: "Projects & Work",
    description: "Bids, offers, milestones, and payments",
  },
  messages: {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Messages",
    description: "Direct messages and reactions",
  },
  social: {
    icon: <Users className="h-5 w-5" />,
    label: "Network & Social",
    description: "Connections, follows, and mentions",
  },
  groups: {
    icon: <Users className="h-5 w-5" />,
    label: "Groups",
    description: "Group posts, invitations, and announcements",
  },
  events: {
    icon: <Calendar className="h-5 w-5" />,
    label: "Events",
    description: "Event invitations and reminders",
  },
  publications: {
    icon: <FileText className="h-5 w-5" />,
    label: "Publications",
    description: "Publication claims and verifications",
  },
  trust: {
    icon: <Shield className="h-5 w-5" />,
    label: "Trust & Verification",
    description: "Trust score changes and verifications",
  },
  admin: {
    icon: <AlertCircle className="h-5 w-5" />,
    label: "System & Admin",
    description: "Platform updates and notices",
  },
};

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { grouped, isLoading } = useGroupedNotificationPreferences();
  const { data: globalSettings, isLoading: globalLoading } = useGlobalNotificationSettings();
  const { mutate: updatePreference } = useUpdateNotificationPreference();
  const { mutate: updateGlobal } = useUpdateGlobalSettings();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["projects"]));

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="text-muted-foreground mt-2">
            Please sign in to manage your notification preferences.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Control how and when you receive notifications from RCollab.
            </p>
          </div>

          {/* Global Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Global Settings
              </CardTitle>
              <CardDescription>
                Master controls for all notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {globalLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  {/* Do Not Disturb */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Moon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="font-medium">Do Not Disturb</Label>
                        <p className="text-sm text-muted-foreground">
                          Pause all notifications temporarily
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={globalSettings?.do_not_disturb ?? false}
                      onCheckedChange={(checked) =>
                        updateGlobal({ do_not_disturb: checked })
                      }
                    />
                  </div>

                  {/* Email Digest */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="font-medium">Email Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          How often to receive email summaries
                        </p>
                      </div>
                    </div>
                    <Select
                      value={globalSettings?.email_digest_frequency ?? "daily"}
                      onValueChange={(value) =>
                        updateGlobal({ email_digest_frequency: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Channel Legend */}
          <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              <span>In-App</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" />
              <span>Push</span>
            </div>
          </div>

          {/* Notification Categories */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, prefs]) => {
                const config = categoryConfig[category] || {
                  icon: <Bell className="h-5 w-5" />,
                  label: category.charAt(0).toUpperCase() + category.slice(1),
                  description: "",
                };
                const isExpanded = expandedCategories.has(category);

                return (
                  <Card key={category}>
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {config.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.label}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {prefs.length} types
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="divide-y">
                          {prefs.map((pref) => (
                            <div
                              key={pref.type.id}
                              className="py-4 flex items-center justify-between gap-4"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {formatTypeKey(pref.type.key)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {pref.type.body_template?.replace(/\{\{.*?\}\}/g, "[...]") || ""}
                                </p>
                                {pref.type.importance === "critical" && (
                                  <Badge variant="destructive" className="mt-1 text-[10px]">
                                    Critical
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                {/* In-App */}
                                <div className="flex flex-col items-center gap-1">
                                  <Switch
                                    checked={pref.inApp}
                                    onCheckedChange={(checked) =>
                                      updatePreference({
                                        notificationTypeId: pref.type.id,
                                        inApp: checked,
                                      })
                                    }
                                    disabled={pref.type.importance === "critical"}
                                  />
                                  <Bell className="h-3 w-3 text-muted-foreground" />
                                </div>

                                {/* Email */}
                                <div className="flex flex-col items-center gap-1">
                                  <Switch
                                    checked={pref.email}
                                    onCheckedChange={(checked) =>
                                      updatePreference({
                                        notificationTypeId: pref.type.id,
                                        email: checked,
                                      })
                                    }
                                  />
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                </div>

                                {/* Push */}
                                <div className="flex flex-col items-center gap-1">
                                  <Switch
                                    checked={pref.push}
                                    onCheckedChange={(checked) =>
                                      updatePreference({
                                        notificationTypeId: pref.type.id,
                                        push: checked,
                                      })
                                    }
                                  />
                                  <Smartphone className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-8 text-center">
            <Button variant="outline" className="text-muted-foreground">
              Reset to Defaults
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

function formatTypeKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
