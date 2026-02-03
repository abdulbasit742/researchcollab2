import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  level: string;
  language: string;
  thumbnail_url: string | null;
  instructor_user_id: string | null;
  instructor_org_id: string | null;
  price: number;
  estimated_hours: number | null;
  is_published: boolean;
  is_featured: boolean;
  total_enrollments: number;
  avg_rating: number;
  created_at: string;
  instructor?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  module_order: number;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: string;
  content_url: string | null;
  content_text: string | null;
  lesson_order: number;
  duration_minutes: number | null;
  is_preview: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: string;
  progress_percent: number;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface CourseCertificate {
  id: string;
  course_id: string;
  user_id: string;
  certificate_number: string;
  verification_hash: string;
  issued_at: string;
  certificate_url: string | null;
  is_revoked: boolean;
}

export function useCourses(filters?: {
  category?: string;
  level?: string;
  search?: string;
  featured?: boolean;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      let query = supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.level) {
        query = query.eq("level", filters.level);
      }
      if (filters?.featured) {
        query = query.eq("is_featured", true);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch instructor info separately
      const coursesWithInstructors = await Promise.all(
        (data || []).map(async (course: any) => {
          if (course.instructor_user_id) {
            const { data: instructor } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", course.instructor_user_id)
              .maybeSingle();
            return { ...course, instructor } as Course;
          }
          return course as Course;
        })
      );
      
      setCourses(coursesWithInstructors);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.level, filters?.search, filters?.featured]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
}

export function useCourseDetails(courseIdOrSlug: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseIdOrSlug) {
        setCourse(null);
        setLoading(false);
        return;
      }

      try {
        // Check if it's a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrSlug);
        
        let query = supabase.from("courses").select("*");
        
        if (isUUID) {
          query = query.eq("id", courseIdOrSlug);
        } else {
          query = query.eq("slug", courseIdOrSlug);
        }

        const { data: courseData, error } = await query.maybeSingle();
        if (error) throw error;
        
        if (!courseData) {
          setCourse(null);
          setLoading(false);
          return;
        }

        // Fetch instructor
        let instructor = null;
        if (courseData.instructor_user_id) {
          const { data: instructorData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", courseData.instructor_user_id)
            .maybeSingle();
          instructor = instructorData;
        }

        // Fetch modules with lessons
        const { data: modulesData } = await supabase
          .from("course_modules")
          .select("*")
          .eq("course_id", courseData.id)
          .order("module_order", { ascending: true });

        const modulesWithLessons = await Promise.all(
          (modulesData || []).map(async (module) => {
            const { data: lessonsData } = await supabase
              .from("course_lessons")
              .select("*")
              .eq("module_id", module.id)
              .order("lesson_order", { ascending: true });
            return { ...module, lessons: lessonsData || [] } as CourseModule;
          })
        );

        setCourse({
          ...courseData,
          instructor,
          modules: modulesWithLessons,
        } as Course);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseIdOrSlug]);

  return { course, loading };
}

export function useCourseEnrollment(courseId: string | undefined) {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrollment = useCallback(async () => {
    if (!user || !courseId) {
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setEnrollment(data as CourseEnrollment | null);
    } catch (err) {
      console.error("Error fetching enrollment:", err);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const enroll = async () => {
    if (!user || !courseId) {
      toast.error("Please sign in to enroll");
      return { success: false };
    }

    try {
      const { error } = await supabase.from("course_enrollments").insert({
        course_id: courseId,
        user_id: user.id,
        status: "enrolled",
      });

      if (error) throw error;

      toast.success("Successfully enrolled!");
      await fetchEnrollment();
      return { success: true };
    } catch (err: any) {
      if (err.code === "23505") {
        toast.error("You are already enrolled in this course");
      } else {
        toast.error("Failed to enroll");
      }
      return { success: false, error: err.message };
    }
  };

  const dropCourse = async () => {
    if (!enrollment) return { success: false };

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ status: "dropped" })
        .eq("id", enrollment.id);

      if (error) throw error;

      toast.success("Course dropped");
      await fetchEnrollment();
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to drop course");
      return { success: false, error: err.message };
    }
  };

  return {
    enrollment,
    isEnrolled: enrollment !== null && enrollment.status !== "dropped",
    loading,
    refetch: fetchEnrollment,
    enroll,
    dropCourse,
  };
}

export function useLessonProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user || !courseId) {
      setProgress(new Map());
      setLoading(false);
      return;
    }

    try {
      // Get all lessons for this course
      const { data: modules, error: modulesError } = await supabase
        .from("course_modules")
        .select("id")
        .eq("course_id", courseId);

      if (modulesError) throw modulesError;

      const moduleIds = modules?.map((m) => m.id) || [];
      if (moduleIds.length === 0) {
        setProgress(new Map());
        setLoading(false);
        return;
      }

      const { data: lessons, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("id")
        .in("module_id", moduleIds);

      if (lessonsError) throw lessonsError;

      const lessonIds = lessons?.map((l) => l.id) || [];
      if (lessonIds.length === 0) {
        setProgress(new Map());
        setLoading(false);
        return;
      }

      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      if (progressError) throw progressError;

      const progressMap = new Map<string, boolean>();
      (progressData || []).forEach((p) => {
        progressMap.set(p.lesson_id, p.completed);
      });

      setProgress(progressMap);
    } catch (err) {
      console.error("Error fetching lesson progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          lesson_id: lessonId,
          user_id: user.id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "lesson_id,user_id" }
      );

      if (error) throw error;

      setProgress((prev) => new Map(prev).set(lessonId, true));
      return { success: true };
    } catch (err: any) {
      console.error("Error marking lesson complete:", err);
      return { success: false, error: err.message };
    }
  };

  const completedCount = Array.from(progress.values()).filter(Boolean).length;
  const totalLessons = progress.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    progress,
    completedCount,
    totalLessons,
    progressPercent,
    loading,
    refetch: fetchProgress,
    markLessonComplete,
  };
}

export function useMyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "dropped")
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      
      // Fetch course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        (data || []).map(async (enrollment) => {
          const { data: courseData } = await supabase
            .from("courses")
            .select("*")
            .eq("id", enrollment.course_id)
            .maybeSingle();
          
          let instructor = null;
          if (courseData?.instructor_user_id) {
            const { data: instructorData } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", courseData.instructor_user_id)
              .maybeSingle();
            instructor = instructorData;
          }
          
          return {
            ...enrollment,
            course: courseData ? { ...courseData, instructor } : undefined,
          } as CourseEnrollment;
        })
      );
      
      setEnrollments(enrollmentsWithCourses);
    } catch (err) {
      console.error("Error fetching my courses:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    inProgress: enrollments.filter((e) => e.status === "in_progress" || e.status === "enrolled"),
    completed: enrollments.filter((e) => e.status === "completed"),
    loading,
    refetch: fetchEnrollments,
  };
}

export function useMyCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CourseCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("course_certificates")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_revoked", false)
          .order("issued_at", { ascending: false });

        if (error) throw error;
        setCertificates((data || []) as CourseCertificate[]);
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  return { certificates, loading };
}

export function useCourseReviews(courseId: string | undefined) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!courseId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", review.user_id)
            .maybeSingle();
          return { ...review, user: userData };
        })
      );
      
      setReviews(reviewsWithUsers);

      // Find user's review
      if (user) {
        const myReview = reviewsWithUsers?.find((r) => r.user_id === user.id);
        setUserReview(myReview || null);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (rating: number, reviewText?: string) => {
    if (!user || !courseId) {
      toast.error("Please sign in to review");
      return { success: false };
    }

    try {
      const { error } = await supabase.from("course_reviews").upsert(
        {
          course_id: courseId,
          user_id: user.id,
          rating,
          review_text: reviewText,
        },
        { onConflict: "course_id,user_id" }
      );

      if (error) throw error;

      toast.success("Review submitted!");
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to submit review");
      return { success: false, error: err.message };
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    userReview,
    avgRating,
    totalReviews: reviews.length,
    loading,
    refetch: fetchReviews,
    submitReview,
  };
}
