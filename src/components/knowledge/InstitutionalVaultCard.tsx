import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  Lock,
  Users,
  FileText,
  Clock,
  Shield,
  Settings,
} from "lucide-react";
import type { InstitutionalVault, VaultType, VaultAccessLevel } from "@/types/knowledge-civilization";

interface InstitutionalVaultCardProps {
  vault: InstitutionalVault;
  onOpen?: () => void;
  onManage?: () => void;
  showManage?: boolean;
}

const vaultTypeConfig: Record<VaultType, { icon: typeof Archive; label: string; color: string }> = {
  knowledge: { icon: Archive, label: "Knowledge Vault", color: "text-blue-600 dark:text-blue-400" },
  research: { icon: FileText, label: "Research Archive", color: "text-green-600 dark:text-green-400" },
  policy: { icon: Shield, label: "Policy History", color: "text-purple-600 dark:text-purple-400" },
  decision: { icon: FileText, label: "Decision Records", color: "text-orange-600 dark:text-orange-400" },
  project: { icon: Archive, label: "Project Archive", color: "text-cyan-600 dark:text-cyan-400" },
  personnel: { icon: Users, label: "Personnel Records", color: "text-pink-600 dark:text-pink-400" },
};

const accessLevelConfig: Record<VaultAccessLevel, { label: string; color: string }> = {
  public: { label: "Public", color: "bg-green-500/20 text-green-700 dark:text-green-300" },
  institutional: { label: "Institutional", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  department: { label: "Department", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
  restricted: { label: "Restricted", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" },
  classified: { label: "Classified", color: "bg-red-500/20 text-red-700 dark:text-red-300" },
};

export function InstitutionalVaultCard({
  vault,
  onOpen,
  onManage,
  showManage = true,
}: InstitutionalVaultCardProps) {
  const typeConfig = vaultTypeConfig[vault.type];
  const accessConfig = accessLevelConfig[vault.accessLevel];
  const Icon = typeConfig.icon;

  const hasSuccessionPlan = vault.successors.length > 0;
  const recentActivityCount = vault.auditTrail.filter((a) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(a.performedAt) >= weekAgo;
  }).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted`}>
              <Icon className={`h-5 w-5 ${typeConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{vault.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
            </div>
          </div>
          <Badge className={accessConfig.color} variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            {accessConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {vault.description}
        </p>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="font-semibold">{vault.entryCount}</span>
            <p className="text-xs text-muted-foreground">Entries</p>
          </div>
          <div>
            <span className="font-semibold">{vault.editors.length}</span>
            <p className="text-xs text-muted-foreground">Editors</p>
          </div>
          <div>
            <span className="font-semibold">{recentActivityCount}</span>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {vault.versioningEnabled && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Versioned
            </Badge>
          )}
          {hasSuccessionPlan && (
            <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
              <Shield className="h-3 w-3 mr-1" />
              Succession Plan
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Retention Policy</span>
            <span className="font-medium capitalize">{vault.retentionPolicy}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          {showManage && onManage && (
            <Button size="sm" variant="outline" onClick={onManage}>
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
          {onOpen && (
            <Button size="sm" onClick={onOpen}>
              Open Vault
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Vault statistics summary
interface VaultStatsProps {
  stats: {
    totalEntries: number;
    byType: Record<string, number>;
    byContributor: Record<string, number>;
    recentActivity: number;
    auditTrailLength: number;
    hasSuccessionPlan: boolean;
  };
}

export function VaultStats({ stats }: VaultStatsProps) {
  const contributorCount = Object.keys(stats.byContributor).length;
  const typeCount = Object.keys(stats.byType).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.totalEntries}</p>
        <p className="text-xs text-muted-foreground">Total Entries</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-2xl font-bold">{typeCount}</p>
        <p className="text-xs text-muted-foreground">Object Types</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-2xl font-bold">{contributorCount}</p>
        <p className="text-xs text-muted-foreground">Contributors</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.auditTrailLength}</p>
        <p className="text-xs text-muted-foreground">Audit Events</p>
      </div>
    </div>
  );
}
