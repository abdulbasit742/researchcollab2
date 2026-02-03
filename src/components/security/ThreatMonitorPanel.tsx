import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  ShieldOff,
  AlertTriangle,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  Globe,
  Zap
} from "lucide-react";
import { useThreatDetection } from "@/hooks/useThreatDetection";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function ThreatMonitorPanel() {
  const {
    threats,
    blockedEntities,
    securityRules,
    rateLimits,
    loading,
    getThreatStats,
    mitigateThreat,
    markFalsePositive,
    toggleSecurityRule,
    getActiveBlocks
  } = useThreatDetection();

  const stats = getThreatStats();
  const activeBlocks = getActiveBlocks();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'outline';
      case 'medium': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Threat Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Threats</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {stats.by_severity.critical}
                </div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <ShieldOff className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-500">
                  {stats.by_status.mitigated}
                </div>
                <div className="text-sm text-muted-foreground">Mitigated</div>
              </div>
              <Shield className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{activeBlocks.length}</div>
                <div className="text-sm text-muted-foreground">Active Blocks</div>
              </div>
              <Ban className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Threats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Threats
            </CardTitle>
            <CardDescription>Real-time threat monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {threats.filter(t => t.status === 'active').length > 0 ? (
              threats.filter(t => t.status === 'active').map((threat) => (
                <div 
                  key={threat.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    threat.severity === 'critical' && "border-destructive/50 bg-destructive/5",
                    threat.severity === 'high' && "border-orange-500/50 bg-orange-500/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn("h-4 w-4", getSeverityColor(threat.severity))} />
                      <span className="font-medium capitalize">
                        {threat.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge variant={getSeverityBadge(threat.severity) as any}>
                      {threat.severity}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                      <span>IP: {threat.source_ip}</span>
                      <span>Target: {threat.target_resource}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>Confidence: {threat.confidence}%</span>
                      <Progress value={threat.confidence} className="h-1 w-20" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => mitigateThreat(threat.id, 'blocked')}
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Block
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => markFalsePositive(threat.id)}
                    >
                      False Positive
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                <div className="font-medium">No Active Threats</div>
                <div className="text-sm text-muted-foreground">
                  All systems secure
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Security Rules
            </CardTitle>
            <CardDescription>Automated protection rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityRules.map((rule) => (
              <div 
                key={rule.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  !rule.is_enabled && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    rule.is_enabled ? "bg-emerald-500/10" : "bg-muted"
                  )}>
                    {rule.is_enabled ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.description}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSecurityRule(rule.id)}
                >
                  {rule.is_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Blocked Entities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Blocked Entities
          </CardTitle>
          <CardDescription>Currently blocked IPs, user agents, and regions</CardDescription>
        </CardHeader>
        <CardContent>
          {activeBlocks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {activeBlocks.map((block) => (
                <div 
                  key={block.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-mono text-sm">{block.entity_value}</div>
                      <div className="text-xs text-muted-foreground">
                        {block.entity_type.toUpperCase()} • {block.reason}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {block.expires_at 
                      ? `Expires ${formatDistanceToNow(new Date(block.expires_at))}`
                      : 'Permanent'
                    }
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No entities currently blocked
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate Limiting</CardTitle>
          <CardDescription>API endpoint protection configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rateLimits.map((limit) => (
              <div 
                key={limit.endpoint}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  !limit.is_enabled && "opacity-50"
                )}
              >
                <div>
                  <div className="font-mono text-sm">{limit.endpoint}</div>
                  <div className="text-xs text-muted-foreground">
                    {limit.requests_per_minute}/min • {limit.requests_per_hour}/hr • 
                    Burst: {limit.burst_limit}
                  </div>
                </div>
                <Badge variant={limit.is_enabled ? "default" : "secondary"}>
                  {limit.is_enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
