import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWarmIntroductions, IntroductionRequest, MutualConnection } from "@/hooks/useWarmIntroductions";
import { UserPlus, Users, CheckCircle, X, Clock, Send, Star, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WarmIntroductionFlow() {
  const { 
    incomingRequests, 
    outgoingRequests, 
    stats, 
    loading,
    getMutualConnections,
    requestIntroduction,
    respondToRequest,
    makeIntroduction 
  } = useWarmIntroductions();

  const [activeTab, setActiveTab] = useState("incoming");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [introMessage, setIntroMessage] = useState("");

  const mutualConnections = selectedTarget ? getMutualConnections(selectedTarget) : [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Warm Introductions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{stats.totalRequestsSent}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.acceptanceRate}%</p>
              <p className="text-xs text-muted-foreground">Acceptance</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{stats.remainingRequestsThisWeek}/{stats.weeklyLimit}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming" className="relative">
            Incoming
            {incomingRequests.filter(r => r.status === "pending").length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {incomingRequests.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="request">New Request</TabsTrigger>
        </TabsList>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="space-y-4 mt-4">
          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <IntroductionRequestCard 
                key={request.id} 
                request={request} 
                type="incoming"
                onRespond={respondToRequest}
                onMakeIntroduction={makeIntroduction}
              />
            ))
          ) : (
            <EmptyState 
              icon={<UserPlus className="h-12 w-12" />}
              title="No Incoming Requests"
              description="When someone asks for an introduction through you, it will appear here."
            />
          )}
        </TabsContent>

        {/* Outgoing Requests */}
        <TabsContent value="outgoing" className="space-y-4 mt-4">
          {outgoingRequests.length > 0 ? (
            outgoingRequests.map((request) => (
              <IntroductionRequestCard 
                key={request.id} 
                request={request} 
                type="outgoing"
              />
            ))
          ) : (
            <EmptyState 
              icon={<Send className="h-12 w-12" />}
              title="No Outgoing Requests"
              description="Request an introduction to grow your network strategically."
            />
          )}
        </TabsContent>

        {/* New Request */}
        <TabsContent value="request" className="space-y-4 mt-4">
          {stats.remainingRequestsThisWeek > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request an Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Browse professionals and request warm introductions through mutual connections. 
                  Trust-weighted connections yield higher acceptance rates.
                </p>

                {/* Mock Target Selection */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Suggested Connections</p>
                  {["Dr. Lisa Chen", "Prof. Michael Brown", "Sarah Johnson"].map((name, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTarget === name ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                      }`}
                      onClick={() => setSelectedTarget(name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">AI Research • Trust: {85 + i * 3}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {2 - i} mutual
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTarget && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-medium">Available Connectors</p>
                    {mutualConnections.filter(c => c.canIntroduce).map((conn) => (
                      <div key={conn.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">{conn.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{conn.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Effectiveness: {conn.introductionEffectiveness}%
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={conn.relationshipStrength === "strong" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {conn.relationshipStrength}
                        </Badge>
                      </div>
                    ))}

                    <Textarea
                      placeholder="Why would you like to connect? Be specific about your purpose..."
                      value={introMessage}
                      onChange={(e) => setIntroMessage(e.target.value)}
                      className="min-h-[100px]"
                    />

                    <Button 
                      className="w-full"
                      disabled={!introMessage.trim()}
                      onClick={() => {
                        // Handle request
                        setIntroMessage("");
                        setSelectedTarget(null);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request Introduction
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="py-6 text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="font-medium">Weekly Limit Reached</p>
                <p className="text-sm text-muted-foreground">
                  You've used all {stats.weeklyLimit} introduction requests this week. 
                  Limit resets on Monday.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntroductionRequestCard({ 
  request, 
  type,
  onRespond,
  onMakeIntroduction 
}: { 
  request: IntroductionRequest;
  type: "incoming" | "outgoing";
  onRespond?: (id: string, accept: boolean) => void;
  onMakeIntroduction?: (id: string, message: string) => void;
}) {
  const isPending = request.status === "pending";
  const [showIntroForm, setShowIntroForm] = useState(false);
  const [introMessage, setIntroMessage] = useState("");

  return (
    <Card className={request.status === "pending" && type === "incoming" ? "border-primary/50" : ""}>
      <CardContent className="py-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {type === "incoming" ? request.requesterName.charAt(0) : request.targetName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {type === "incoming" ? request.requesterName : request.targetName}
              </p>
              <Badge variant="secondary" className="text-xs">
                Trust: {type === "incoming" ? request.requesterTrustScore : request.targetTrustScore}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === "incoming" 
                ? `Wants to connect with ${request.targetName}`
                : `Via ${request.connectorName}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {request.requestedAt.toLocaleDateString()}
            </p>
          </div>
          <Badge 
            variant={request.status === "accepted" ? "default" : request.status === "declined" ? "destructive" : "secondary"}
          >
            {request.status}
          </Badge>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-1">Purpose</p>
          <p className="text-sm text-muted-foreground">{request.purpose}</p>
          {request.message && (
            <>
              <p className="text-sm font-medium mt-2 mb-1">Message</p>
              <p className="text-sm text-muted-foreground">{request.message}</p>
            </>
          )}
        </div>

        {/* Actions for incoming pending requests */}
        {type === "incoming" && isPending && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onRespond?.(request.id, false)}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setShowIntroForm(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept & Introduce
            </Button>
          </div>
        )}

        {/* Introduction form */}
        {showIntroForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <Textarea
              placeholder="Write your introduction message..."
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
            />
            <Button 
              className="w-full"
              disabled={!introMessage.trim()}
              onClick={() => {
                onMakeIntroduction?.(request.id, introMessage);
                setShowIntroForm(false);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Introduction
            </Button>
          </motion.div>
        )}

        {/* Success indicator */}
        {request.wasSuccessful && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-600 text-sm">
            <Star className="h-4 w-4" />
            Introduction was successful!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center">
        <div className="text-muted-foreground mx-auto mb-3">{icon}</div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
