import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, DollarSign, Shield, Users, Save } from "lucide-react";
import { toast } from "sonner";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  icon: typeof Bell;
  enabled: boolean;
}

const defaultSettings: NotificationSetting[] = [
  { key: "deals", label: "Deal Updates", description: "Escrow, milestones, and payment notifications", icon: DollarSign, enabled: true },
  { key: "messages", label: "Messages", description: "New messages and conversation replies", icon: MessageSquare, enabled: true },
  { key: "trust", label: "Trust Score Changes", description: "When your trust score increases or decreases", icon: Shield, enabled: true },
  { key: "fyp", label: "FYP Activity", description: "Applications, submissions, and review updates", icon: Mail, enabled: true },
  { key: "social", label: "Social Activity", description: "Likes, comments, follows, and mentions", icon: Users, enabled: false },
  { key: "platform", label: "Platform Updates", description: "New features, maintenance, and announcements", icon: Bell, enabled: true },
];

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const toggleSetting = (key: string) => {
    setSettings(prev =>
      prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Notification preferences saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Choose what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <setting.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor={setting.key} className="font-medium cursor-pointer">
                  {setting.label}
                </Label>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            <Switch
              id={setting.key}
              checked={setting.enabled}
              onCheckedChange={() => toggleSetting(setting.key)}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
