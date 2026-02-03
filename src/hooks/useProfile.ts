import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// PROFILE HEADER
// =====================================================

export interface ProfileHeader {
  id: string;
  user_id: string;
  headline: string | null;
  summary_bio: string | null;
  cover_image_url: string | null;
  location: string | null;
  open_to_collaboration: boolean;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  orcid_id: string | null;
  google_scholar_url: string | null;
}

export function useProfileHeader(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileHeader", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      
      const { data, error } = await supabase
        .from("profile_headers")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProfileHeader | null;
    },
    enabled: !!targetId,
  });
}

export function useUpdateProfileHeader() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ProfileHeader>) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profile_headers")
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileHeader", user?.id] });
      toast.success("Profile updated");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
}

// =====================================================
// PROFILE EXPERIENCES
// =====================================================

export interface ProfileExperience {
  id: string;
  user_id: string;
  role_title: string;
  organization_name: string;
  organization_id: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  experience_type: string;
  visibility: string;
}

export function useProfileExperiences(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileExperiences", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from("profile_experiences")
        .select("*")
        .eq("user_id", targetId)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data as ProfileExperience[];
    },
    enabled: !!targetId,
  });
}

export function useAddExperience() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ProfileExperience, "id" | "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profile_experiences")
        .insert({ user_id: user.id, ...data });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileExperiences", user?.id] });
      toast.success("Experience added");
    },
    onError: () => {
      toast.error("Failed to add experience");
    },
  });
}

export function useDeleteExperience() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (experienceId: string) => {
      const { error } = await supabase
        .from("profile_experiences")
        .delete()
        .eq("id", experienceId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileExperiences", user?.id] });
      toast.success("Experience removed");
    },
  });
}

// =====================================================
// PROFILE EDUCATION
// =====================================================

export interface ProfileEducation {
  id: string;
  user_id: string;
  institution_name: string;
  institution_id: string | null;
  degree: string;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  grade_or_gpa: string | null;
  description: string | null;
  activities: string | null;
  visibility: string;
}

export function useProfileEducation(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileEducation", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from("profile_education")
        .select("*")
        .eq("user_id", targetId)
        .order("end_year", { ascending: false, nullsFirst: true });
      
      if (error) throw error;
      return data as ProfileEducation[];
    },
    enabled: !!targetId,
  });
}

export function useAddEducation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ProfileEducation, "id" | "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profile_education")
        .insert({ user_id: user.id, ...data });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileEducation", user?.id] });
      toast.success("Education added");
    },
    onError: () => {
      toast.error("Failed to add education");
    },
  });
}

export function useDeleteEducation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (educationId: string) => {
      const { error } = await supabase
        .from("profile_education")
        .delete()
        .eq("id", educationId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileEducation", user?.id] });
      toast.success("Education removed");
    },
  });
}

// =====================================================
// PROFILE CERTIFICATIONS
// =====================================================

export interface ProfileCertification {
  id: string;
  user_id: string;
  name: string;
  issuing_body: string;
  issue_date: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  visibility: string;
}

export function useProfileCertifications(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileCertifications", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from("profile_certifications")
        .select("*")
        .eq("user_id", targetId)
        .order("issue_date", { ascending: false });
      
      if (error) throw error;
      return data as ProfileCertification[];
    },
    enabled: !!targetId,
  });
}

export function useAddCertification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ProfileCertification, "id" | "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profile_certifications")
        .insert({ user_id: user.id, ...data });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileCertifications", user?.id] });
      toast.success("Certification added");
    },
  });
}

// =====================================================
// PROFILE LANGUAGES
// =====================================================

export interface ProfileLanguage {
  id: string;
  user_id: string;
  language: string;
  proficiency: string;
}

export function useProfileLanguages(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileLanguages", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from("profile_languages")
        .select("*")
        .eq("user_id", targetId);
      
      if (error) throw error;
      return data as ProfileLanguage[];
    },
    enabled: !!targetId,
  });
}

export function useAddLanguage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { language: string; proficiency: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profile_languages")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id,language" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileLanguages", user?.id] });
      toast.success("Language added");
    },
  });
}

// =====================================================
// PROFILE COMPLETENESS
// =====================================================

export function useProfileCompleteness(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["profileCompleteness", targetId],
    queryFn: async () => {
      if (!targetId) return 0;
      
      const { data, error } = await supabase
        .rpc("calculate_profile_completeness", { p_user_id: targetId });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!targetId,
  });
}
