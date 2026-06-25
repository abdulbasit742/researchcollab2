import type { ProjectBuildTier, ProjectCreationType } from "@/config/projectCreation";

export type ProjectTemplate = {
  id: string;
  title: string;
  project_type: ProjectCreationType;
  prototype_tier: ProjectBuildTier;
  academic_department: string;
  problem_description: string;
  expected_outcomes: string;
  skills_needed: string[];
  preferred_timeline: string;
  budget_range: string;
  sponsor_type: string;
  tags: string[];
  recommended_for: string;
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "ai-attendance-system",
    title: "AI-Based Attendance & Engagement System",
    project_type: "fyp",
    prototype_tier: "mvp",
    academic_department: "Computer Science / Software Engineering",
    problem_description:
      "Build a web/mobile attendance system that uses face recognition or QR verification to reduce proxy attendance, then provides engagement analytics for teachers and departments.",
    expected_outcomes:
      "Working dashboard, attendance capture flow, analytics report, test dataset, admin controls, final FYP documentation, and demo video.",
    skills_needed: ["React", "Python", "Computer Vision", "Supabase", "Analytics"],
    preferred_timeline: "10–12 weeks",
    budget_range: "PKR 150K–250K",
    sponsor_type: "university",
    tags: ["AI", "Education", "Analytics"],
    recommended_for: "CS/SE student teams and university departments",
  },
  {
    id: "smart-irrigation-iot",
    title: "Smart Irrigation Monitoring with IoT Sensors",
    project_type: "fyp",
    prototype_tier: "prototype",
    academic_department: "Electrical / Agriculture / IoT",
    problem_description:
      "Design a low-cost irrigation monitoring prototype that reads soil moisture and environmental data, then recommends irrigation timing to reduce water waste.",
    expected_outcomes:
      "Sensor prototype, data dashboard, alert workflow, hardware test report, cost breakdown, and final demonstration package.",
    skills_needed: ["IoT", "Arduino", "Sensors", "Dashboard", "Data Analysis"],
    preferred_timeline: "6–8 weeks",
    budget_range: "PKR 50K–100K",
    sponsor_type: "industry",
    tags: ["IoT", "Agriculture", "Sustainability"],
    recommended_for: "engineering teams and agricultural pilots",
  },
  {
    id: "literature-review-gap-study",
    title: "Research Gap Analysis for AI in Healthcare",
    project_type: "research",
    prototype_tier: "prototype",
    academic_department: "Healthcare / Data Science / Research",
    problem_description:
      "Conduct a structured literature review on AI applications in healthcare, identify research gaps, compare methods, and propose a publishable study direction.",
    expected_outcomes:
      "Literature matrix, research gap map, methodology proposal, annotated references, abstract draft, and final research proposal document.",
    skills_needed: ["Literature Review", "Research Writing", "Healthcare AI", "Citation Management"],
    preferred_timeline: "6–8 weeks",
    budget_range: "PKR 50K–100K",
    sponsor_type: "researcher",
    tags: ["Research", "Healthcare", "AI"],
    recommended_for: "MS/PhD students and early research groups",
  },
  {
    id: "student-mental-health-survey",
    title: "Student Mental Health Survey & Intervention Study",
    project_type: "research",
    prototype_tier: "mvp",
    academic_department: "Psychology / Social Sciences / Data Analysis",
    problem_description:
      "Design a research study to measure student stress, academic pressure, and support needs, then analyze results and propose evidence-based interventions.",
    expected_outcomes:
      "Survey instrument, ethics-ready protocol, cleaned dataset, statistical analysis, findings report, and intervention proposal.",
    skills_needed: ["Survey Design", "SPSS", "Statistics", "Research Ethics", "Report Writing"],
    preferred_timeline: "10–12 weeks",
    budget_range: "PKR 150K–250K",
    sponsor_type: "faculty",
    tags: ["Social Science", "Survey", "Impact"],
    recommended_for: "social science departments and student affairs offices",
  },
  {
    id: "whatsapp-crm-automation",
    title: "WhatsApp CRM Automation for Local Businesses",
    project_type: "prototype",
    prototype_tier: "mvp",
    academic_department: "Business / Software / Automation",
    problem_description:
      "Build a lightweight CRM workflow that captures customer inquiries from WhatsApp, organizes leads, assigns follow-ups, and gives owners a simple sales dashboard.",
    expected_outcomes:
      "Lead capture flow, dashboard, follow-up task board, notification workflow, demo data, and deployment-ready prototype.",
    skills_needed: ["Automation", "CRM", "React", "Database", "WhatsApp Workflow"],
    preferred_timeline: "10–12 weeks",
    budget_range: "PKR 150K–250K",
    sponsor_type: "startup",
    tags: ["Automation", "CRM", "SMB"],
    recommended_for: "startup prototype builders and local business sponsors",
  },
  {
    id: "lab-inventory-system",
    title: "University Lab Inventory & Booking System",
    project_type: "prototype",
    prototype_tier: "extended",
    academic_department: "Institution Operations / Software Engineering",
    problem_description:
      "Create a system for labs to track equipment, manage booking slots, log usage, and generate maintenance or utilization reports for department admins.",
    expected_outcomes:
      "Inventory module, booking calendar, utilization reports, user roles, audit log, and admin dashboard prototype.",
    skills_needed: ["React", "Database", "Role Access", "Reports", "Calendar"],
    preferred_timeline: "14–16 weeks",
    budget_range: "PKR 300K–500K",
    sponsor_type: "institution",
    tags: ["Institution", "Operations", "SaaS"],
    recommended_for: "institution pilots and final-year software teams",
  },
];

export function getProjectTemplatesByType(type?: ProjectCreationType | null): ProjectTemplate[] {
  if (!type) return PROJECT_TEMPLATES;
  return PROJECT_TEMPLATES.filter((template) => template.project_type === type);
}

export function getProjectTemplateById(id?: string | null): ProjectTemplate | undefined {
  if (!id) return undefined;
  return PROJECT_TEMPLATES.find((template) => template.id === id);
}
