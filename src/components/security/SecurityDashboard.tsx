import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Fingerprint,
  Globe,
  Clock
} from "lucide-react";
import { useAuthenticationSecurity } from "@/hooks/useAuthenticationSecurity";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function SecurityDashboard() {
  const {
    sessions,
    loginHistory,
    mfaMethods,
    securityAlerts,
    loading,
    getSecurityScore,
    terminateSession,
    terminateAllOtherSessions,
    enableMFA,
    detectSuspiciousActivity
  } = useAuthenticationSecurity();

  const securityScore = getSecurityScore();
  const suspiciousActivity = detectSuspiciousActivity();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                securityScore.score >= 80 ? "bg-emerald-500/10" : 
                securityScore.score >= 60 ? "bg-amber-500/10" : "bg-destructive/10"
              )}>
                {securityScore.score >= 80 ? (
                  <ShieldCheck className={cn("h-6 w-6", getScoreColor(securityScore.score))} />
                ) : securityScore.score >= 60 ? (
                  <Shield className={cn("h-6 w-6", getScoreColor(securityScore.score))} />
                ) : (
                  <ShieldAlert className={cn("h-6 w-6", getScoreColor(securityScore.score))} />
                )}
              </div>
              <div>
                <CardTitle>Security Score</CardTitle>
                <CardDescription>Your account security status</CardDescription>
              </div>
            </div>
            <div className={cn("text-4xl font-bold", getScoreColor(securityScore.score))}>
              {securityScore.score}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress 
            value={securityScore.score} 
            className="h-2"
          />
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {securityScore.breakdown.map((item) => (
              <div 
                key={item.category}
                className="p-3 rounded-lg border bg-muted/30 text-center"
              >
                <div className="text-lg font-semibold">
                  {item.score}/{item.max}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.category}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {securityScore.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recommendations</h4>
              <div className="space-y-1">
                {securityScore.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Activity Alert */}
      {suspiciousActivity.hasSuspiciousActivity && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Suspicious Activity Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suspiciousActivity.indicators.map((indicator, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive" />
                  {indicator}
                </li>
              ))}
            </ul>
            <Button variant="destructive" size="sm" className="mt-4">
              Review Activity
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Active Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Active Sessions</CardTitle>
                  <CardDescription>Devices currently logged into your account</CardDescription>
                </div>
                {sessions.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={terminateAllOtherSessions}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out Other Devices
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    session.is_current && "bg-primary/5 border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {session.device.includes('Mobile') ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.device}</span>
                        {session.is_current && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                        {session.risk_level === 'high' && (
                          <Badge variant="destructive" className="text-xs">High Risk</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{session.browser}</span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MFA Settings */}
        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Multi-Factor Authentication</CardTitle>
              <CardDescription>Add extra security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TOTP Authenticator */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-muted-foreground">
                      Use an app like Google Authenticator or Authy
                    </div>
                  </div>
                </div>
                <Button 
                  variant={mfaMethods.some(m => m.type === 'totp') ? "outline" : "default"}
                  size="sm"
                  onClick={() => enableMFA('totp')}
                  disabled={mfaMethods.some(m => m.type === 'totp')}
                >
                  {mfaMethods.some(m => m.type === 'totp') ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>

              {/* Hardware Key */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Hardware Security Key</div>
                    <div className="text-sm text-muted-foreground">
                      Use a physical security key like YubiKey
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => enableMFA('hardware_key')}
                  disabled={mfaMethods.some(m => m.type === 'hardware_key')}
                >
                  {mfaMethods.some(m => m.type === 'hardware_key') ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>

              {/* Biometric */}
              <div className="flex items-center justify-between p-4 rounded-lg border opacity-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Biometric Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Use fingerprint or face recognition
                    </div>
                  </div>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History */}
        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Login History</CardTitle>
              <CardDescription>Recent login attempts to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginHistory.map((login) => (
                  <div 
                    key={login.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {login.success ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {login.success ? 'Successful login' : 'Failed attempt'}
                          </span>
                          {login.failure_reason && (
                            <span className="text-sm text-destructive">
                              ({login.failure_reason})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{login.location}</span>
                          <span>{login.ip_address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}

                {loginHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No login history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Alerts</CardTitle>
              <CardDescription>Important security notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {securityAlerts.length > 0 ? (
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        alert.severity === 'critical' && "border-destructive/50 bg-destructive/5",
                        alert.severity === 'warning' && "border-amber-500/50 bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            "h-5 w-5 mt-0.5",
                            alert.severity === 'critical' && "text-destructive",
                            alert.severity === 'warning' && "text-amber-500"
                          )} />
                          <div>
                            <div className="font-medium">{alert.type}</div>
                            <div className="text-sm text-muted-foreground">{alert.message}</div>
                          </div>
                        </div>
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' : 
                          alert.severity === 'warning' ? 'outline' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <div className="font-medium">No Security Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Your account is secure
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
