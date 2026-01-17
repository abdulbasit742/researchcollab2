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
  status: string | null;
  created_at: string;
  // Joined data
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
            .select("full_name, avatar_url")
            .eq("id", project.owner_id)
            .maybeSingle();

          return {
            ...project,
            bid_count: count || 0,
            owner_name: ownerProfile?.full_name || "Anonymous",
            owner_avatar: ownerProfile?.avatar_url,
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
          .select("full_name, avatar_url")
          .eq("id", projectData.owner_id)
          .maybeSingle();

        setProject({
          ...projectData,
          owner_name: ownerProfile?.full_name || "Anonymous",
          owner_avatar: ownerProfile?.avatar_url,
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
              .select("full_name, avatar_url")
              .eq("id", bid.bidder_id)
              .maybeSingle();

            return {
              ...bid,
              bidder_name: bidderProfile?.full_name || "Anonymous",
              bidder_avatar: bidderProfile?.avatar_url,
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
