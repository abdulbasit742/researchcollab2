import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Users, Target, Zap, Award, BarChart3, Activity, RefreshCw, Lock,
  Unlock, Star, Calendar, ArrowRight, ExternalLink, Download, QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrustDecayPrevention, usePeerValidation, useTrustRecovery, usePortableCredentials, useTrustNetwork, useReputationInsurance } from "@/hooks/useAdvancedTrust";

// Trust Decay Prevention Dashboard
export function TrustDecayDashboard() {
  const { prevention, completeAction } = useTrustDecayPrevention();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Trust Decay Prevention
        </CardTitle>
        <CardDescription>
          Stay active to maintain your trust score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Days until decay</p>
            <p className="text-3xl font-bold">{prevention.daysUntilDecay}</p>
          </div>
          <div className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center",
            prevention.daysUntilDecay > 20 ? "bg-emerald-500/20" :
            prevention.daysUntilDecay > 10 ? "bg-amber-500/20" : "bg-destructive/20"
          )}>
            <Clock className={cn(
              "h-8 w-8",
              prevention.daysUntilDecay > 20 ? "text-emerald-500" :
              prevention.daysUntilDecay > 10 ? "text-amber-500" : "text-destructive"
            )} />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Prevention Actions</h4>
          <div className="space-y-2">
            {prevention.preventionActions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  action.completed ? "bg-emerald-500/10 border-emerald-500/30" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {action.completed ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2" />
                  )}
                  <div>
                    <p className={cn("text-sm", action.completed && "line-through text-muted-foreground")}>
                      {action.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{action.impact} points • {action.estimatedTime}
                    </p>
                  </div>
                </div>
                {!action.completed && (
                  <Button size="sm" variant="outline" onClick={() => completeAction(action.id)}>
                    Complete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Peer Validation Network Panel
export function PeerValidationPanel() {
  const { validators, validationStrength, requestValidation } = usePeerValidation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Peer Validation Network
        </CardTitle>
        <CardDescription>
          Skills endorsed by verified collaborators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Validation Strength</span>
              <span className="text-sm font-medium">{validationStrength}%</span>
            </div>
            <Progress value={validationStrength} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          {validators.map((validator) => (
            <div key={validator.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">{validator.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{validator.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {validator.relationship} • Trust: {validator.trustScore}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{validator.validationsGiven}</p>
                <p className="text-xs text-muted-foreground">endorsements</p>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" variant="outline">
          Request Endorsement
        </Button>
      </CardContent>
    </Card>
  );
}

// Trust Recovery Roadmap
export function TrustRecoveryRoadmapPanel() {
  const { recoveryPlan, updateProgress } = useTrustRecovery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Trust Recovery Roadmap
        </CardTitle>
        <CardDescription>
          Your personalized path to rebuilding trust
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current → Target</p>
            <p className="text-2xl font-bold">
              {recoveryPlan.currentScore} → {recoveryPlan.targetScore}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Est. recovery</p>
            <p className="text-lg font-medium">{recoveryPlan.estimatedRecoveryDays} days</p>
          </div>
        </div>

        <div className="space-y-3">
          {recoveryPlan.milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={cn(
                "p-3 rounded-lg border",
                milestone.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" :
                milestone.status === "active" ? "border-primary" : "opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {milestone.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : milestone.status === "locked" ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Activity className="h-4 w-4 text-primary" />
                  )}
                  <span className="font-medium text-sm">{milestone.title}</span>
                </div>
                <Badge variant="outline">+{milestone.pointsToRecover} pts</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
              <div className="flex items-center gap-2">
                <Progress value={(milestone.progress / milestone.required) * 100} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {milestone.progress}/{milestone.required}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Portable Credentials Export
export function PortableCredentialsPanel() {
  const { credentials, exportCredential, generateVerificationQR } = usePortableCredentials();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Portable Credentials
        </CardTitle>
        <CardDescription>
          Export your verified achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {credentials.map((credential) => (
          <div key={credential.id} className="p-4 rounded-lg border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{credential.type}</Badge>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <h4 className="font-medium mt-1">{credential.title}</h4>
                <p className="text-sm text-muted-foreground">{credential.issuer}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {credential.exportFormats.map((format) => (
                <Button
                  key={format}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => exportCredential(credential.id, format)}
                >
                  {format === "qr" ? <QrCode className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Trust Network Visualization
export function TrustNetworkPanel() {
  const { connections, metrics } = useTrustNetwork();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Trust Network
        </CardTitle>
        <CardDescription>
          Your verified professional connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{metrics.averageTrust}</p>
            <p className="text-xs text-muted-foreground">Avg Trust</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{metrics.strongConnections}</p>
            <p className="text-xs text-muted-foreground">Strong Ties</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{metrics.trustCapacity}</p>
            <p className="text-xs text-muted-foreground">Trust Capacity</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-500">{metrics.atRiskConnections}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
        </div>

        <ScrollArea className="h-48">
          <div className="space-y-2">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">{connection.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connection.name}</p>
                    <p className="text-xs text-muted-foreground">{connection.collaborations} collabs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {connection.trustTrajectory === "rising" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : connection.trustTrajectory === "declining" ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : null}
                  <Badge variant="outline">{connection.mutualTrust}</Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Reputation Insurance Panel
export function ReputationInsurancePanel() {
  const { insurance, fileClaim } = useReputationInsurance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Reputation Insurance
        </CardTitle>
        <CardDescription>
          Protect your professional standing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <Badge className="capitalize">{insurance.plan} Plan</Badge>
            <span className="text-sm font-medium">${insurance.monthlyPremium}/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Coverage</span>
            <span className="font-medium">{insurance.coverageAmount} pts protected</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">Claims remaining</span>
            <span className="font-medium">{insurance.claimsAvailable}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Coverage Includes</h4>
          <ul className="space-y-1">
            {insurance.coverageDetails.map((detail, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full" variant="outline" disabled={insurance.claimsAvailable === 0}>
          File a Claim
        </Button>
      </CardContent>
    </Card>
  );
}

// Combined Trust Dashboard
export function AdvancedTrustDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <TrustDecayDashboard />
        <PeerValidationPanel />
        <TrustRecoveryRoadmapPanel />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <PortableCredentialsPanel />
        <TrustNetworkPanel />
        <ReputationInsurancePanel />
      </div>
    </div>
  );
}
