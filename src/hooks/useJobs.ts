import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface JobPosting {
  id: string;
  title: string;
  description: string | null;
  organization_id: string | null;
  posted_by: string | null;
  job_type: string | null;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  requirements: string | null;
  skills_required: string[] | null;
  application_url: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  // Joined data
  organization?: { name: string };
  poster?: { full_name: string };
  is_saved?: boolean;
  has_applied?: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
}

// =====================================================
// BROWSE JOBS
// =====================================================

export function useJobs(filters?: {
  type?: string;
  search?: string;
  remote?: boolean;
  skills?: string[];
}) {
  const { user } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("job_postings")
        .select(`
          *,
          organizations(name),
          profiles!job_postings_posted_by_fkey(full_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (filters?.type) {
        query = query.eq("job_type", filters.type);
      }
      
      if (filters?.remote) {
        query = query.eq("is_remote", true);
      }
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get saved/applied status if authenticated
      let savedIds: string[] = [];
      let appliedIds: string[] = [];
      
      if (user?.id && data.length > 0) {
        const jobIds = data.map(j => j.id);
        
        const [savedRes, appliedRes] = await Promise.all([
          supabase
            .from("saved_jobs")
            .select("job_id")
            .eq("user_id", user.id)
            .in("job_id", jobIds),
          supabase
            .from("job_applications")
            .select("job_id")
            .eq("user_id", user.id)
            .in("job_id", jobIds),
        ]);
        
        savedIds = savedRes.data?.map(s => s.job_id) || [];
        appliedIds = appliedRes.data?.map(a => a.job_id) || [];
      }
      
      return {
        jobs: data.map(j => ({
          ...j,
          organization: j.organizations,
          poster: j.profiles,
          is_saved: savedIds.includes(j.id),
          has_applied: appliedIds.includes(j.id),
        })) as JobPosting[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// SINGLE JOB
// =====================================================

export function useJob(jobId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          organizations(name),
          profiles!job_postings_posted_by_fkey(full_name)
        `)
        .eq("id", jobId)
        .single();
      
      if (error) throw error;
      
      // Check saved/applied status
      let is_saved = false;
      let has_applied = false;
      
      if (user?.id) {
        const [savedRes, appliedRes] = await Promise.all([
          supabase.from("saved_jobs").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle(),
          supabase.from("job_applications").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle(),
        ]);
        is_saved = !!savedRes.data;
        has_applied = !!appliedRes.data;
      }
      
      return {
        ...data,
        organization: data.organizations,
        poster: data.profiles,
        is_saved,
        has_applied,
      } as JobPosting;
    },
    enabled: !!jobId,
  });
}

// =====================================================
// SAVED JOBS
// =====================================================

export function useSavedJobs() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["savedJobs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(`
          *,
          job_postings(*, organizations(name))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(s => ({
        ...s.job_postings,
        organization: s.job_postings.organizations,
        is_saved: true,
      })) as JobPosting[];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// SAVE/UNSAVE JOB
// =====================================================

export function useSaveJob() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, save }: { jobId: string; save: boolean }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (save) {
        const { error } = await supabase
          .from("saved_jobs")
          .insert({ job_id: jobId, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { save }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      toast.success(save ? "Job saved" : "Job unsaved");
    },
  });
}

// =====================================================
// APPLY TO JOB
// =====================================================

export function useApplyToJob() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      job_id: string;
      cover_letter?: string;
      resume_url?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("job_applications")
        .insert({
          ...data,
          user_id: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast.success("Application submitted");
    },
    onError: () => {
      toast.error("Failed to apply");
    },
  });
}

// =====================================================
// MY APPLICATIONS
// =====================================================

export function useMyApplications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["myApplications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_postings(*, organizations(name))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(a => ({
        ...a,
        job: {
          ...a.job_postings,
          organization: a.job_postings.organizations,
        },
      }));
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// CREATE JOB POSTING
// =====================================================

export function useCreateJobPosting() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<JobPosting, "id" | "created_at" | "organization" | "poster" | "is_saved" | "has_applied">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("job_postings")
        .insert({
          ...data,
          posted_by: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job posting created");
    },
    onError: () => {
      toast.error("Failed to create job posting");
    },
  });
}
