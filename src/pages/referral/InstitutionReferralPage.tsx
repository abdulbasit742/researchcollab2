import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Building2, Globe, Link2, Users } from "lucide-react";
import {
  getInstitutionReferrals, createInstitutionReferral,
  generateReferralCode, buildReferralLink,
} from "@/lib/referral/viralReferralService";

export default function InstitutionReferralPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [partnerType, setPartnerType] = useState("collaboration");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getInstitutionReferrals(user.id);
      setReferrals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createInstitutionReferral({
        referred_by_user_id: user.id,
        partnership_type: partnerType,
      });
      toast({ title: "Institution referral created!" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const code = user ? generateReferralCode(user.id) : "";
  const institutionLink = buildReferralLink(code, "institution");

  const copyLink = () => {
    navigator.clipboard.writeText(institutionLink);
    toast({ title: "Institution referral link copied!" });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Institution Referral Program</h1>
        <p className="text-muted-foreground mt-1">Invite partner universities and research institutes to join RCollab.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">Institutions Referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{referrals.filter(r => r.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Active Partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Globe className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{referrals.filter(r => r.converted_at).length}</div>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Institution Invite Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={institutionLink} className="font-mono text-sm" />
            <Button variant="outline" onClick={copyLink}>Copy</Button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Partnership Type</label>
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaboration">Research Collaboration</SelectItem>
                  <SelectItem value="exchange">Student Exchange</SelectItem>
                  <SelectItem value="joint_funding">Joint Funding</SelectItem>
                  <SelectItem value="technology_transfer">Technology Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate}>Create Referral</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No institution referrals yet. Share your link with partner institutions!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">{r.partnership_type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={r.status === "active" ? "default" : "outline"}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
