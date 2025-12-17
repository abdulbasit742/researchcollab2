// AI Project Scoping Types and Data

export type ProjectType = 'fyp' | 'research_paper' | 'data_analysis' | 'app_development' | 'design_ui' | 'other';
export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced' | 'research_grade';
export type TeamPreference = 'solo' | 'team' | 'researcher_student' | 'organization';
export type RiskLevel = 'low' | 'medium' | 'high';
export type DeadlineUrgency = 'flexible' | 'standard' | 'urgent' | 'critical';

export interface ProjectScope {
  id: string;
  projectType: ProjectType;
  complexityLevel: ComplexityLevel;
  title: string;
  description: string;
  deliverables: string[];
  techTools: string[];
  deadlineUrgency: DeadlineUrgency;
  teamPreference: TeamPreference;
  createdAt: Date;
}

export interface AIEstimate {
  effortHours: number;
  effortWeeks: number;
  suggestedTeamSize: number;
  suggestedResearchLevel: string;
  riskLevel: RiskLevel;
  explanation: string;
  confidenceScore: number;
}

export interface PricingEstimate {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  platformCommission: number;
  netToProvider: number;
  factors: {
    name: string;
    impact: string;
    description: string;
  }[];
}

export interface AutoMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  durationDays: number;
  order: number;
}

export interface TalentSuggestion {
  userId: string;
  name: string;
  matchScore: number;
  trustScore: number;
  skills: string[];
  completedProjects: number;
  isVerified: boolean;
  hourlyRate: number;
}

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  reason: string;
  timeSaved: string;
  monthlyCost: number;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface AIScopedProject {
  id: string;
  scope: ProjectScope;
  estimate: AIEstimate;
  pricing: PricingEstimate;
  milestones: AutoMilestone[];
  talentSuggestions: TalentSuggestion[];
  toolRecommendations: ToolRecommendation[];
  status: 'draft' | 'published' | 'accepted' | 'in_progress' | 'completed';
  pricingAccepted: boolean;
  adjustedPrice?: number;
  createdAt: Date;
}

export interface AIPricingConfig {
  category: ProjectType;
  baseRatePerHour: number;
  complexityMultipliers: Record<ComplexityLevel, number>;
  urgencyMultipliers: Record<DeadlineUrgency, number>;
  priceFloor: number;
  priceCeiling: number;
  enabled: boolean;
}

// Project Type Labels
export const projectTypeLabels: Record<ProjectType, string> = {
  fyp: 'Final Year Project (FYP)',
  research_paper: 'Research Paper',
  data_analysis: 'Data Analysis',
  app_development: 'App / Web Development',
  design_ui: 'Design / UI',
  other: 'Other'
};

export const complexityLabels: Record<ComplexityLevel, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  research_grade: 'Research-grade / Publication'
};

export const teamPreferenceLabels: Record<TeamPreference, string> = {
  solo: 'Solo Student',
  team: 'Team',
  researcher_student: 'Researcher + Student',
  organization: 'Organization Program'
};

export const urgencyLabels: Record<DeadlineUrgency, string> = {
  flexible: 'Flexible (2+ months)',
  standard: 'Standard (1-2 months)',
  urgent: 'Urgent (2-4 weeks)',
  critical: 'Critical (<2 weeks)'
};

// Deliverables Options
export const deliverableOptions: Record<ProjectType, string[]> = {
  fyp: ['Project Report', 'Source Code', 'Documentation', 'Presentation', 'Demo Video', 'Poster'],
  research_paper: ['Literature Review', 'Methodology', 'Data Collection', 'Analysis', 'Draft Paper', 'Final Paper'],
  data_analysis: ['Data Cleaning', 'Exploratory Analysis', 'Visualizations', 'Statistical Report', 'Dashboard'],
  app_development: ['UI/UX Design', 'Frontend', 'Backend', 'Database', 'API', 'Testing', 'Deployment'],
  design_ui: ['Wireframes', 'Mockups', 'Prototype', 'Design System', 'Assets'],
  other: ['Initial Research', 'Draft Deliverable', 'Final Deliverable', 'Documentation']
};

// Base Pricing Configuration
export const defaultPricingConfig: AIPricingConfig[] = [
  { category: 'fyp', baseRatePerHour: 15, complexityMultipliers: { basic: 1, intermediate: 1.5, advanced: 2, research_grade: 2.5 }, urgencyMultipliers: { flexible: 0.9, standard: 1, urgent: 1.3, critical: 1.6 }, priceFloor: 100, priceCeiling: 5000, enabled: true },
  { category: 'research_paper', baseRatePerHour: 20, complexityMultipliers: { basic: 1, intermediate: 1.5, advanced: 2.2, research_grade: 3 }, urgencyMultipliers: { flexible: 0.9, standard: 1, urgent: 1.4, critical: 1.8 }, priceFloor: 150, priceCeiling: 8000, enabled: true },
  { category: 'data_analysis', baseRatePerHour: 18, complexityMultipliers: { basic: 1, intermediate: 1.4, advanced: 1.8, research_grade: 2.5 }, urgencyMultipliers: { flexible: 0.9, standard: 1, urgent: 1.3, critical: 1.5 }, priceFloor: 80, priceCeiling: 4000, enabled: true },
  { category: 'app_development', baseRatePerHour: 25, complexityMultipliers: { basic: 1, intermediate: 1.5, advanced: 2.2, research_grade: 3 }, urgencyMultipliers: { flexible: 0.85, standard: 1, urgent: 1.4, critical: 1.7 }, priceFloor: 200, priceCeiling: 10000, enabled: true },
  { category: 'design_ui', baseRatePerHour: 20, complexityMultipliers: { basic: 1, intermediate: 1.3, advanced: 1.7, research_grade: 2 }, urgencyMultipliers: { flexible: 0.9, standard: 1, urgent: 1.25, critical: 1.5 }, priceFloor: 100, priceCeiling: 3000, enabled: true },
  { category: 'other', baseRatePerHour: 15, complexityMultipliers: { basic: 1, intermediate: 1.4, advanced: 1.8, research_grade: 2.2 }, urgencyMultipliers: { flexible: 0.9, standard: 1, urgent: 1.3, critical: 1.5 }, priceFloor: 50, priceCeiling: 5000, enabled: true }
];

// Dummy AI Scoped Projects
export const dummyAIScopedProjects: AIScopedProject[] = [
  {
    id: 'aiscope-1',
    scope: {
      id: 'scope-1',
      projectType: 'fyp',
      complexityLevel: 'advanced',
      title: 'AI-Powered Student Performance Prediction System',
      description: 'Develop a machine learning system to predict student academic performance based on historical data',
      deliverables: ['Project Report', 'Source Code', 'Documentation', 'Presentation'],
      techTools: ['Python', 'TensorFlow', 'Pandas', 'Flask'],
      deadlineUrgency: 'standard',
      teamPreference: 'team',
      createdAt: new Date('2024-05-01')
    },
    estimate: {
      effortHours: 120,
      effortWeeks: 8,
      suggestedTeamSize: 2,
      suggestedResearchLevel: 'Advanced',
      riskLevel: 'medium',
      explanation: 'This project requires significant ML expertise and data preprocessing. The 8-week timeline allows for iterative model improvement.',
      confidenceScore: 85
    },
    pricing: {
      minPrice: 800,
      maxPrice: 1200,
      recommendedPrice: 1000,
      platformCommission: 100,
      netToProvider: 900,
      factors: [
        { name: 'Complexity', impact: '+40%', description: 'Advanced ML implementation' },
        { name: 'Team Size', impact: '+20%', description: 'Requires 2 developers' },
        { name: 'Timeline', impact: '0%', description: 'Standard deadline' }
      ]
    },
    milestones: [
      { id: 'ms-1-1', title: 'Data Collection & Preprocessing', description: 'Gather and clean student data', amount: 200, durationDays: 14, order: 1 },
      { id: 'ms-1-2', title: 'Model Development', description: 'Build and train ML models', amount: 400, durationDays: 21, order: 2 },
      { id: 'ms-1-3', title: 'Integration & Testing', description: 'Build web interface and test', amount: 250, durationDays: 14, order: 3 },
      { id: 'ms-1-4', title: 'Documentation & Delivery', description: 'Complete documentation and presentation', amount: 150, durationDays: 7, order: 4 }
    ],
    talentSuggestions: [
      { userId: 'user-1', name: 'Hassan Ahmed', matchScore: 92, trustScore: 88, skills: ['Python', 'Machine Learning', 'TensorFlow'], completedProjects: 15, isVerified: true, hourlyRate: 18 },
      { userId: 'user-2', name: 'Ayesha Malik', matchScore: 87, trustScore: 92, skills: ['Data Science', 'Python', 'Statistics'], completedProjects: 12, isVerified: true, hourlyRate: 20 }
    ],
    toolRecommendations: [
      { toolId: 'chatgpt-5-3', toolName: 'ChatGPT 5.3 Pro', reason: 'Code assistance and documentation help', timeSaved: '~15 hours', monthlyCost: 25, priority: 'recommended' },
      { toolId: 'perplexity-pro', toolName: 'Perplexity Pro', reason: 'Research and literature review', timeSaved: '~8 hours', monthlyCost: 20, priority: 'optional' }
    ],
    status: 'published',
    pricingAccepted: true,
    createdAt: new Date('2024-05-01')
  },
  {
    id: 'aiscope-2',
    scope: {
      id: 'scope-2',
      projectType: 'research_paper',
      complexityLevel: 'research_grade',
      title: 'Systematic Review: AI in Healthcare Diagnostics',
      description: 'Comprehensive systematic literature review on AI applications in medical diagnostics',
      deliverables: ['Literature Review', 'Methodology', 'Analysis', 'Final Paper'],
      techTools: ['NVIVO', 'Mendeley', 'SPSS'],
      deadlineUrgency: 'flexible',
      teamPreference: 'researcher_student',
      createdAt: new Date('2024-04-15')
    },
    estimate: {
      effortHours: 200,
      effortWeeks: 12,
      suggestedTeamSize: 2,
      suggestedResearchLevel: 'Publication-ready',
      riskLevel: 'medium',
      explanation: 'Systematic reviews require extensive literature search and rigorous methodology. Researcher supervision recommended.',
      confidenceScore: 78
    },
    pricing: {
      minPrice: 1500,
      maxPrice: 2500,
      recommendedPrice: 2000,
      platformCommission: 200,
      netToProvider: 1800,
      factors: [
        { name: 'Research Grade', impact: '+60%', description: 'Publication-quality standards' },
        { name: 'Flexible Timeline', impact: '-10%', description: 'No rush delivery' },
        { name: 'Collaboration', impact: '+15%', description: 'Researcher + student team' }
      ]
    },
    milestones: [
      { id: 'ms-2-1', title: 'Protocol Development', description: 'Define search strategy and inclusion criteria', amount: 300, durationDays: 14, order: 1 },
      { id: 'ms-2-2', title: 'Literature Search', description: 'Comprehensive database search', amount: 400, durationDays: 21, order: 2 },
      { id: 'ms-2-3', title: 'Data Extraction & Analysis', description: 'Extract and synthesize findings', amount: 600, durationDays: 28, order: 3 },
      { id: 'ms-2-4', title: 'Paper Writing', description: 'Draft and revise manuscript', amount: 700, durationDays: 21, order: 4 }
    ],
    talentSuggestions: [
      { userId: 'user-3', name: 'Dr. Fatima Zahra', matchScore: 95, trustScore: 96, skills: ['Systematic Reviews', 'Healthcare Research', 'NVIVO'], completedProjects: 28, isVerified: true, hourlyRate: 35 }
    ],
    toolRecommendations: [
      { toolId: 'perplexity-pro', toolName: 'Perplexity Pro', reason: 'Academic research and paper finding', timeSaved: '~20 hours', monthlyCost: 20, priority: 'essential' }
    ],
    status: 'in_progress',
    pricingAccepted: true,
    createdAt: new Date('2024-04-15')
  },
  {
    id: 'aiscope-3',
    scope: {
      id: 'scope-3',
      projectType: 'app_development',
      complexityLevel: 'intermediate',
      title: 'E-Commerce Mobile App',
      description: 'Build a React Native e-commerce app with payment integration',
      deliverables: ['UI/UX Design', 'Frontend', 'Backend', 'API', 'Testing'],
      techTools: ['React Native', 'Node.js', 'MongoDB', 'Stripe'],
      deadlineUrgency: 'urgent',
      teamPreference: 'team',
      createdAt: new Date('2024-05-20')
    },
    estimate: {
      effortHours: 160,
      effortWeeks: 4,
      suggestedTeamSize: 3,
      suggestedResearchLevel: 'Intermediate',
      riskLevel: 'high',
      explanation: 'Tight deadline for a full-stack mobile app. Requires experienced team and parallel development.',
      confidenceScore: 72
    },
    pricing: {
      minPrice: 2500,
      maxPrice: 4000,
      recommendedPrice: 3200,
      platformCommission: 320,
      netToProvider: 2880,
      factors: [
        { name: 'Full-Stack', impact: '+50%', description: 'Mobile + backend development' },
        { name: 'Urgent Timeline', impact: '+40%', description: 'Rush delivery required' },
        { name: 'Payment Integration', impact: '+20%', description: 'Stripe integration complexity' }
      ]
    },
    milestones: [
      { id: 'ms-3-1', title: 'Design & Architecture', description: 'UI/UX design and system architecture', amount: 600, durationDays: 7, order: 1 },
      { id: 'ms-3-2', title: 'Core Development', description: 'Build main app features', amount: 1400, durationDays: 14, order: 2 },
      { id: 'ms-3-3', title: 'Payment & Testing', description: 'Integrate Stripe and QA testing', amount: 800, durationDays: 5, order: 3 },
      { id: 'ms-3-4', title: 'Deployment', description: 'App store submission and launch', amount: 400, durationDays: 2, order: 4 }
    ],
    talentSuggestions: [
      { userId: 'user-4', name: 'Usman Khan', matchScore: 89, trustScore: 85, skills: ['React Native', 'Node.js', 'MongoDB'], completedProjects: 18, isVerified: true, hourlyRate: 25 }
    ],
    toolRecommendations: [
      { toolId: 'chatgpt-5-3', toolName: 'ChatGPT 5.3 Pro', reason: 'Accelerate coding and debugging', timeSaved: '~25 hours', monthlyCost: 25, priority: 'essential' },
      { toolId: 'gemini-4', toolName: 'Gemini 4 Ultra', reason: 'Code review and optimization', timeSaved: '~10 hours', monthlyCost: 30, priority: 'recommended' }
    ],
    status: 'draft',
    pricingAccepted: false,
    adjustedPrice: 2800,
    createdAt: new Date('2024-05-20')
  },
  {
    id: 'aiscope-4',
    scope: {
      id: 'scope-4',
      projectType: 'data_analysis',
      complexityLevel: 'basic',
      title: 'Sales Data Dashboard',
      description: 'Create interactive dashboard for sales performance tracking',
      deliverables: ['Data Cleaning', 'Visualizations', 'Dashboard'],
      techTools: ['Python', 'Tableau', 'Excel'],
      deadlineUrgency: 'flexible',
      teamPreference: 'solo',
      createdAt: new Date('2024-05-25')
    },
    estimate: {
      effortHours: 40,
      effortWeeks: 2,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Basic',
      riskLevel: 'low',
      explanation: 'Straightforward dashboard project with standard tools. Low complexity and flexible timeline.',
      confidenceScore: 92
    },
    pricing: {
      minPrice: 200,
      maxPrice: 400,
      recommendedPrice: 300,
      platformCommission: 30,
      netToProvider: 270,
      factors: [
        { name: 'Basic Complexity', impact: '0%', description: 'Standard dashboard work' },
        { name: 'Flexible Timeline', impact: '-10%', description: 'No rush needed' },
        { name: 'Solo Work', impact: '0%', description: 'Single developer sufficient' }
      ]
    },
    milestones: [
      { id: 'ms-4-1', title: 'Data Preparation', description: 'Clean and structure sales data', amount: 100, durationDays: 5, order: 1 },
      { id: 'ms-4-2', title: 'Dashboard Development', description: 'Build interactive visualizations', amount: 150, durationDays: 7, order: 2 },
      { id: 'ms-4-3', title: 'Delivery & Training', description: 'Final delivery and user guide', amount: 50, durationDays: 2, order: 3 }
    ],
    talentSuggestions: [
      { userId: 'user-5', name: 'Sana Iqbal', matchScore: 94, trustScore: 90, skills: ['Tableau', 'Excel', 'Data Visualization'], completedProjects: 22, isVerified: true, hourlyRate: 12 }
    ],
    toolRecommendations: [],
    status: 'completed',
    pricingAccepted: true,
    createdAt: new Date('2024-05-25')
  },
  {
    id: 'aiscope-5',
    scope: {
      id: 'scope-5',
      projectType: 'design_ui',
      complexityLevel: 'intermediate',
      title: 'SaaS Platform Redesign',
      description: 'Complete UI/UX redesign of existing B2B SaaS platform',
      deliverables: ['Wireframes', 'Mockups', 'Prototype', 'Design System'],
      techTools: ['Figma', 'Adobe XD'],
      deadlineUrgency: 'standard',
      teamPreference: 'solo',
      createdAt: new Date('2024-06-01')
    },
    estimate: {
      effortHours: 80,
      effortWeeks: 4,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Intermediate',
      riskLevel: 'low',
      explanation: 'Design-focused project with clear deliverables. Standard timeline allows for iteration.',
      confidenceScore: 88
    },
    pricing: {
      minPrice: 600,
      maxPrice: 1000,
      recommendedPrice: 800,
      platformCommission: 80,
      netToProvider: 720,
      factors: [
        { name: 'Design System', impact: '+30%', description: 'Full design system creation' },
        { name: 'Prototype', impact: '+20%', description: 'Interactive prototype included' }
      ]
    },
    milestones: [
      { id: 'ms-5-1', title: 'Research & Wireframes', description: 'User research and initial wireframes', amount: 200, durationDays: 7, order: 1 },
      { id: 'ms-5-2', title: 'High-Fidelity Mockups', description: 'Detailed UI designs', amount: 300, durationDays: 10, order: 2 },
      { id: 'ms-5-3', title: 'Prototype & Design System', description: 'Interactive prototype and component library', amount: 300, durationDays: 11, order: 3 }
    ],
    talentSuggestions: [
      { userId: 'user-6', name: 'Zara Fatima', matchScore: 91, trustScore: 87, skills: ['Figma', 'UI/UX', 'Design Systems'], completedProjects: 30, isVerified: true, hourlyRate: 15 }
    ],
    toolRecommendations: [
      { toolId: 'gemini-4', toolName: 'Gemini 4 Ultra', reason: 'Design feedback and iteration', timeSaved: '~5 hours', monthlyCost: 30, priority: 'optional' }
    ],
    status: 'published',
    pricingAccepted: true,
    createdAt: new Date('2024-06-01')
  },
  // Additional projects for variety
  {
    id: 'aiscope-6',
    scope: {
      id: 'scope-6',
      projectType: 'fyp',
      complexityLevel: 'basic',
      title: 'Library Management System',
      description: 'Simple web-based library management system for university',
      deliverables: ['Source Code', 'Documentation', 'Presentation'],
      techTools: ['PHP', 'MySQL', 'Bootstrap'],
      deadlineUrgency: 'flexible',
      teamPreference: 'solo',
      createdAt: new Date('2024-06-05')
    },
    estimate: {
      effortHours: 60,
      effortWeeks: 4,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Basic',
      riskLevel: 'low',
      explanation: 'Standard CRUD application with well-documented requirements.',
      confidenceScore: 95
    },
    pricing: {
      minPrice: 250,
      maxPrice: 450,
      recommendedPrice: 350,
      platformCommission: 35,
      netToProvider: 315,
      factors: [
        { name: 'Basic Complexity', impact: '0%', description: 'Standard web application' }
      ]
    },
    milestones: [
      { id: 'ms-6-1', title: 'Database & Backend', description: 'Set up database and core backend', amount: 150, durationDays: 10, order: 1 },
      { id: 'ms-6-2', title: 'Frontend & Integration', description: 'Build UI and integrate', amount: 150, durationDays: 12, order: 2 },
      { id: 'ms-6-3', title: 'Documentation', description: 'Complete project documentation', amount: 50, durationDays: 6, order: 3 }
    ],
    talentSuggestions: [],
    toolRecommendations: [],
    status: 'completed',
    pricingAccepted: true,
    createdAt: new Date('2024-06-05')
  },
  {
    id: 'aiscope-7',
    scope: {
      id: 'scope-7',
      projectType: 'research_paper',
      complexityLevel: 'advanced',
      title: 'Machine Learning in Financial Forecasting',
      description: 'Research paper exploring ML models for stock price prediction',
      deliverables: ['Literature Review', 'Methodology', 'Analysis', 'Draft Paper'],
      techTools: ['Python', 'TensorFlow', 'LaTeX'],
      deadlineUrgency: 'standard',
      teamPreference: 'researcher_student',
      createdAt: new Date('2024-06-10')
    },
    estimate: {
      effortHours: 150,
      effortWeeks: 8,
      suggestedTeamSize: 2,
      suggestedResearchLevel: 'Advanced',
      riskLevel: 'medium',
      explanation: 'Combines quantitative research with ML implementation. Requires domain expertise.',
      confidenceScore: 80
    },
    pricing: {
      minPrice: 1200,
      maxPrice: 1800,
      recommendedPrice: 1500,
      platformCommission: 150,
      netToProvider: 1350,
      factors: [
        { name: 'Advanced Research', impact: '+45%', description: 'Complex methodology required' },
        { name: 'ML Implementation', impact: '+25%', description: 'Working code expected' }
      ]
    },
    milestones: [
      { id: 'ms-7-1', title: 'Literature Review', description: 'Comprehensive review of existing work', amount: 300, durationDays: 14, order: 1 },
      { id: 'ms-7-2', title: 'Model Development', description: 'Build and train forecasting models', amount: 600, durationDays: 21, order: 2 },
      { id: 'ms-7-3', title: 'Analysis & Writing', description: 'Analyze results and write paper', amount: 600, durationDays: 21, order: 3 }
    ],
    talentSuggestions: [],
    toolRecommendations: [
      { toolId: 'chatgpt-5-3', toolName: 'ChatGPT 5.3 Pro', reason: 'Code assistance and paper writing', timeSaved: '~20 hours', monthlyCost: 25, priority: 'recommended' },
      { toolId: 'perplexity-pro', toolName: 'Perplexity Pro', reason: 'Research and literature search', timeSaved: '~15 hours', monthlyCost: 20, priority: 'essential' }
    ],
    status: 'in_progress',
    pricingAccepted: true,
    createdAt: new Date('2024-06-10')
  },
  {
    id: 'aiscope-8',
    scope: {
      id: 'scope-8',
      projectType: 'app_development',
      complexityLevel: 'basic',
      title: 'Task Management Chrome Extension',
      description: 'Simple Chrome extension for managing daily tasks',
      deliverables: ['Source Code', 'Documentation'],
      techTools: ['JavaScript', 'Chrome API', 'HTML/CSS'],
      deadlineUrgency: 'flexible',
      teamPreference: 'solo',
      createdAt: new Date('2024-06-12')
    },
    estimate: {
      effortHours: 30,
      effortWeeks: 2,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Basic',
      riskLevel: 'low',
      explanation: 'Small-scope browser extension with clear requirements.',
      confidenceScore: 94
    },
    pricing: {
      minPrice: 150,
      maxPrice: 300,
      recommendedPrice: 200,
      platformCommission: 20,
      netToProvider: 180,
      factors: [
        { name: 'Small Scope', impact: '-20%', description: 'Limited feature set' }
      ]
    },
    milestones: [
      { id: 'ms-8-1', title: 'Core Development', description: 'Build extension functionality', amount: 150, durationDays: 10, order: 1 },
      { id: 'ms-8-2', title: 'Polish & Delivery', description: 'UI polish and documentation', amount: 50, durationDays: 4, order: 2 }
    ],
    talentSuggestions: [],
    toolRecommendations: [],
    status: 'published',
    pricingAccepted: true,
    createdAt: new Date('2024-06-12')
  },
  {
    id: 'aiscope-9',
    scope: {
      id: 'scope-9',
      projectType: 'data_analysis',
      complexityLevel: 'advanced',
      title: 'Customer Churn Prediction Model',
      description: 'Build ML model to predict customer churn for telecom company',
      deliverables: ['Data Cleaning', 'Exploratory Analysis', 'Statistical Report', 'Dashboard'],
      techTools: ['Python', 'Scikit-learn', 'Power BI'],
      deadlineUrgency: 'urgent',
      teamPreference: 'team',
      createdAt: new Date('2024-06-15')
    },
    estimate: {
      effortHours: 100,
      effortWeeks: 3,
      suggestedTeamSize: 2,
      suggestedResearchLevel: 'Advanced',
      riskLevel: 'medium',
      explanation: 'Complex ML project with tight deadline. Requires data science expertise.',
      confidenceScore: 82
    },
    pricing: {
      minPrice: 1000,
      maxPrice: 1600,
      recommendedPrice: 1300,
      platformCommission: 130,
      netToProvider: 1170,
      factors: [
        { name: 'ML Modeling', impact: '+40%', description: 'Predictive modeling required' },
        { name: 'Urgent Timeline', impact: '+30%', description: 'Rush delivery' }
      ]
    },
    milestones: [
      { id: 'ms-9-1', title: 'Data Prep & EDA', description: 'Clean data and exploratory analysis', amount: 400, durationDays: 7, order: 1 },
      { id: 'ms-9-2', title: 'Model Building', description: 'Train and validate churn model', amount: 600, durationDays: 10, order: 2 },
      { id: 'ms-9-3', title: 'Dashboard & Report', description: 'Build dashboard and final report', amount: 300, durationDays: 4, order: 3 }
    ],
    talentSuggestions: [],
    toolRecommendations: [
      { toolId: 'chatgpt-5-3', toolName: 'ChatGPT 5.3 Pro', reason: 'Code optimization and debugging', timeSaved: '~12 hours', monthlyCost: 25, priority: 'recommended' }
    ],
    status: 'accepted',
    pricingAccepted: true,
    createdAt: new Date('2024-06-15')
  },
  {
    id: 'aiscope-10',
    scope: {
      id: 'scope-10',
      projectType: 'design_ui',
      complexityLevel: 'basic',
      title: 'Mobile App UI Mockups',
      description: 'Create UI mockups for fitness tracking mobile app',
      deliverables: ['Mockups'],
      techTools: ['Figma'],
      deadlineUrgency: 'standard',
      teamPreference: 'solo',
      createdAt: new Date('2024-06-18')
    },
    estimate: {
      effortHours: 25,
      effortWeeks: 1,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Basic',
      riskLevel: 'low',
      explanation: 'Simple mockup project with single deliverable.',
      confidenceScore: 96
    },
    pricing: {
      minPrice: 150,
      maxPrice: 300,
      recommendedPrice: 200,
      platformCommission: 20,
      netToProvider: 180,
      factors: [
        { name: 'Simple Scope', impact: '-15%', description: 'Mockups only, no prototype' }
      ]
    },
    milestones: [
      { id: 'ms-10-1', title: 'UI Mockups', description: 'Design all app screens', amount: 200, durationDays: 7, order: 1 }
    ],
    talentSuggestions: [],
    toolRecommendations: [],
    status: 'completed',
    pricingAccepted: true,
    createdAt: new Date('2024-06-18')
  },
  {
    id: 'aiscope-11',
    scope: {
      id: 'scope-11',
      projectType: 'fyp',
      complexityLevel: 'research_grade',
      title: 'Blockchain-Based Voting System',
      description: 'Develop secure blockchain voting system with research paper',
      deliverables: ['Project Report', 'Source Code', 'Documentation', 'Presentation', 'Demo Video'],
      techTools: ['Solidity', 'Ethereum', 'React', 'Node.js'],
      deadlineUrgency: 'standard',
      teamPreference: 'team',
      createdAt: new Date('2024-06-20')
    },
    estimate: {
      effortHours: 250,
      effortWeeks: 12,
      suggestedTeamSize: 3,
      suggestedResearchLevel: 'Publication-ready',
      riskLevel: 'high',
      explanation: 'Complex blockchain project with research component. Requires specialized expertise.',
      confidenceScore: 70
    },
    pricing: {
      minPrice: 2500,
      maxPrice: 4000,
      recommendedPrice: 3200,
      platformCommission: 320,
      netToProvider: 2880,
      factors: [
        { name: 'Blockchain', impact: '+60%', description: 'Specialized technology' },
        { name: 'Research Grade', impact: '+50%', description: 'Publication quality expected' },
        { name: 'Full Stack', impact: '+30%', description: 'Complete system development' }
      ]
    },
    milestones: [
      { id: 'ms-11-1', title: 'Research & Design', description: 'Literature review and system design', amount: 500, durationDays: 21, order: 1 },
      { id: 'ms-11-2', title: 'Smart Contracts', description: 'Develop and audit smart contracts', amount: 1000, durationDays: 28, order: 2 },
      { id: 'ms-11-3', title: 'Frontend & Integration', description: 'Build web interface', amount: 900, durationDays: 21, order: 3 },
      { id: 'ms-11-4', title: 'Testing & Documentation', description: 'Security testing and paper writing', amount: 800, durationDays: 14, order: 4 }
    ],
    talentSuggestions: [],
    toolRecommendations: [
      { toolId: 'chatgpt-5-3', toolName: 'ChatGPT 5.3 Pro', reason: 'Smart contract development assistance', timeSaved: '~30 hours', monthlyCost: 25, priority: 'essential' },
      { toolId: 'perplexity-pro', toolName: 'Perplexity Pro', reason: 'Blockchain research and best practices', timeSaved: '~15 hours', monthlyCost: 20, priority: 'recommended' }
    ],
    status: 'draft',
    pricingAccepted: false,
    createdAt: new Date('2024-06-20')
  },
  {
    id: 'aiscope-12',
    scope: {
      id: 'scope-12',
      projectType: 'other',
      complexityLevel: 'intermediate',
      title: 'Technical Content Writing - AI Tools Guide',
      description: 'Write comprehensive guide on AI productivity tools for researchers',
      deliverables: ['Initial Research', 'Draft Deliverable', 'Final Deliverable'],
      techTools: ['Google Docs', 'Notion'],
      deadlineUrgency: 'flexible',
      teamPreference: 'solo',
      createdAt: new Date('2024-06-22')
    },
    estimate: {
      effortHours: 50,
      effortWeeks: 3,
      suggestedTeamSize: 1,
      suggestedResearchLevel: 'Intermediate',
      riskLevel: 'low',
      explanation: 'Content writing project requiring research and clear communication skills.',
      confidenceScore: 90
    },
    pricing: {
      minPrice: 300,
      maxPrice: 500,
      recommendedPrice: 400,
      platformCommission: 40,
      netToProvider: 360,
      factors: [
        { name: 'Research Required', impact: '+20%', description: 'Technical research needed' },
        { name: 'Flexible Timeline', impact: '-10%', description: 'No rush' }
      ]
    },
    milestones: [
      { id: 'ms-12-1', title: 'Research & Outline', description: 'Research tools and create outline', amount: 100, durationDays: 7, order: 1 },
      { id: 'ms-12-2', title: 'First Draft', description: 'Write complete first draft', amount: 200, durationDays: 10, order: 2 },
      { id: 'ms-12-3', title: 'Final Version', description: 'Revisions and final delivery', amount: 100, durationDays: 4, order: 3 }
    ],
    talentSuggestions: [],
    toolRecommendations: [
      { toolId: 'perplexity-pro', toolName: 'Perplexity Pro', reason: 'Tool research and fact-checking', timeSaved: '~8 hours', monthlyCost: 20, priority: 'recommended' }
    ],
    status: 'published',
    pricingAccepted: true,
    createdAt: new Date('2024-06-22')
  }
];

// Helper Functions
export const generateEstimate = (scope: ProjectScope): AIEstimate => {
  const baseHours: Record<ProjectType, number> = {
    fyp: 80, research_paper: 100, data_analysis: 50, app_development: 100, design_ui: 40, other: 40
  };
  const complexityMultipliers: Record<ComplexityLevel, number> = {
    basic: 0.7, intermediate: 1, advanced: 1.5, research_grade: 2
  };
  const urgencyMultipliers: Record<DeadlineUrgency, number> = {
    flexible: 1, standard: 1, urgent: 0.8, critical: 0.6
  };

  const hours = baseHours[scope.projectType] * complexityMultipliers[scope.complexityLevel];
  const weeks = Math.ceil(hours / 20 * urgencyMultipliers[scope.deadlineUrgency]);
  
  const teamSize = scope.teamPreference === 'solo' ? 1 : 
                   scope.teamPreference === 'team' ? 2 : 
                   scope.teamPreference === 'researcher_student' ? 2 : 3;

  const riskLevel: RiskLevel = 
    scope.complexityLevel === 'research_grade' || scope.deadlineUrgency === 'critical' ? 'high' :
    scope.complexityLevel === 'advanced' || scope.deadlineUrgency === 'urgent' ? 'medium' : 'low';

  return {
    effortHours: Math.round(hours),
    effortWeeks: weeks,
    suggestedTeamSize: teamSize,
    suggestedResearchLevel: complexityLabels[scope.complexityLevel],
    riskLevel,
    explanation: `Based on ${projectTypeLabels[scope.projectType]} with ${complexityLabels[scope.complexityLevel].toLowerCase()} complexity. ${scope.deliverables.length} deliverables identified.`,
    confidenceScore: riskLevel === 'low' ? 90 : riskLevel === 'medium' ? 80 : 70
  };
};

export const generatePricing = (scope: ProjectScope, estimate: AIEstimate): PricingEstimate => {
  const config = defaultPricingConfig.find(c => c.category === scope.projectType) || defaultPricingConfig[5];
  
  const basePrice = estimate.effortHours * config.baseRatePerHour;
  const complexityAdjusted = basePrice * config.complexityMultipliers[scope.complexityLevel];
  const urgencyAdjusted = complexityAdjusted * config.urgencyMultipliers[scope.deadlineUrgency];
  
  const recommended = Math.max(config.priceFloor, Math.min(config.priceCeiling, Math.round(urgencyAdjusted)));
  const minPrice = Math.round(recommended * 0.8);
  const maxPrice = Math.round(recommended * 1.2);
  const commission = Math.round(recommended * 0.1);

  return {
    minPrice,
    maxPrice,
    recommendedPrice: recommended,
    platformCommission: commission,
    netToProvider: recommended - commission,
    factors: [
      { name: 'Complexity', impact: `+${Math.round((config.complexityMultipliers[scope.complexityLevel] - 1) * 100)}%`, description: `${complexityLabels[scope.complexityLevel]} level work` },
      { name: 'Timeline', impact: `${config.urgencyMultipliers[scope.deadlineUrgency] >= 1 ? '+' : ''}${Math.round((config.urgencyMultipliers[scope.deadlineUrgency] - 1) * 100)}%`, description: urgencyLabels[scope.deadlineUrgency] }
    ]
  };
};

export const generateMilestones = (scope: ProjectScope, pricing: PricingEstimate): AutoMilestone[] => {
  const deliverables = scope.deliverables;
  const totalAmount = pricing.recommendedPrice;
  const count = Math.min(deliverables.length, 4);
  const amountPerMilestone = Math.floor(totalAmount / count);
  const remainder = totalAmount - (amountPerMilestone * count);

  return deliverables.slice(0, count).map((deliverable, index) => ({
    id: `auto-ms-${Date.now()}-${index}`,
    title: deliverable,
    description: `Complete ${deliverable.toLowerCase()} phase`,
    amount: index === count - 1 ? amountPerMilestone + remainder : amountPerMilestone,
    durationDays: Math.ceil(28 / count),
    order: index + 1
  }));
};

// Stats
export const getAIScopingStats = () => {
  const total = dummyAIScopedProjects.length;
  const accepted = dummyAIScopedProjects.filter(p => p.pricingAccepted).length;
  const overridden = dummyAIScopedProjects.filter(p => !p.pricingAccepted && p.adjustedPrice).length;
  
  return {
    totalProjects: total,
    pricingAcceptanceRate: Math.round((accepted / total) * 100),
    overrideRate: Math.round((overridden / total) * 100),
    avgConfidence: Math.round(dummyAIScopedProjects.reduce((sum, p) => sum + p.estimate.confidenceScore, 0) / total),
    byType: Object.keys(projectTypeLabels).map(type => ({
      type,
      label: projectTypeLabels[type as ProjectType],
      count: dummyAIScopedProjects.filter(p => p.scope.projectType === type).length
    }))
  };
};
