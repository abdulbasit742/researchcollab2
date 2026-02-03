import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInstitutionalDashboard } from "@/hooks/useInstitutionalDashboard";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  Download,
  Shield,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TrustBadgeInline } from "@/components/trust/TrustBreakdownPanel";
import { useState } from "react";

interface InstitutionalDashboardProps {
  orgId: string;
}

export function InstitutionalDashboard({ orgId }: InstitutionalDashboardProps) {
  const {
    metrics,
    members,
    opportunities,
    policies,
    loading,
    error,
    hasAccess,
    inviteMember,
    updateMemberRole,
    removeMember,
    updatePolicy,
    generateReport,
  } = useInstitutionalDashboard(orgId);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !hasAccess) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p>{error || "You don't have access to this dashboard"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Institution Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your organization's presence and members</p>
        </div>
        <Button onClick={() => generateReport("monthly", { 
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          end: new Date() 
        })}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalMembers}</div>
                  <div className="text-xs text-muted-foreground">Total Members</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {metrics.activeMembers} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalDeals}</div>
                  <div className="text-xs text-muted-foreground">Total Deals</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {metrics.completedDeals} completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">${metrics.totalEarnings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(metrics.avgTrustScore)}</div>
                  <div className="text-xs text-muted-foreground">Avg Trust Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-1" />
            Members
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <Briefcase className="h-4 w-4 mr-1" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Settings className="h-4 w-4 mr-1" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Invite Member */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  inviteMember(inviteEmail, inviteRole);
                  setInviteEmail("");
                }}>
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {members.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.department || "No department"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <TrustBadgeInline score={member.trustScore} size="sm" />
                      
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      
                      <div className="text-sm text-muted-foreground">
                        {member.dealsCompleted} deals
                      </div>

                      <Select
                        value={member.role}
                        onValueChange={(v) => updateMemberRole(member.id, v)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Remove this member?")) {
                            removeMember(member.id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {opportunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No opportunities posted yet</p>
                  </div>
                ) : (
                  opportunities.map((opp) => (
                    <div 
                      key={opp.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{opp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Posted {format(opp.createdAt, "MMM d, yyyy")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {opp.type}
                        </Badge>
                        
                        <Badge 
                          variant={
                            opp.status === "completed" ? "default" :
                            opp.status === "in_progress" ? "secondary" :
                            "outline"
                          }
                          className="capitalize"
                        >
                          {opp.status.replace("_", " ")}
                        </Badge>

                        <div className="text-sm text-muted-foreground">
                          {opp.applicants} applicants
                        </div>

                        <div className="text-sm font-medium">
                          ${opp.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {policies.map((policy) => (
                  <div 
                    key={policy.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        Type: {policy.type}
                      </div>
                    </div>

                    <Button
                      variant={policy.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePolicy(policy.id, { enabled: !policy.enabled })}
                    >
                      {policy.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Analytics Dashboard</h3>
              <p className="text-sm">
                Detailed analytics and reporting coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
