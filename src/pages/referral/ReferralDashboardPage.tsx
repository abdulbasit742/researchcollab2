import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Copy, Users, TrendingUp, Gift, Share2, Mail, MessageCircle, Linkedin, Link2 } from "lucide-react";
import {
  generateReferralCode, buildReferralLink,
  getMyReferrals, createReferral, createInvitation,
  getMyInvitations, getMyRewards, getReferralAnalytics,
  type VrlReferral, type VrlInvitation, type VrlReward,
} from "@/lib/referral/viralReferralService";

export default function ReferralDashboardPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<VrlReferral[]>([]);
  const [invitations, setInvitations] = useState<VrlInvitation[]>([]);
  const [rewards, setRewards] = useState<VrlReward[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const code = generateReferralCode(user.id);
    setReferralCode(code);
    loadData(user.id);
  }, [user]);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      const [refs, invs, rews, ana] = await Promise.all([
        getMyReferrals(userId),
        getMyInvitations(userId),
        getMyRewards(userId),
        getReferralAnalytics(userId),
      ]);
      setReferrals(refs);
      setInvitations(invs);
      setRewards(rews);
      setAnalytics(ana);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (channel: string) => {
    const link = buildReferralLink(referralCode, channel);
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: `Referral link for ${channel} copied to clipboard.` });
  };

  const sendEmailInvite = async () => {
    if (!user || !inviteEmail) return;
    try {
      await createInvitation({
        sender_id: user.id,
        referral_code: referralCode,
        channel: "email",
        recipient_email: inviteEmail,
      });
      await createReferral({
        referrer_user_id: user.id,
        referral_code: referralCode,
        invitation_channel: "email",
      });
      setInviteEmail("");
      toast({ title: "Invitation sent!" });
      loadData(user.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    if (s === "active") return "default";
    if (s === "verified") return "secondary";
    if (s === "registered") return "outline";
    return "outline";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referral Program</h1>
        <p className="text-muted-foreground mt-1">Invite others to RCollab and earn rewards for growing the network.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{analytics?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{analytics?.conversionRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Share2 className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{analytics?.registered ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Gift className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{rewards.length}</div>
            <p className="text-xs text-muted-foreground">Rewards Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input readOnly value={buildReferralLink(referralCode)} className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={() => copyLink("direct")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => copyLink("email")} className="gap-1.5">
              <Mail className="h-4 w-4" /> Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyLink("whatsapp")} className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyLink("linkedin")} className="gap-1.5">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Enter email to invite..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button onClick={sendEmailInvite} disabled={!inviteEmail}>Send Invite</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals">Referrals ({referrals.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
          <TabsTrigger value="rewards">Rewards ({rewards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-3 mt-4">
          {referrals.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No referrals yet. Share your link to get started!</p>}
          {referrals.map(r => (
            <Card key={r.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Via {r.invitation_channel}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={statusColor(r.referral_status) as any}>{r.referral_status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-3 mt-4">
          {invitations.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No invitations sent yet.</p>}
          {invitations.map(inv => (
            <Card key={inv.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{inv.recipient_email || inv.recipient_name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{inv.channel} · {new Date(inv.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline">{inv.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-3 mt-4">
          {rewards.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">Complete referrals to earn rewards!</p>}
          {rewards.map(rew => (
            <Card key={rew.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{rew.description || rew.reward_type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(rew.created_at).toLocaleDateString()}</p>
                </div>
                <Badge>{rew.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
