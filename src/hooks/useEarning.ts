import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface EarningProject {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline_days: number | null;
  tags: string[] | null;
  location: string | null;
  status: string | null;
  created_at: string;
  // Joined data
  owner_name?: string;
  owner_avatar?: string;
  bid_count?: number;
}

export interface EarningBid {
  id: string;
  project_id: string;
  bidder_id: string;
  amount: number;
  delivery_days: number;
  message: string | null;
  status: string;
  created_at: string;
  // Joined/computed data
  project_title?: string;
  bidder_name?: string;
  bidder_avatar?: string;
}

export function useEarningProjects() {
  const [projects, setProjects] = useState<EarningProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("earning_projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch bid counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count } = await supabase
            .from("earning_bids")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          // Fetch owner profile
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", project.owner_id)
            .maybeSingle();

          return {
            ...project,
            bid_count: count || 0,
            owner_name: ownerProfile?.full_name || "Anonymous",
            owner_avatar: undefined,
          };
        })
      );

      setProjects(projectsWithCounts as EarningProject[]);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}

export function useEarningProject(projectId: string | undefined) {
  const [project, setProject] = useState<EarningProject | null>(null);
  const [bids, setBids] = useState<EarningBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("earning_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      
      if (projectData) {
        // Fetch owner profile
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", projectData.owner_id)
          .maybeSingle();

        setProject({
          ...projectData,
          owner_name: ownerProfile?.full_name || "Anonymous",
          owner_avatar: undefined,
        } as EarningProject);

        // Fetch bids
        const { data: bidsData, error: bidsError } = await supabase
          .from("earning_bids")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (bidsError) throw bidsError;

        // Fetch bidder profiles
        const bidsWithProfiles = await Promise.all(
          (bidsData || []).map(async (bid) => {
            const { data: bidderProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", bid.bidder_id)
              .maybeSingle();

            return {
              ...bid,
              bidder_name: bidderProfile?.full_name || "Anonymous",
              bidder_avatar: undefined,
            };
          })
        );

        setBids(bidsWithProfiles as EarningBid[]);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    project,
    bids,
    loading,
    refetch: fetchProject,
  };
}

export function useMyBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState<EarningBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyBids();
    } else {
      setBids([]);
      setLoading(false);
    }
  }, [user]);

  const fetchMyBids = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: bidsData, error } = await supabase
        .from("earning_bids")
        .select("*")
        .eq("bidder_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch project titles
      const bidsWithProjects = await Promise.all(
        (bidsData || []).map(async (bid) => {
          const { data: project } = await supabase
            .from("earning_projects")
            .select("title")
            .eq("id", bid.project_id)
            .maybeSingle();

          return {
            ...bid,
            project_title: project?.title || "Unknown Project",
          };
        })
      );

      setBids(bidsWithProjects as EarningBid[]);
    } catch (err) {
      console.error("Error fetching my bids:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    bids,
    loading,
    refetch: fetchMyBids,
  };
}

export function useSubmitBid() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submitBid = async (
    projectId: string,
    amount: number,
    deliveryDays: number,
    message: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place a bid.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setSubmitting(true);
    try {
      // Check if user already has a bid on this project
      const { data: existingBid } = await supabase
        .from("earning_bids")
        .select("id")
        .eq("project_id", projectId)
        .eq("bidder_id", user.id)
        .maybeSingle();

      if (existingBid) {
        toast({
          title: "Already Bid",
          description: "You already have a bid on this project.",
          variant: "destructive",
        });
        return { success: false, error: "Already bid on this project" };
      }

      // Get bidder's profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const bidderName = profile?.full_name || "Anonymous";

      const { error } = await supabase
        .from("earning_bids")
        .insert({
          project_id: projectId,
          bidder_id: user.id,
          amount,
          delivery_days: deliveryDays,
          message,
        });

      if (error) throw error;

      // Trigger email notification (fire-and-forget)
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/notify-new-bid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            bidAmount: amount,
            bidderName,
            deliveryDays,
          }),
        });
      } catch (emailError) {
        console.log("Email notification failed (non-blocking):", emailError);
      }

      toast({
        title: "Bid Submitted!",
        description: "Your bid has been submitted successfully.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error submitting bid:", err);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitBid,
    submitting,
  };
}

export function useCreateProject() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const createProject = async (data: {
    title: string;
    description: string;
    budget_min: number;
    budget_max: number;
    deadline_days: number;
    tags: string[];
    location?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a project.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setCreating(true);
    try {
      const { data: newProject, error } = await supabase
        .from("earning_projects")
        .insert({
          owner_id: user.id,
          title: data.title,
          description: data.description,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          deadline_days: data.deadline_days,
          tags: data.tags,
          location: data.location || "Remote",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project Created!",
        description: "Your project has been posted successfully.",
      });

      return { success: true, project: newProject };
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  };

  return {
    createProject,
    creating,
  };
}

export function useMyProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<EarningProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from("earning_projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch bid counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count } = await supabase
            .from("earning_bids")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            bid_count: count || 0,
            owner_name: "You",
            owner_avatar: undefined,
          };
        })
      );

      setProjects(projectsWithCounts as EarningProject[]);
    } catch (err) {
      console.error("Error fetching my projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProjects();

      // Subscribe to real-time updates for user's projects
      const projectsChannel = supabase
        .channel('my-projects-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'earning_projects',
            filter: `owner_id=eq.${user.id}`,
          },
          () => {
            fetchMyProjects();
          }
        )
        .subscribe();

      // Subscribe to real-time updates for bids on user's projects
      const bidsChannel = supabase
        .channel('my-projects-bids')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'earning_bids',
          },
          async (payload) => {
            // Check if this bid is for one of the user's projects
            const bidProjectId = payload.new?.project_id;
            if (bidProjectId) {
              const { data: project } = await supabase
                .from("earning_projects")
                .select("owner_id, title")
                .eq("id", bidProjectId)
                .maybeSingle();
              
              if (project?.owner_id === user.id) {
                // Show toast notification for new bid
                toast({
                  title: "New Bid Received! 🎉",
                  description: `Someone placed a bid on "${project.title}"`,
                });
                fetchMyProjects();
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(projectsChannel);
        supabase.removeChannel(bidsChannel);
      };
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  return {
    projects,
    loading,
    refetch: fetchMyProjects,
  };
}

export function useUpdateProject() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateProject = async (
    projectId: string,
    data: {
      title?: string;
      description?: string;
      budget_min?: number;
      budget_max?: number;
      deadline_days?: number;
      tags?: string[];
      location?: string;
    }
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update your project.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("earning_projects")
        .update(data)
        .eq("id", projectId)
        .eq("owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Project Updated!",
        description: "Your changes have been saved.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error updating project:", err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateProject,
    updating,
  };
}

export function useSavedProjects() {
  const STORAGE_KEY = "earn_saved_projects";
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const toggleSave = (projectId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (projectId: string) => savedIds.includes(projectId);

  return { savedIds, toggleSave, isSaved };
}

export function useUpdateProjectStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (projectId: string, status: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update project status.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("earning_projects")
        .update({ status })
        .eq("id", projectId)
        .eq("owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Project is now ${status}.`,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateStatus,
    updating,
  };
}

export function useUpdateBidStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateBidStatus = async (bidId: string, projectId: string, status: string) => {
    if (!user) return { success: false };

    setUpdating(true);
    try {
      // Verify ownership
      const { data: project } = await supabase
        .from("earning_projects")
        .select("owner_id")
        .eq("id", projectId)
        .maybeSingle();

      if (project?.owner_id !== user.id) {
        toast({ title: "Not Authorized", description: "Only the project owner can update bid status.", variant: "destructive" });
        return { success: false };
      }

      const { error } = await supabase
        .from("earning_bids")
        .update({ status } as any)
        .eq("id", bidId);

      if (error) throw error;

      toast({ title: "Bid Updated", description: `Bid marked as ${status}.` });
      return { success: true };
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      return { success: false };
    } finally {
      setUpdating(false);
    }
  };

  return { updateBidStatus, updating };
}

export function useQuickBidDefaults() {
  const KEY = "earn_quick_bid_defaults";

  const getDefaults = (): { amount: string; deliveryDays: string } | null => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const saveDefaults = (amount: string, deliveryDays: string) => {
    localStorage.setItem(KEY, JSON.stringify({ amount, deliveryDays }));
  };

  return { getDefaults, saveDefaults };
}
