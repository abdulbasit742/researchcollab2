import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminSettingsPage() {
  const { settings, loading, setCommission, setMaintenanceMode, setAnnouncementBanner } = useAdminSettings();
  const { user } = useAuth();
  
  const [commission, setCommissionLocal] = useState(10);
  const [maintenance, setMaintenanceLocal] = useState(false);
  const [announcement, setAnnouncementLocal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setCommissionLocal(settings.commission_percentage);
      setMaintenanceLocal(settings.maintenance_mode);
      setAnnouncementLocal(settings.announcement_banner);
    }
  }, [loading, settings]);

  const handleSaveCommission = async () => {
    setSaving(true);
    const result = await setCommission(commission, user?.id);
    setSaving(false);
    if (result.success) {
      toast.success("Commission rate updated");
    } else {
      toast.error("Failed to update commission rate");
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !maintenance;
    setMaintenanceLocal(newValue);
    const result = await setMaintenanceMode(newValue, user?.id);
    if (result.success) {
      toast.success(newValue ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } else {
      toast.error("Failed to update maintenance mode");
      setMaintenanceLocal(!newValue);
    }
  };

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    const result = await setAnnouncementBanner(announcement, user?.id);
    setSaving(false);
    if (result.success) {
      toast.success("Announcement updated");
    } else {
      toast.error("Failed to update announcement");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure global platform settings
          </p>
        </div>

        {maintenance && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maintenance Mode Active</AlertTitle>
            <AlertDescription>
              The platform is currently in maintenance mode. Users may experience limited functionality.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Commission Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate</CardTitle>
              <CardDescription>
                Set the platform commission percentage for all transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Commission Percentage</Label>
                  <span className="text-2xl font-bold">{commission}%</span>
                </div>
                <Slider
                  value={[commission]}
                  onValueChange={([value]) => setCommissionLocal(value)}
                  min={0}
                  max={50}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  This percentage will be deducted from all completed transactions.
                </p>
              </div>
              <Button onClick={handleSaveCommission} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Commission Rate
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable maintenance mode to restrict platform access during updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, only admins can access the platform
                  </p>
                </div>
                <Switch
                  checked={maintenance}
                  onCheckedChange={handleToggleMaintenance}
                />
              </div>
            </CardContent>
          </Card>

          {/* Announcement Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Announcement Banner</CardTitle>
              <CardDescription>
                Display a banner message across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement">Banner Message</Label>
                <Textarea
                  id="announcement"
                  placeholder="Enter an announcement message (leave empty to hide)"
                  value={announcement}
                  onChange={(e) => setAnnouncementLocal(e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  This message will be displayed at the top of every page.
                </p>
              </div>
              <Button onClick={handleSaveAnnouncement} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Announcement
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Clear All Cache</p>
                  <p className="text-sm text-muted-foreground">
                    Force refresh all cached data across the platform
                  </p>
                </div>
                <Button variant="outline" onClick={() => toast.info("Cache cleared (placeholder)")}>
                  Clear Cache
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download a complete backup of all platform data
                  </p>
                </div>
                <Button variant="outline" onClick={() => toast.info("Export started (placeholder)")}>
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
