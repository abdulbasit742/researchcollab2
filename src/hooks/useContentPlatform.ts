import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Publishing System
interface Publication {
  id: string;
  title: string;
  type: "article" | "research" | "case_study" | "tutorial" | "whitepaper";
  content: string;
  summary: string;
  authors: Author[];
  status: "draft" | "review" | "published" | "archived";
  visibility: "public" | "connections" | "private";
  publishedAt?: Date;
  updatedAt: Date;
  tags: string[];
  metrics: PublicationMetrics;
  doi?: string;
  citations: Citation[];
}

interface Author {
  id: string;
  name: string;
  contribution: string;
  order: number;
  isCorresponding: boolean;
}

interface PublicationMetrics {
  views: number;
  reads: number;
  shares: number;
  citations: number;
  bookmarks: number;
  comments: number;
}

interface Citation {
  id: string;
  title: string;
  authors: string[];
  source: string;
  year: number;
  url?: string;
}

export function usePublishing() {
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: "1", title: "Advances in Neural Architecture Search", type: "research",
      content: "Full research paper content...", summary: "Novel approaches to automated ML model design",
      authors: [
        { id: "a1", name: "You", contribution: "Lead author, methodology", order: 1, isCorresponding: true },
        { id: "a2", name: "Dr. Sarah Chen", contribution: "Supervision, review", order: 2, isCorresponding: false },
      ],
      status: "published", visibility: "public", publishedAt: new Date("2024-01-15"),
      updatedAt: new Date(), tags: ["AI", "NAS", "AutoML"],
      metrics: { views: 2450, reads: 890, shares: 45, citations: 12, bookmarks: 156, comments: 23 },
      doi: "10.1234/example.2024.001",
      citations: [
        { id: "c1", title: "Deep Learning", authors: ["Goodfellow", "Bengio", "Courville"], source: "MIT Press", year: 2016 },
      ],
    },
  ]);

  const [drafts, setDrafts] = useState<Partial<Publication>[]>([
    {
      id: "d1", title: "Work in Progress: LLM Optimization", type: "article",
      content: "Draft content...", status: "draft", tags: ["LLM", "Optimization"],
    },
  ]);

  const createPublication = useCallback((publication: Omit<Publication, "id" | "status" | "metrics" | "updatedAt">) => {
    const newPub: Publication = {
      ...publication,
      id: crypto.randomUUID(),
      status: "draft",
      updatedAt: new Date(),
      metrics: { views: 0, reads: 0, shares: 0, citations: 0, bookmarks: 0, comments: 0 },
    };
    setPublications(prev => [newPub, ...prev]);
    return newPub;
  }, []);

  const publish = useCallback((publicationId: string) => {
    setPublications(prev => prev.map(p =>
      p.id === publicationId ? { ...p, status: "published", publishedAt: new Date() } : p
    ));
  }, []);

  return { publications, drafts, createPublication, publish };
}

// Learning Platform
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  duration: string;
  modules: CourseModule[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  tags: string[];
  isEnrolled: boolean;
  progress?: number;
  certificate?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
  order: number;
  isCompleted: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz" | "assignment" | "discussion";
  duration: string;
  content?: string;
  isCompleted: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  estimatedDuration: string;
  skills: string[];
  progress: number;
}

export function useLearning() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1", title: "Advanced Machine Learning", description: "Master ML techniques used in industry",
      instructor: "Dr. Andrew Chen", instructorId: "i1", level: "advanced",
      duration: "40 hours",
      modules: [
        {
          id: "m1", title: "Neural Networks Deep Dive", description: "Advanced NN concepts",
          duration: "8 hours", order: 1, isCompleted: true,
          lessons: [
            { id: "l1", title: "Backpropagation Internals", type: "video", duration: "45 min", isCompleted: true },
            { id: "l2", title: "Optimization Algorithms", type: "reading", duration: "30 min", isCompleted: true },
            { id: "l3", title: "Knowledge Check", type: "quiz", duration: "15 min", isCompleted: true },
          ],
        },
        {
          id: "m2", title: "Attention Mechanisms", description: "Transformers and attention",
          duration: "10 hours", order: 2, isCompleted: false,
          lessons: [
            { id: "l4", title: "Self-Attention Explained", type: "video", duration: "60 min", isCompleted: true },
            { id: "l5", title: "Implementing Transformers", type: "assignment", duration: "3 hours", isCompleted: false },
          ],
        },
      ],
      enrollmentCount: 3450, rating: 4.8, reviewCount: 890, price: 199, currency: "USD",
      tags: ["ML", "Deep Learning", "AI"], isEnrolled: true, progress: 45, certificate: true,
    },
  ]);

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: "1", title: "ML Engineer Path", description: "Become a production ML engineer",
      courses: ["1", "2", "3"], estimatedDuration: "120 hours",
      skills: ["Python", "TensorFlow", "MLOps", "Cloud"], progress: 35,
    },
  ]);

  const enrollInCourse = useCallback((courseId: string) => {
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, isEnrolled: true, progress: 0, enrollmentCount: c.enrollmentCount + 1 } : c
    ));
  }, []);

  const completeLesson = useCallback((courseId: string, moduleId: string, lessonId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const modules = c.modules.map(m => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l);
        const isCompleted = lessons.every(l => l.isCompleted);
        return { ...m, lessons, isCompleted };
      });
      const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.isCompleted).length, 0);
      return { ...c, modules, progress: Math.round((completedLessons / totalLessons) * 100) };
    }));
  }, []);

  return { courses, learningPaths, enrollInCourse, completeLesson };
}

// Knowledge Graph
interface KnowledgeNode {
  id: string;
  label: string;
  type: "concept" | "skill" | "topic" | "person" | "project" | "publication";
  description?: string;
  importance: number;
  mastery?: number;
  connections: number;
}

interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: "requires" | "enables" | "related_to" | "part_of" | "authored_by" | "uses";
  strength: number;
}

interface KnowledgeInsight {
  type: "gap" | "opportunity" | "strength" | "recommendation";
  title: string;
  description: string;
  nodes: string[];
  priority: number;
}

export function useKnowledgeGraph() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([
    { id: "1", label: "Machine Learning", type: "topic", importance: 95, mastery: 85, connections: 15 },
    { id: "2", label: "Python", type: "skill", importance: 90, mastery: 92, connections: 20 },
    { id: "3", label: "Deep Learning", type: "topic", importance: 88, mastery: 78, connections: 12 },
    { id: "4", label: "TensorFlow", type: "skill", importance: 75, mastery: 70, connections: 8 },
    { id: "5", label: "Natural Language Processing", type: "topic", importance: 82, mastery: 65, connections: 10 },
    { id: "6", label: "Computer Vision", type: "topic", importance: 78, mastery: 55, connections: 7 },
  ]);

  const [edges, setEdges] = useState<KnowledgeEdge[]>([
    { id: "e1", sourceId: "2", targetId: "1", relationship: "enables", strength: 0.9 },
    { id: "e2", sourceId: "1", targetId: "3", relationship: "part_of", strength: 0.85 },
    { id: "e3", sourceId: "3", targetId: "4", relationship: "uses", strength: 0.8 },
    { id: "e4", sourceId: "3", targetId: "5", relationship: "enables", strength: 0.75 },
    { id: "e5", sourceId: "3", targetId: "6", relationship: "enables", strength: 0.7 },
  ]);

  const insights = useMemo<KnowledgeInsight[]>(() => {
    const gaps = nodes.filter(n => n.mastery && n.mastery < 60 && n.importance > 70);
    const strengths = nodes.filter(n => n.mastery && n.mastery >= 80);
    
    return [
      ...gaps.map(n => ({
        type: "gap" as const,
        title: `Skill Gap: ${n.label}`,
        description: `Your mastery (${n.mastery}%) is below the importance level (${n.importance}%)`,
        nodes: [n.id],
        priority: n.importance - (n.mastery || 0),
      })),
      ...strengths.slice(0, 3).map(n => ({
        type: "strength" as const,
        title: `Core Strength: ${n.label}`,
        description: `Strong mastery at ${n.mastery}% - leverage this in opportunities`,
        nodes: [n.id],
        priority: n.mastery || 0,
      })),
    ];
  }, [nodes]);

  const updateMastery = useCallback((nodeId: string, mastery: number) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, mastery: Math.min(100, Math.max(0, mastery)) } : n
    ));
  }, []);

  return { nodes, edges, insights, updateMastery };
}

// Content Moderation
interface ModerationQueue {
  id: string;
  contentId: string;
  contentType: "post" | "comment" | "publication" | "profile" | "message";
  contentPreview: string;
  authorId: string;
  authorName: string;
  reportCount: number;
  reports: ModerationReport[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected" | "escalated";
  assignedTo?: string;
  createdAt: Date;
}

interface ModerationReport {
  id: string;
  reporterId: string;
  reason: "spam" | "harassment" | "misinformation" | "inappropriate" | "copyright" | "other";
  description?: string;
  createdAt: Date;
}

interface ModerationAction {
  id: string;
  queueId: string;
  action: "approve" | "remove" | "warn" | "suspend" | "escalate";
  moderatorId: string;
  reason: string;
  createdAt: Date;
}

export function useContentModeration() {
  const [queue, setQueue] = useState<ModerationQueue[]>([
    {
      id: "1", contentId: "c1", contentType: "post",
      contentPreview: "Reported content preview...",
      authorId: "u1", authorName: "John Doe",
      reportCount: 3,
      reports: [
        { id: "r1", reporterId: "u2", reason: "spam", createdAt: new Date() },
        { id: "r2", reporterId: "u3", reason: "misinformation", description: "Contains false claims", createdAt: new Date() },
      ],
      priority: "medium", status: "pending", createdAt: new Date(),
    },
  ]);

  const [actions, setActions] = useState<ModerationAction[]>([]);

  const takeAction = useCallback((queueId: string, action: ModerationAction["action"], reason: string) => {
    const moderationAction: ModerationAction = {
      id: crypto.randomUUID(),
      queueId,
      action,
      moderatorId: "me",
      reason,
      createdAt: new Date(),
    };
    setActions(prev => [moderationAction, ...prev]);
    setQueue(prev => prev.map(q =>
      q.id === queueId ? {
        ...q,
        status: action === "approve" ? "approved" : action === "escalate" ? "escalated" : "rejected",
      } : q
    ));
    return moderationAction;
  }, []);

  const pendingCount = useMemo(() =>
    queue.filter(q => q.status === "pending").length,
    [queue]
  );

  return { queue, actions, takeAction, pendingCount };
}

// Bookmark & Reading List
interface Bookmark {
  id: string;
  contentId: string;
  contentType: "article" | "publication" | "course" | "opportunity" | "profile";
  title: string;
  summary?: string;
  url: string;
  tags: string[];
  notes?: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  readAt?: Date;
  listId?: string;
}

interface ReadingList {
  id: string;
  name: string;
  description?: string;
  visibility: "private" | "public" | "shared";
  itemCount: number;
  createdAt: Date;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: "1", contentId: "p1", contentType: "publication",
      title: "Attention Is All You Need", summary: "Transformer architecture paper",
      url: "/publications/1", tags: ["AI", "Transformers", "Must-Read"],
      isRead: true, priority: "high", createdAt: new Date("2024-01-01"), readAt: new Date("2024-01-05"),
    },
    {
      id: "2", contentId: "c1", contentType: "course",
      title: "Advanced PyTorch", url: "/courses/1", tags: ["PyTorch", "Deep Learning"],
      isRead: false, priority: "medium", createdAt: new Date(),
    },
  ]);

  const [lists, setLists] = useState<ReadingList[]>([
    { id: "1", name: "Research Papers", description: "Important papers to read", visibility: "private", itemCount: 12, createdAt: new Date() },
    { id: "2", name: "Learning Queue", visibility: "private", itemCount: 5, createdAt: new Date() },
  ]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "createdAt" | "isRead">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    return newBookmark;
  }, []);

  const markAsRead = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.map(b =>
      b.id === bookmarkId ? { ...b, isRead: true, readAt: new Date() } : b
    ));
  }, []);

  const unreadCount = useMemo(() =>
    bookmarks.filter(b => !b.isRead).length,
    [bookmarks]
  );

  return { bookmarks, lists, addBookmark, markAsRead, unreadCount };
}

// Content Templates
interface ContentTemplate {
  id: string;
  name: string;
  type: "bio" | "proposal" | "message" | "post" | "email" | "contract";
  category: string;
  content: string;
  variables: TemplateVariable[];
  useCount: number;
  rating: number;
  isCustom: boolean;
  createdAt: Date;
}

interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export function useContentTemplates() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([
    {
      id: "1", name: "Professional Bio", type: "bio", category: "Profile",
      content: "{{name}} is a {{role}} with {{years}} years of experience in {{field}}. Specializing in {{specialties}}, they have {{achievement}}.",
      variables: [
        { name: "name", placeholder: "{{name}}", description: "Your full name", required: true },
        { name: "role", placeholder: "{{role}}", description: "Your job title", required: true },
        { name: "years", placeholder: "{{years}}", description: "Years of experience", required: true },
        { name: "field", placeholder: "{{field}}", description: "Your field", required: true },
        { name: "specialties", placeholder: "{{specialties}}", description: "Your specialties", required: false },
        { name: "achievement", placeholder: "{{achievement}}", description: "Key achievement", required: false },
      ],
      useCount: 245, rating: 4.7, isCustom: false, createdAt: new Date(),
    },
    {
      id: "2", name: "Project Proposal", type: "proposal", category: "Business",
      content: "Dear {{client}},\n\nI'm excited to submit my proposal for {{project}}...",
      variables: [
        { name: "client", placeholder: "{{client}}", description: "Client name", required: true },
        { name: "project", placeholder: "{{project}}", description: "Project name", required: true },
      ],
      useCount: 189, rating: 4.5, isCustom: false, createdAt: new Date(),
    },
  ]);

  const applyTemplate = useCallback((templateId: string, values: Record<string, string>) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;
    
    let result = template.content;
    template.variables.forEach(v => {
      const value = values[v.name] || v.defaultValue || v.placeholder;
      result = result.replace(new RegExp(v.placeholder, 'g'), value);
    });
    
    // Update use count
    setTemplates(prev => prev.map(t =>
      t.id === templateId ? { ...t, useCount: t.useCount + 1 } : t
    ));
    
    return result;
  }, [templates]);

  return { templates, applyTemplate };
}
