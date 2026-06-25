import { useEffect, useMemo, useState } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ROLE_CONFIG, type AppRole } from "@/config/roles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PendingRoleRequest = {
  id: string;
  requested_role: AppRole;
  status: string;
  created_at: string;
};

const REQUESTABLE_ROLES: AppRole[] = [
  "researcher",
  "sponsor_admin",
  "tenant_admin",
  "compliance_officer",
  "government_admin",
  "admin",
];

type RoleRequestPanelProps = {
  sourcePath?: string;
  requiredRoleLabels?: string[];
};

export function RoleRequestPanel({ sourcePath, requiredRoleLabels = [] }: RoleRequestPanelProps) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [requestedRole, setRequestedRole] = useState<AppRole>("researcher");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRoleRequest | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const currentRole = userRole?.role ?? "student";
  const roleOptions = useMemo(
    () => REQUESTABLE_ROLES.filter((role) => role !== currentRole),
    [currentRole]
  );

  useEffect(() => {
    if (!user) return;

    const fetchPendingRequest = async () => {
      setIsChecking(true);
      const { data, error } = await supabase
        .from("role_requests")
        .select("id, requested_role, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setPendingRequest(data as PendingRoleRequest);
      }
      setIsChecking(false);
    };

    fetchPendingRequest();
  }, [user]);

  useEffect(() => {
    if (!roleOptions.includes(requestedRole) && roleOptions.length > 0) {
      setRequestedRole(roleOptions[0]);
    }
  }, [requestedRole, roleOptions]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in before requesting role access.", variant: "destructive" });
      return;
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 12) {
      toast({ title: "Add a short reason", description: "Please explain why you need this role.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("role_requests")
      .insert({
        user_id: user.id,
        current_role: currentRole,
        requested_role: requestedRole,
        reason: trimmedReason,
        source_path: sourcePath ?? null,
        status: "pending",
      })
      .select("id, requested_role, status, created_at")
      .single();

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Request not submitted",
        description: "Role request storage may not be migrated yet. Ask an admin to run the latest Supabase migrations.",
        variant: "destructive",
      });
      return;
    }

    setPendingRequest(data as PendingRoleRequest);
    setReason("");
    toast({ title: "Role request submitted", description: "An admin can now review your access request." });
  };

  if (!user) return null;

  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking role request status…
        </CardContent>
      </Card>
    );
  }

  if (pendingRequest) {
    const pendingRole = ROLE_CONFIG[pendingRequest.requested_role]?.label ?? pendingRequest.requested_role;
    return (
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-blue-500" /> Role request pending
          </CardTitle>
          <CardDescription>
            Your request for <span className="font-medium">{pendingRole}</span> access is waiting for admin review.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" /> Request role access
        </CardTitle>
        <CardDescription>
          Submit a request if you believe you need a different role to access this workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiredRoleLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {requiredRoleLabels.map((role) => (
              <Badge key={role} variant="secondary">Suggested: {role}</Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="requestedRole">Requested role</Label>
          <select
            id="requestedRole"
            value={requestedRole}
            onChange={(event) => setRequestedRole(event.target.value as AppRole)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>{ROLE_CONFIG[role].label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roleReason">Why do you need this access?</Label>
          <textarea
            id="roleReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Example: I am managing institution pilot reviews and need tenant admin access."
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting || !roleOptions.length} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit role request
        </Button>
      </CardContent>
    </Card>
  );
}
