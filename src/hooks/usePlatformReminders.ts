import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlatformReminder {
  id: string;
  reminder_type: string;
  message: string;
  created_at: string;
  dismissed: boolean;
}

export function usePlatformReminders() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["platform-reminders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("platform_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as PlatformReminder[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("platform_reminders").update({ dismissed: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-reminders", user?.id] }),
  });

  return { reminders, isLoading, dismiss: dismiss.mutate };
}
