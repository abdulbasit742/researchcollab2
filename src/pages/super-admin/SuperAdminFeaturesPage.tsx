import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect, useState } from "react";
import { ToggleLeft, AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SuperAdminFeaturesPage() {
  const { logAction } = useSuperAdminAudit();
  const { flags, loading: isLoading, toggleFlag } = useFeatureFlags();
  const [confirm, setConfirm] = useState<{ key: string; enabled: boolean } | null>(null);

  useEffect(() => { logAction("view_features"); }, []);

  const handleToggle = (key: string, currentEnabled: boolean) => {
    setConfirm({ key, enabled: !currentEnabled });
  };

  const confirmToggle = async () => {
    if (!confirm) return;
    await toggleFlag(confirm.key, confirm.enabled);
    logAction("toggle_feature", "feature_flag", confirm.key, { enabled: confirm.enabled });
    setConfirm(null);
  };

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global Feature Control</h1>
            <p className="text-sm text-muted-foreground">Toggle experimental features and platform layers</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-2">
              {flags.map((flag: any) => (
                <Card key={flag.feature_key}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <ToggleLeft className={`h-4 w-4 ${flag.enabled ? "text-success" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{flag.feature_key.replace(/_/g, " ")}</p>
                      {flag.description && <p className="text-[10px] text-muted-foreground">{flag.description}</p>}
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag.feature_key, flag.enabled)}
                      aria-label={`Toggle ${flag.feature_key}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Confirm Feature Toggle
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirm?.enabled
                  ? `Enable "${confirm?.key?.replace(/_/g, " ")}" globally? This will affect all tenants.`
                  : `Disable "${confirm?.key?.replace(/_/g, " ")}" globally? This will affect all tenants.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggle}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
