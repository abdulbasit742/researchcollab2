import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, CheckCircle, Vote, DollarSign, Clock, Shield, Eye } from "lucide-react";
import { motion } from "framer-motion";

type PartyRole = "lead" | "contributor" | "advisor" | "observer";

interface DealParty {
  id: string;
  name: string;
  avatar?: string;
  role: PartyRole;
  trustScore: number;
  contribution: number; // percentage
  paymentShare: number; // percentage
  approvalStatus: "pending" | "approved" | "rejected";
  joinedAt: Date;
}

interface DealMilestone {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "review" | "completed";
  value: number;
  approvals: { partyId: string; approved: boolean }[];
  requiredApprovals: number;
}

export function MultiPartyDealRoom() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const parties: DealParty[] = [
    { id: "p1", name: "Dr. Sarah Chen", role: "lead", trustScore: 91, contribution: 40, paymentShare: 40, approvalStatus: "approved", joinedAt: new Date() },
    { id: "p2", name: "Prof. James Miller", role: "contributor", trustScore: 88, contribution: 35, paymentShare: 35, approvalStatus: "approved", joinedAt: new Date() },
    { id: "p3", name: "Alex Thompson", role: "contributor", trustScore: 72, contribution: 20, paymentShare: 20, approvalStatus: "approved", joinedAt: new Date() },
    { id: "p4", name: "Dr. Emily Watson", role: "advisor", trustScore: 84, contribution: 5, paymentShare: 5, approvalStatus: "pending", joinedAt: new Date() },
  ];

  const milestones: DealMilestone[] = [
    { id: "m1", title: "Research Proposal", status: "completed", value: 5000, approvals: [{ partyId: "p1", approved: true }, { partyId: "p2", approved: true }, { partyId: "p3", approved: true }], requiredApprovals: 3 },
    { id: "m2", title: "Data Collection", status: "in_progress", value: 10000, approvals: [], requiredApprovals: 3 },
    { id: "m3", title: "Analysis & Findings", status: "pending", value: 12000, approvals: [], requiredApprovals: 3 },
    { id: "m4", title: "Final Report", status: "pending", value: 8000, approvals: [], requiredApprovals: 3 },
  ];

  const totalValue = milestones.reduce((sum, m) => sum + m.value, 0);
  const completedValue = milestones.filter(m => m.status === "completed").reduce((sum, m) => sum + m.value, 0);

  const getRoleIcon = (role: PartyRole) => {
    switch (role) {
      case "lead": return <Shield className="h-4 w-4" />;
      case "contributor": return <Users className="h-4 w-4" />;
      case "advisor": return <Eye className="h-4 w-4" />;
      case "observer": return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: PartyRole) => {
    switch (role) {
      case "lead": return "bg-primary text-primary-foreground";
      case "contributor": return "bg-blue-500/10 text-blue-600";
      case "advisor": return "bg-purple-500/10 text-purple-600";
      case "observer": return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Multi-Party Deal Room
            </CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-500/30">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">AI Research Collaboration</h2>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{parties.length}</p>
              <p className="text-xs text-muted-foreground">Parties</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">PKR {totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-600">{Math.round((completedValue / totalValue) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{milestones.length}</p>
              <p className="text-xs text-muted-foreground">Milestones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Contribution Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contribution & Payment Split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parties.map(party => (
                <div key={party.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{party.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{party.name}</span>
                      <Badge variant="outline" className={`text-xs ${getRoleBadge(party.role)}`}>
                        {party.role}
                      </Badge>
                    </div>
                    <span>PKR {Math.round(totalValue * party.paymentShare / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={party.contribution} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-12">{party.contribution}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Escrow Balance</p>
                    <p className="text-lg font-bold">PKR {(totalValue * 0.2).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                    <p className="text-lg font-bold">8 weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parties Tab */}
        <TabsContent value="parties" className="space-y-4 mt-4">
          {parties.map((party, index) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{party.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{party.name}</p>
                          {party.approvalStatus === "approved" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-xs ${getRoleBadge(party.role)}`}>
                            {getRoleIcon(party.role)}
                            <span className="ml-1 capitalize">{party.role}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Trust: {party.trustScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{party.paymentShare}%</p>
                      <p className="text-xs text-muted-foreground">Payment Share</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <Button variant="outline" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Party
          </Button>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4 mt-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={milestone.status === "completed" ? "bg-green-500/5 border-green-500/30" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {milestone.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : milestone.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className="font-medium">{milestone.title}</span>
                      <Badge 
                        variant={milestone.status === "completed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {milestone.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="font-bold">PKR {milestone.value.toLocaleString()}</span>
                  </div>

                  {/* Approval Status */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Approvals: {milestone.approvals.filter(a => a.approved).length}/{milestone.requiredApprovals}
                      </span>
                    </div>
                    {milestone.status === "review" && (
                      <Button size="sm" className="h-7">
                        Approve Release
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
