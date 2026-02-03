import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Eye,
  EyeOff,
  Globe,
  Lock,
  Users,
  Download,
  Trash2,
  Shield,
  Database,
  Clock,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useDataProtection } from "@/hooks/useDataProtection";
import { cn } from "@/lib/utils";

export function PrivacyControlsPanel() {
  const {
    privacySettings,
    retentionPolicies,
    loading,
    updatePrivacySettings,
    updateConsent,
    exportUserData,
    requestDataDeletion,
    getAnonymizationStatus,
    DATA_CLASSIFICATIONS
  } = useDataProtection();

  const [exporting, setExporting] = useState(false);
  const anonymizationStatus = getAnonymizationStatus();

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportUserData();
      // In production, this would trigger a download
      console.log('Export ready:', result);
    } finally {
      setExporting(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>Control who can see your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visibility Level */}
          <div className="space-y-3">
            <Label>Profile Visibility Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['public', 'network', 'private'] as const).map((level) => (
                <Button
                  key={level}
                  variant={privacySettings.profile_visibility === level ? "default" : "outline"}
                  className="flex flex-col h-auto py-4"
                  onClick={() => updatePrivacySettings({ profile_visibility: level })}
                >
                  {getVisibilityIcon(level)}
                  <span className="mt-2 capitalize">{level}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {level === 'public' && 'Anyone can see'}
                    {level === 'network' && 'Connections only'}
                    {level === 'private' && 'Only you'}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Individual Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email on your profile
                </p>
              </div>
              <Switch
                checked={privacySettings.show_email}
                onCheckedChange={(checked) => updatePrivacySettings({ show_email: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Phone Number</Label>
                <p className="text-sm text-muted-foreground">
                  Display your phone number on your profile
                </p>
              </div>
              <Switch
                checked={privacySettings.show_phone}
                onCheckedChange={(checked) => updatePrivacySettings({ show_phone: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Location</Label>
                <p className="text-sm text-muted-foreground">
                  Display your general location
                </p>
              </div>
              <Switch
                checked={privacySettings.show_location}
                onCheckedChange={(checked) => updatePrivacySettings({ show_location: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Search Engine Indexing</Label>
                <p className="text-sm text-muted-foreground">
                  Let search engines find your profile
                </p>
              </div>
              <Switch
                checked={privacySettings.allow_indexing}
                onCheckedChange={(checked) => updatePrivacySettings({ allow_indexing: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consent Management
          </CardTitle>
          <CardDescription>Manage your data processing consents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Data Sharing</div>
              <div className="text-sm text-muted-foreground">
                Allow sharing data with third-party services for enhanced features
              </div>
            </div>
            <Switch
              checked={privacySettings.data_sharing_consent}
              onCheckedChange={(checked) => updateConsent('data_sharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-muted-foreground">
                Help improve the platform by sharing usage analytics
              </div>
            </div>
            <Switch
              checked={privacySettings.analytics_consent}
              onCheckedChange={(checked) => updateConsent('analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Marketing Communications</div>
              <div className="text-sm text-muted-foreground">
                Receive updates about new features and opportunities
              </div>
            </div>
            <Switch
              checked={privacySettings.marketing_consent}
              onCheckedChange={(checked) => updateConsent('marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Classification
          </CardTitle>
          <CardDescription>How your data is protected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {DATA_CLASSIFICATIONS.map((classification) => (
              <div 
                key={classification.level}
                className={cn(
                  "p-4 rounded-lg border",
                  classification.level === 'restricted' && "border-destructive/30 bg-destructive/5",
                  classification.level === 'confidential' && "border-amber-500/30 bg-amber-500/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={
                    classification.level === 'restricted' ? 'destructive' :
                    classification.level === 'confidential' ? 'outline' : 'secondary'
                  }>
                    {classification.label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {classification.encryption_required && (
                      <Lock className="h-4 w-4 text-emerald-500" />
                    )}
                    {classification.access_log_required && (
                      <Eye className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {classification.description}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Retention: {Math.floor(classification.retention_days / 365)} years
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Portability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Portability
          </CardTitle>
          <CardDescription>Export or delete your data (GDPR Rights)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Export Your Data</div>
                <div className="text-sm text-muted-foreground">
                  Download a copy of all your data in JSON format
                </div>
              </div>
            </div>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? 'Preparing...' : 'Export Data'}
            </Button>
          </div>

          {/* Delete Data */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="font-medium">Delete Your Data</div>
                <div className="text-sm text-muted-foreground">
                  Request permanent deletion of your account and data
                </div>
              </div>
            </div>
            <Button 
              variant="destructive"
              onClick={() => requestDataDeletion('User requested deletion')}
              disabled={!anonymizationStatus.can_anonymize}
            >
              Request Deletion
            </Button>
          </div>

          {/* Blockers Warning */}
          {anonymizationStatus.blockers.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium text-amber-600 dark:text-amber-400">
                  Deletion Blocked
                </div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {anonymizationStatus.blockers.map((blocker, i) => (
                    <li key={i}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
