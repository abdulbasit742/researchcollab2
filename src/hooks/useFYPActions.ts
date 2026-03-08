/**
 * FYP Mutation hooks — Apply, Sponsor, Team creation
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useApplyToFYP() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      topic_id: string;
      cover_note?: string;
      skills?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("fyp_applications")
        .insert({
          topic_id: params.topic_id,
          user_id: user.id,
          cover_note: params.cover_note || null,
          skills: params.skills || [],
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      toast({ title: "Application submitted!", description: "You'll be notified when the faculty reviews it." });
      qc.invalidateQueries({ queryKey: ["fyp-applications", vars.topic_id] });
      qc.invalidateQueries({ queryKey: ["my-fyp-applications"] });
    },
    onError: (err: any) => {
      toast({ title: "Application failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useSponsorFYP() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      topic_id: string;
      pledge_amount: number;
      ip_agreement?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("fyp_sponsorships")
        .insert({
          topic_id: params.topic_id,
          sponsor_id: user.id,
          pledge_amount: params.pledge_amount,
          funded_amount: 0,
          ip_agreement: params.ip_agreement || "shared",
          status: "pledged",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      toast({ title: "Sponsorship pledged!", description: "Your pledge is now visible to the team." });
      qc.invalidateQueries({ queryKey: ["fyp-sponsorships", vars.topic_id] });
      qc.invalidateQueries({ queryKey: ["fyp-sponsorships"] });
    },
    onError: (err: any) => {
      toast({ title: "Sponsorship failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useMyFYPApplications() {
  return {
    // hook for checking if user already applied to a topic
    useHasApplied: (topicId?: string) => {
      return useMutation({
        mutationFn: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return false;
          const { data } = await (supabase as any)
            .from("fyp_applications")
            .select("id")
            .eq("topic_id", topicId)
            .eq("user_id", user.id)
            .maybeSingle();
          return !!data;
        },
      });
    },
  };
}
