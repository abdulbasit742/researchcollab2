// Organization Types and Interfaces

export type OrganizationType = 'university' | 'department' | 'research_lab' | 'enterprise' | 'society';
export type OrgSubscriptionPlan = 'academic' | 'enterprise' | 'custom';
export type OrgMemberRole = 'org_admin' | 'faculty' | 'manager' | 'student_member';
export type BulkLicenseStatus = 'active' | 'expired' | 'pending';
export type OrgProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  country: string;
  city: string;
  adminContact: {
    name: string;
    email: string;
    phone?: string;
  };
  logo?: string;
  memberLimit: number;
  subscriptionPlan: OrgSubscriptionPlan;
  createdAt: Date;
  status: 'active' | 'suspended' | 'pending';
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: OrgMemberRole;
  joinedAt: Date;
  status: 'active' | 'invited' | 'removed';
  toolAccess: string[]; // tool IDs they have access to
  lastActive?: Date;
}

export interface BulkToolLicense {
  id: string;
  orgId: string;
  toolId: string;
  toolName: string;
  totalSeats: number;
  usedSeats: number;
  assignedMembers: string[]; // member IDs
  pricePerSeat: number;
  totalPrice: number;
  startDate: Date;
  endDate: Date;
  status: BulkLicenseStatus;
  autoRenew: boolean;
}

export interface OrgProject {
  id: string;
  orgId: string;
  title: string;
  description: string;
  numberOfStudents: number;
  budgetPerStudent: number;
  totalBudget: number;
  duration: string;
  requiredSkills: string[];
  assignedStudents: string[];
  completedCount: number;
  status: OrgProjectStatus;
  createdAt: Date;
  deadline?: Date;
}

export interface OrgInvoice {
  id: string;
  orgId: string;
  invoiceNumber: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  discountCode?: string;
  discountAmount?: number;
  notes?: string;
  createdAt: Date;
}

export interface OrgStats {
  activeMembers: number;
  activeToolSubscriptions: number;
  ongoingProjects: number;
  totalSpend: number;
  commissionEarned: number;
  pendingApprovals: number;
}

// Dummy Data
export const dummyOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'University of Engineering & Technology',
    type: 'university',
    country: 'Pakistan',
    city: 'Lahore',
    adminContact: { name: 'Dr. Ahmed Khan', email: 'ahmed.khan@uet.edu.pk', phone: '+92-300-1234567' },
    logo: undefined,
    memberLimit: 500,
    subscriptionPlan: 'academic',
    createdAt: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: 'org-2',
    name: 'FAST National University',
    type: 'university',
    country: 'Pakistan',
    city: 'Islamabad',
    adminContact: { name: 'Prof. Sara Ali', email: 'sara.ali@fast.edu.pk' },
    memberLimit: 300,
    subscriptionPlan: 'academic',
    createdAt: new Date('2024-02-20'),
    status: 'active'
  },
  {
    id: 'org-3',
    name: 'LUMS Business School',
    type: 'university',
    country: 'Pakistan',
    city: 'Lahore',
    adminContact: { name: 'Dr. Imran Shah', email: 'imran@lums.edu.pk' },
    memberLimit: 200,
    subscriptionPlan: 'enterprise',
    createdAt: new Date('2024-03-10'),
    status: 'active'
  },
  {
    id: 'org-4',
    name: 'AI Research Lab - NUST',
    type: 'research_lab',
    country: 'Pakistan',
    city: 'Islamabad',
    adminContact: { name: 'Dr. Fatima Zahra', email: 'fatima@nust.edu.pk' },
    memberLimit: 50,
    subscriptionPlan: 'academic',
    createdAt: new Date('2024-04-05'),
    status: 'active'
  },
  {
    id: 'org-5',
    name: 'TechVentures Pakistan',
    type: 'enterprise',
    country: 'Pakistan',
    city: 'Karachi',
    adminContact: { name: 'Ali Raza', email: 'ali@techventures.pk', phone: '+92-321-9876543' },
    memberLimit: 100,
    subscriptionPlan: 'enterprise',
    createdAt: new Date('2024-05-01'),
    status: 'active'
  }
];

export const dummyOrgMembers: OrgMember[] = [
  // UET Members (20)
  { id: 'mem-1', orgId: 'org-1', userId: 'user-1', userName: 'Hassan Ahmed', userEmail: 'hassan@uet.edu.pk', role: 'org_admin', joinedAt: new Date('2024-01-15'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro'], lastActive: new Date() },
  { id: 'mem-2', orgId: 'org-1', userId: 'user-2', userName: 'Ayesha Malik', userEmail: 'ayesha@uet.edu.pk', role: 'faculty', joinedAt: new Date('2024-01-20'), status: 'active', toolAccess: ['chatgpt-5-3', 'gemini-4'], lastActive: new Date() },
  { id: 'mem-3', orgId: 'org-1', userId: 'user-3', userName: 'Usman Khan', userEmail: 'usman@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-02-01'), status: 'active', toolAccess: ['chatgpt-5-3'], lastActive: new Date() },
  { id: 'mem-4', orgId: 'org-1', userId: 'user-4', userName: 'Zara Fatima', userEmail: 'zara@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-02-05'), status: 'active', toolAccess: ['chatgpt-5-3'], lastActive: new Date() },
  { id: 'mem-5', orgId: 'org-1', userId: 'user-5', userName: 'Bilal Hussain', userEmail: 'bilal@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-02-10'), status: 'active', toolAccess: ['perplexity-pro'], lastActive: new Date() },
  { id: 'mem-6', orgId: 'org-1', userId: 'user-6', userName: 'Sana Iqbal', userEmail: 'sana@uet.edu.pk', role: 'faculty', joinedAt: new Date('2024-02-15'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro'], lastActive: new Date() },
  { id: 'mem-7', orgId: 'org-1', userId: 'user-7', userName: 'Faisal Nawaz', userEmail: 'faisal@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-02-20'), status: 'active', toolAccess: ['chatgpt-5-3'] },
  { id: 'mem-8', orgId: 'org-1', userId: 'user-8', userName: 'Nimra Shah', userEmail: 'nimra@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-02-25'), status: 'active', toolAccess: ['gemini-4'] },
  { id: 'mem-9', orgId: 'org-1', userId: 'user-9', userName: 'Kamran Ali', userEmail: 'kamran@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-01'), status: 'invited', toolAccess: [] },
  { id: 'mem-10', orgId: 'org-1', userId: 'user-10', userName: 'Hira Butt', userEmail: 'hira@uet.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-05'), status: 'active', toolAccess: ['chatgpt-5-3'] },
  
  // FAST Members (15)
  { id: 'mem-11', orgId: 'org-2', userId: 'user-11', userName: 'Tariq Mahmood', userEmail: 'tariq@fast.edu.pk', role: 'org_admin', joinedAt: new Date('2024-02-20'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro', 'gemini-4'], lastActive: new Date() },
  { id: 'mem-12', orgId: 'org-2', userId: 'user-12', userName: 'Alina Zafar', userEmail: 'alina@fast.edu.pk', role: 'faculty', joinedAt: new Date('2024-02-25'), status: 'active', toolAccess: ['chatgpt-5-3'], lastActive: new Date() },
  { id: 'mem-13', orgId: 'org-2', userId: 'user-13', userName: 'Waqas Aslam', userEmail: 'waqas@fast.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-01'), status: 'active', toolAccess: ['perplexity-pro'] },
  { id: 'mem-14', orgId: 'org-2', userId: 'user-14', userName: 'Mehak Rizvi', userEmail: 'mehak@fast.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-05'), status: 'active', toolAccess: ['chatgpt-5-3'] },
  { id: 'mem-15', orgId: 'org-2', userId: 'user-15', userName: 'Salman Rafiq', userEmail: 'salman@fast.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-10'), status: 'active', toolAccess: ['gemini-4'] },
  
  // LUMS Members (12)
  { id: 'mem-16', orgId: 'org-3', userId: 'user-16', userName: 'Dr. Amjad Farooq', userEmail: 'amjad@lums.edu.pk', role: 'org_admin', joinedAt: new Date('2024-03-10'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro', 'gemini-4'], lastActive: new Date() },
  { id: 'mem-17', orgId: 'org-3', userId: 'user-17', userName: 'Rabia Sheikh', userEmail: 'rabia@lums.edu.pk', role: 'manager', joinedAt: new Date('2024-03-15'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro'] },
  { id: 'mem-18', orgId: 'org-3', userId: 'user-18', userName: 'Hamza Tariq', userEmail: 'hamza@lums.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-20'), status: 'active', toolAccess: ['chatgpt-5-3'] },
  { id: 'mem-19', orgId: 'org-3', userId: 'user-19', userName: 'Fatima Noor', userEmail: 'fatima.n@lums.edu.pk', role: 'student_member', joinedAt: new Date('2024-03-25'), status: 'active', toolAccess: ['perplexity-pro'] },
  
  // Research Lab Members (8)
  { id: 'mem-20', orgId: 'org-4', userId: 'user-20', userName: 'Dr. Naeem Akbar', userEmail: 'naeem@nust.edu.pk', role: 'org_admin', joinedAt: new Date('2024-04-05'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro', 'gemini-4'], lastActive: new Date() },
  { id: 'mem-21', orgId: 'org-4', userId: 'user-21', userName: 'Saad Ullah', userEmail: 'saad@nust.edu.pk', role: 'faculty', joinedAt: new Date('2024-04-10'), status: 'active', toolAccess: ['chatgpt-5-3', 'gemini-4'] },
  { id: 'mem-22', orgId: 'org-4', userId: 'user-22', userName: 'Amina Khalid', userEmail: 'amina@nust.edu.pk', role: 'student_member', joinedAt: new Date('2024-04-15'), status: 'active', toolAccess: ['chatgpt-5-3'] },
  
  // Enterprise Members (5)
  { id: 'mem-23', orgId: 'org-5', userId: 'user-23', userName: 'Junaid Malik', userEmail: 'junaid@techventures.pk', role: 'org_admin', joinedAt: new Date('2024-05-01'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro', 'gemini-4'], lastActive: new Date() },
  { id: 'mem-24', orgId: 'org-5', userId: 'user-24', userName: 'Sadia Mirza', userEmail: 'sadia@techventures.pk', role: 'manager', joinedAt: new Date('2024-05-05'), status: 'active', toolAccess: ['chatgpt-5-3', 'perplexity-pro'] },
  { id: 'mem-25', orgId: 'org-5', userId: 'user-25', userName: 'Asad Javed', userEmail: 'asad@techventures.pk', role: 'student_member', joinedAt: new Date('2024-05-10'), status: 'active', toolAccess: ['perplexity-pro'] },
];

export const dummyBulkLicenses: BulkToolLicense[] = [
  {
    id: 'license-1',
    orgId: 'org-1',
    toolId: 'chatgpt-5-3',
    toolName: 'ChatGPT 5.3 Pro',
    totalSeats: 50,
    usedSeats: 35,
    assignedMembers: ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-6', 'mem-7', 'mem-10'],
    pricePerSeat: 15,
    totalPrice: 750,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-02-01'),
    status: 'active',
    autoRenew: true
  },
  {
    id: 'license-2',
    orgId: 'org-1',
    toolId: 'perplexity-pro',
    toolName: 'Perplexity Pro',
    totalSeats: 25,
    usedSeats: 12,
    assignedMembers: ['mem-1', 'mem-5', 'mem-6'],
    pricePerSeat: 12,
    totalPrice: 300,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-03-01'),
    status: 'active',
    autoRenew: false
  },
  {
    id: 'license-3',
    orgId: 'org-2',
    toolId: 'chatgpt-5-3',
    toolName: 'ChatGPT 5.3 Pro',
    totalSeats: 25,
    usedSeats: 18,
    assignedMembers: ['mem-11', 'mem-12', 'mem-14'],
    pricePerSeat: 15,
    totalPrice: 375,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2025-03-15'),
    status: 'active',
    autoRenew: true
  },
  {
    id: 'license-4',
    orgId: 'org-3',
    toolId: 'gemini-4',
    toolName: 'Gemini 4 Ultra',
    totalSeats: 10,
    usedSeats: 8,
    assignedMembers: ['mem-16', 'mem-17'],
    pricePerSeat: 20,
    totalPrice: 200,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-04-01'),
    status: 'active',
    autoRenew: true
  },
  {
    id: 'license-5',
    orgId: 'org-5',
    toolId: 'perplexity-pro',
    toolName: 'Perplexity Pro',
    totalSeats: 10,
    usedSeats: 6,
    assignedMembers: ['mem-23', 'mem-24', 'mem-25'],
    pricePerSeat: 12,
    totalPrice: 120,
    startDate: new Date('2024-05-15'),
    endDate: new Date('2025-05-15'),
    status: 'active',
    autoRenew: false
  }
];

export const dummyOrgProjects: OrgProject[] = [
  {
    id: 'orgproj-1',
    orgId: 'org-1',
    title: 'FYP Research Program 2024',
    description: 'Annual final year project program for CS and EE students',
    numberOfStudents: 50,
    budgetPerStudent: 200,
    totalBudget: 10000,
    duration: '6 months',
    requiredSkills: ['Python', 'Machine Learning', 'Data Analysis'],
    assignedStudents: ['user-3', 'user-4', 'user-7', 'user-8'],
    completedCount: 12,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    deadline: new Date('2024-12-31')
  },
  {
    id: 'orgproj-2',
    orgId: 'org-1',
    title: 'AI Research Initiative',
    description: 'Cross-departmental AI research collaboration',
    numberOfStudents: 20,
    budgetPerStudent: 500,
    totalBudget: 10000,
    duration: '12 months',
    requiredSkills: ['Deep Learning', 'NLP', 'Computer Vision'],
    assignedStudents: ['user-3', 'user-4'],
    completedCount: 5,
    status: 'active',
    createdAt: new Date('2024-02-15'),
    deadline: new Date('2025-02-15')
  },
  {
    id: 'orgproj-3',
    orgId: 'org-2',
    title: 'Software Engineering Capstone',
    description: 'Industry-linked capstone projects',
    numberOfStudents: 30,
    budgetPerStudent: 150,
    totalBudget: 4500,
    duration: '4 months',
    requiredSkills: ['React', 'Node.js', 'AWS'],
    assignedStudents: ['user-13', 'user-14', 'user-15'],
    completedCount: 8,
    status: 'active',
    createdAt: new Date('2024-03-01'),
    deadline: new Date('2024-08-31')
  },
  {
    id: 'orgproj-4',
    orgId: 'org-3',
    title: 'Business Analytics Program',
    description: 'MBA analytics capstone with industry partners',
    numberOfStudents: 15,
    budgetPerStudent: 300,
    totalBudget: 4500,
    duration: '3 months',
    requiredSkills: ['Data Visualization', 'SQL', 'Tableau'],
    assignedStudents: ['user-18', 'user-19'],
    completedCount: 10,
    status: 'completed',
    createdAt: new Date('2024-02-01'),
    deadline: new Date('2024-05-31')
  },
  {
    id: 'orgproj-5',
    orgId: 'org-5',
    title: 'Product Development Internship',
    description: 'Intern-led product development cycle',
    numberOfStudents: 10,
    budgetPerStudent: 400,
    totalBudget: 4000,
    duration: '3 months',
    requiredSkills: ['Product Design', 'React', 'Agile'],
    assignedStudents: ['user-25'],
    completedCount: 3,
    status: 'active',
    createdAt: new Date('2024-05-15'),
    deadline: new Date('2024-09-15')
  }
];

export const dummyOrgInvoices: OrgInvoice[] = [
  {
    id: 'inv-1',
    orgId: 'org-1',
    invoiceNumber: 'INV-2024-001',
    amount: 1050,
    description: 'Q1 2024 - Tool Licenses & Program Setup',
    status: 'paid',
    dueDate: new Date('2024-02-28'),
    paidDate: new Date('2024-02-25'),
    items: [
      { description: 'ChatGPT 5.3 Pro - 50 seats', quantity: 50, unitPrice: 15, total: 750 },
      { description: 'Perplexity Pro - 25 seats', quantity: 25, unitPrice: 12, total: 300 }
    ],
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'inv-2',
    orgId: 'org-1',
    invoiceNumber: 'INV-2024-002',
    amount: 2000,
    description: 'FYP Research Program Setup Fee',
    status: 'paid',
    dueDate: new Date('2024-01-31'),
    paidDate: new Date('2024-01-28'),
    items: [
      { description: 'Program Setup Fee', quantity: 1, unitPrice: 2000, total: 2000 }
    ],
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'inv-3',
    orgId: 'org-2',
    invoiceNumber: 'INV-2024-003',
    amount: 375,
    description: 'Q2 2024 - ChatGPT License',
    status: 'paid',
    dueDate: new Date('2024-04-15'),
    paidDate: new Date('2024-04-10'),
    items: [
      { description: 'ChatGPT 5.3 Pro - 25 seats', quantity: 25, unitPrice: 15, total: 375 }
    ],
    createdAt: new Date('2024-03-15')
  },
  {
    id: 'inv-4',
    orgId: 'org-3',
    invoiceNumber: 'INV-2024-004',
    amount: 200,
    description: 'Gemini 4 Ultra License',
    status: 'sent',
    dueDate: new Date('2024-07-01'),
    items: [
      { description: 'Gemini 4 Ultra - 10 seats', quantity: 10, unitPrice: 20, total: 200 }
    ],
    createdAt: new Date('2024-06-01')
  },
  {
    id: 'inv-5',
    orgId: 'org-5',
    invoiceNumber: 'INV-2024-005',
    amount: 520,
    description: 'Enterprise Package - Q2',
    status: 'overdue',
    dueDate: new Date('2024-06-01'),
    items: [
      { description: 'Perplexity Pro - 10 seats', quantity: 10, unitPrice: 12, total: 120 },
      { description: 'Product Development Program Fee', quantity: 1, unitPrice: 400, total: 400 }
    ],
    createdAt: new Date('2024-05-15')
  }
];

// Helper Functions
export const getOrganizationById = (id: string): Organization | undefined => {
  return dummyOrganizations.find(org => org.id === id);
};

export const getOrgMembers = (orgId: string): OrgMember[] => {
  return dummyOrgMembers.filter(m => m.orgId === orgId);
};

export const getOrgLicenses = (orgId: string): BulkToolLicense[] => {
  return dummyBulkLicenses.filter(l => l.orgId === orgId);
};

export const getOrgProjects = (orgId: string): OrgProject[] => {
  return dummyOrgProjects.filter(p => p.orgId === orgId);
};

export const getOrgInvoices = (orgId: string): OrgInvoice[] => {
  return dummyOrgInvoices.filter(i => i.orgId === orgId);
};

export const getOrgStats = (orgId: string): OrgStats => {
  const members = getOrgMembers(orgId).filter(m => m.status === 'active');
  const licenses = getOrgLicenses(orgId).filter(l => l.status === 'active');
  const projects = getOrgProjects(orgId).filter(p => p.status === 'active');
  const invoices = getOrgInvoices(orgId);
  
  return {
    activeMembers: members.length,
    activeToolSubscriptions: licenses.length,
    ongoingProjects: projects.length,
    totalSpend: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    commissionEarned: Math.floor(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) * 0.05),
    pendingApprovals: members.filter(m => m.status === 'invited').length
  };
};

export const getOrgTypeLabel = (type: OrganizationType): string => {
  const labels: Record<OrganizationType, string> = {
    university: 'University',
    department: 'Department',
    research_lab: 'Research Lab',
    enterprise: 'Enterprise',
    society: 'Society/Club'
  };
  return labels[type];
};

export const getRoleLabel = (role: OrgMemberRole): string => {
  const labels: Record<OrgMemberRole, string> = {
    org_admin: 'Organization Admin',
    faculty: 'Faculty',
    manager: 'Manager',
    student_member: 'Student Member'
  };
  return labels[role];
};
