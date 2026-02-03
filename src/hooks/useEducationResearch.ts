import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for education-research bridge
export interface AcademicCourse {
  id: string;
  institution_id: string | null;
  course_code: string;
  course_title: string;
  course_type: "seminar" | "lab" | "capstone" | "thesis_support" | "research_methods" | "independent_study";
  linked_research_domains: string[];
  description: string | null;
  instructor_id: string | null;
  term: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  scholar_passport_id: string;
  role: "student" | "auditor" | "teaching_assistant";
  enrolled_at: string;
  status: "active" | "completed" | "withdrawn" | "incomplete";
  final_grade: string | null;
}

export interface SupervisionRecord {
  id: string;
  supervisor_scholar_passport_id: string;
  supervisee_scholar_passport_id: string;
  supervision_type: "undergraduate_project" | "masters_thesis" | "phd" | "postdoc" | "research_assistant";
  research_timeline_id: string | null;
  formal_agreement: string | null;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  status: "active" | "completed" | "terminated" | "on_hold";
  termination_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentResearchLink {
  id: string;
  scholar_passport_id: string;
  research_timeline_id: string;
  contribution_scope: "data_collection" | "analysis" | "literature" | "implementation" | "writing" | "methodology";
  hours_contributed: number | null;
  credited: boolean;
  credit_visibility: "public" | "collaborators" | "private";
  supervisor_approved: boolean;
  created_at: string;
}

export interface TeachingResearchOutput {
  id: string;
  course_id: string;
  output_type: "dataset" | "literature_review" | "prototype" | "pilot_study" | "analysis" | "report";
  title: string;
  description: string | null;
  linked_research_timeline_id: string | null;
  student_contributors: string[];
  published: boolean;
  created_at: string;
}

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses
  const fetchCourses = useCallback(async (filters?: {
    institutionId?: string;
    courseType?: string;
    instructorId?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from("academic_courses").select("*");
      
      if (filters?.institutionId) {
        query = query.eq("institution_id", filters.institutionId);
      }
      if (filters?.courseType) {
        query = query.eq("course_type", filters.courseType);
      }
      if (filters?.instructorId) {
        query = query.eq("instructor_id", filters.instructorId);
      }
      
      const { data, error } = await query
        .eq("is_active", true)
        .order("course_title");
      
      if (error) throw error;
      setCourses(data as AcademicCourse[]);
      return data as AcademicCourse[];
    } catch (err) {
      console.error("Error fetching courses:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create course
  const createCourse = useCallback(async (
    course: Omit<AcademicCourse, "id" | "created_at" | "is_active">
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("academic_courses")
      .insert({
        ...course,
        instructor_id: course.instructor_id || user.id,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchCourses();
    return data as AcademicCourse;
  }, [user, fetchCourses]);

  // Fetch course enrollments
  const fetchEnrollments = useCallback(async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false });
      
      if (error) throw error;
      // Map the database schema to our interface
      return (data || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        course_id: d.course_id as string,
        scholar_passport_id: d.scholar_passport_id as string || d.user_id as string,
        role: (d.role as string) || "student",
        enrolled_at: d.enrolled_at as string,
        status: d.status as string,
        final_grade: d.final_grade as string | null,
      })) as CourseEnrollment[];
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      return [];
    }
  }, []);

  // Fetch teaching research outputs
  const fetchTeachingOutputs = useCallback(async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("teaching_research_outputs")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as TeachingResearchOutput[];
    } catch (err) {
      console.error("Error fetching teaching outputs:", err);
      return [];
    }
  }, []);

  return {
    courses,
    loading,
    fetchCourses,
    createCourse,
    fetchEnrollments,
    fetchTeachingOutputs,
  };
}

export function useSupervision() {
  const { user } = useAuth();
  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch supervision records
  const fetchSupervisions = useCallback(async (role: "supervisor" | "supervisee", scholarPassportId: string) => {
    setLoading(true);
    try {
      const column = role === "supervisor" 
        ? "supervisor_scholar_passport_id" 
        : "supervisee_scholar_passport_id";
      
      const { data, error } = await supabase
        .from("supervision_records")
        .select("*")
        .eq(column, scholarPassportId)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      setSupervisions(data as SupervisionRecord[]);
      return data as SupervisionRecord[];
    } catch (err) {
      console.error("Error fetching supervisions:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create supervision record
  const createSupervision = useCallback(async (
    supervision: Omit<SupervisionRecord, "id" | "created_at" | "updated_at" | "status" | "actual_end_date" | "termination_reason">
  ) => {
    const { data, error } = await supabase
      .from("supervision_records")
      .insert({
        ...supervision,
        status: "active",
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as SupervisionRecord;
  }, []);

  // Update supervision status
  const updateSupervisionStatus = useCallback(async (
    supervisionId: string,
    status: SupervisionRecord["status"],
    terminationReason?: string
  ) => {
    const updates: Record<string, unknown> = { status };
    if (status === "completed" || status === "terminated") {
      updates.actual_end_date = new Date().toISOString().split("T")[0];
    }
    if (terminationReason) {
      updates.termination_reason = terminationReason;
    }
    
    const { error } = await supabase
      .from("supervision_records")
      .update(updates)
      .eq("id", supervisionId);
    
    if (error) throw error;
  }, []);

  return {
    supervisions,
    loading,
    fetchSupervisions,
    createSupervision,
    updateSupervisionStatus,
  };
}

export function useStudentResearch() {
  const { user } = useAuth();
  const [links, setLinks] = useState<StudentResearchLink[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch student research links
  const fetchLinks = useCallback(async (scholarPassportId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_research_links")
        .select("*")
        .eq("scholar_passport_id", scholarPassportId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLinks(data as StudentResearchLink[]);
      return data as StudentResearchLink[];
    } catch (err) {
      console.error("Error fetching student research links:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create research link
  const createLink = useCallback(async (
    link: Omit<StudentResearchLink, "id" | "created_at" | "supervisor_approved">
  ) => {
    const { data, error } = await supabase
      .from("student_research_links")
      .insert({
        ...link,
        supervisor_approved: false,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as StudentResearchLink;
  }, []);

  // Approve link (supervisor action)
  const approveLink = useCallback(async (linkId: string) => {
    const { error } = await supabase
      .from("student_research_links")
      .update({ supervisor_approved: true })
      .eq("id", linkId);
    
    if (error) throw error;
  }, []);

  return {
    links,
    loading,
    fetchLinks,
    createLink,
    approveLink,
  };
}
