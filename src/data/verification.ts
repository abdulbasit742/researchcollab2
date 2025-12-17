// Verification, Badges, and Trust Score System

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';
export type UserRole = 'student' | 'researcher' | 'affiliate' | 'partner';

export interface VerificationSubmission {
  id: string;
  userId: string;
  userRole: UserRole;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
  formData: StudentVerificationData | ResearcherVerificationData | PartnerVerificationData;
}

export interface VerificationDocument {
  id: string;
  type: 'student_id' | 'enrollment_letter' | 'cnic' | 'passport' | 'appointment_letter' | 'other';
  fileName: string;
  uploadedAt: string;
  verified: boolean;
}

export interface StudentVerificationData {
  type: 'student';
  university: string;
  studentIdNumber: string;
  semester: string;
  degreeProgram: string;
  researchLevel: 'beginner' | 'intermediate' | 'advanced' | 'publication-ready';
  cnicNumber?: string;
  orcid?: string;
}

export interface ResearcherVerificationData {
  type: 'researcher';
  institution: string;
  position: string;
  researchFields: string[];
  orcid?: string;
  publicationLinks: string[];
  institutionalEmail?: string;
  googleScholarLink?: string;
}

export interface PartnerVerificationData {
  type: 'partner';
  brandName: string;
  promotionMethod: string[];
  audienceSize?: string;
  socialLinks: { platform: string; url: string }[];
}

export type BadgeType = 
  | 'verified_student'
  | 'verified_researcher'
  | 'research_contributor'
  | 'top_performer'
  | 'trusted_affiliate'
  | 'high_completion'
  | 'partner_badge'
  | 'fast_responder'
  | 'quality_work';

export interface Badge {
  type: BadgeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const BADGES: Record<BadgeType, Badge> = {
  verified_student: {
    type: 'verified_student',
    label: 'Verified Student',
    icon: '✅',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Academic credentials verified'
  },
  verified_researcher: {
    type: 'verified_researcher',
    label: 'Verified Researcher',
    icon: '🎓',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Academic position verified'
  },
  research_contributor: {
    type: 'research_contributor',
    label: 'Research Contributor',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Active research contributions'
  },
  top_performer: {
    type: 'top_performer',
    label: 'Top Performer',
    icon: '⭐',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Consistently excellent work'
  },
  trusted_affiliate: {
    type: 'trusted_affiliate',
    label: 'Trusted Affiliate',
    icon: '🤝',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    description: 'Reliable affiliate partner'
  },
  high_completion: {
    type: 'high_completion',
    label: 'High Completion Rate',
    icon: '🏅',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: '95%+ project completion'
  },
  partner_badge: {
    type: 'partner_badge',
    label: 'Verified Partner',
    icon: '💎',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Official platform partner'
  },
  fast_responder: {
    type: 'fast_responder',
    label: 'Fast Responder',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Quick response times'
  },
  quality_work: {
    type: 'quality_work',
    label: 'Quality Work',
    icon: '💯',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    description: 'Exceptional quality standards'
  }
};

export interface TrustScore {
  total: number;
  breakdown: {
    verificationStatus: number;      // +30
    completedOffers: number;         // +20
    onTimeDeliveryRate: number;      // +15
    disputeFreeHistory: number;      // +15
    ratingsScore: number;            // +10
    accountAge: number;              // +10
  };
}

export interface UserRating {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  offerId: string;
  offerTitle: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

export interface UserTrustProfile {
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  verificationStatus: VerificationStatus;
  badges: BadgeType[];
  trustScore: TrustScore;
  ratings: UserRating[];
  completedOffers: number;
  totalOffers: number;
  onTimeDeliveryRate: number;
  disputeCount: number;
  accountCreatedAt: string;
}

// Helper functions
export const calculateTrustScore = (profile: Partial<UserTrustProfile>): TrustScore => {
  const verificationStatus = profile.verificationStatus === 'verified' ? 30 : 
                             profile.verificationStatus === 'pending' ? 10 : 0;
  
  const completedOffers = Math.min(20, (profile.completedOffers || 0) * 2);
  const onTimeDeliveryRate = Math.round((profile.onTimeDeliveryRate || 0) * 15 / 100);
  const disputeFreeHistory = profile.disputeCount === 0 ? 15 : Math.max(0, 15 - (profile.disputeCount || 0) * 5);
  
  const avgRating = profile.ratings?.length 
    ? profile.ratings.reduce((sum, r) => sum + r.rating, 0) / profile.ratings.length 
    : 0;
  const ratingsScore = Math.round(avgRating * 2);
  
  const accountAgeMonths = profile.accountCreatedAt 
    ? Math.floor((Date.now() - new Date(profile.accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const accountAge = Math.min(10, accountAgeMonths);
  
  return {
    total: verificationStatus + completedOffers + onTimeDeliveryRate + disputeFreeHistory + ratingsScore + accountAge,
    breakdown: {
      verificationStatus,
      completedOffers,
      onTimeDeliveryRate,
      disputeFreeHistory,
      ratingsScore,
      accountAge
    }
  };
};

export const getTrustLevel = (score: number): { label: string; color: string } => {
  if (score >= 75) return { label: 'High Trust', color: 'text-emerald-600' };
  if (score >= 50) return { label: 'Medium Trust', color: 'text-amber-600' };
  return { label: 'Building Trust', color: 'text-slate-500' };
};

// Dummy Data
export const dummyVerificationSubmissions: VerificationSubmission[] = [
  {
    id: 'vs1',
    userId: 's1',
    userRole: 'student',
    status: 'verified',
    submittedAt: '2024-01-15T10:00:00Z',
    reviewedAt: '2024-01-16T14:30:00Z',
    reviewedBy: 'admin1',
    documents: [
      { id: 'd1', type: 'student_id', fileName: 'student_id_front.jpg', uploadedAt: '2024-01-15T10:00:00Z', verified: true },
      { id: 'd2', type: 'student_id', fileName: 'student_id_back.jpg', uploadedAt: '2024-01-15T10:00:00Z', verified: true }
    ],
    formData: {
      type: 'student',
      university: 'MIT',
      studentIdNumber: 'MIT-2024-1234',
      semester: '6',
      degreeProgram: 'Computer Science',
      researchLevel: 'advanced',
      orcid: '0000-0001-1234-5678'
    }
  },
  {
    id: 'vs2',
    userId: 's2',
    userRole: 'student',
    status: 'verified',
    submittedAt: '2024-01-10T09:00:00Z',
    reviewedAt: '2024-01-11T11:00:00Z',
    reviewedBy: 'admin1',
    documents: [
      { id: 'd3', type: 'student_id', fileName: 'stanford_id.pdf', uploadedAt: '2024-01-10T09:00:00Z', verified: true }
    ],
    formData: {
      type: 'student',
      university: 'Stanford University',
      studentIdNumber: 'SU-2024-5678',
      semester: '8',
      degreeProgram: 'Environmental Science',
      researchLevel: 'publication-ready'
    }
  },
  {
    id: 'vs3',
    userId: 's3',
    userRole: 'student',
    status: 'pending',
    submittedAt: '2024-02-01T08:00:00Z',
    documents: [
      { id: 'd4', type: 'student_id', fileName: 'snu_card.jpg', uploadedAt: '2024-02-01T08:00:00Z', verified: false }
    ],
    formData: {
      type: 'student',
      university: 'Seoul National University',
      studentIdNumber: 'SNU-2024-9012',
      semester: '4',
      degreeProgram: 'Electrical Engineering',
      researchLevel: 'intermediate'
    }
  },
  {
    id: 'vs4',
    userId: 'r1',
    userRole: 'researcher',
    status: 'verified',
    submittedAt: '2024-01-05T12:00:00Z',
    reviewedAt: '2024-01-06T15:00:00Z',
    reviewedBy: 'admin1',
    documents: [
      { id: 'd5', type: 'appointment_letter', fileName: 'mit_appointment.pdf', uploadedAt: '2024-01-05T12:00:00Z', verified: true }
    ],
    formData: {
      type: 'researcher',
      institution: 'MIT',
      position: 'Associate Professor',
      researchFields: ['Deep Learning', 'Computer Vision', 'Healthcare AI'],
      orcid: '0000-0002-1111-2222',
      publicationLinks: ['https://doi.org/10.1234/example1', 'https://doi.org/10.1234/example2'],
      googleScholarLink: 'https://scholar.google.com/citations?user=xxx'
    }
  },
  {
    id: 'vs5',
    userId: 'p1',
    userRole: 'partner',
    status: 'verified',
    submittedAt: '2024-01-20T14:00:00Z',
    reviewedAt: '2024-01-22T10:00:00Z',
    reviewedBy: 'admin1',
    documents: [],
    formData: {
      type: 'partner',
      brandName: 'TechReview Pro',
      promotionMethod: ['content', 'youtube', 'email'],
      audienceSize: '50000+',
      socialLinks: [
        { platform: 'YouTube', url: 'https://youtube.com/@techreviewpro' },
        { platform: 'Twitter', url: 'https://twitter.com/techreviewpro' }
      ]
    }
  },
  {
    id: 'vs6',
    userId: 's6',
    userRole: 'student',
    status: 'rejected',
    submittedAt: '2024-01-25T16:00:00Z',
    reviewedAt: '2024-01-26T09:00:00Z',
    reviewedBy: 'admin1',
    rejectionReason: 'Documents are not legible. Please resubmit with clearer images.',
    documents: [
      { id: 'd6', type: 'student_id', fileName: 'blurry_id.jpg', uploadedAt: '2024-01-25T16:00:00Z', verified: false }
    ],
    formData: {
      type: 'student',
      university: 'TU Munich',
      studentIdNumber: 'TUM-2024-3456',
      semester: '6',
      degreeProgram: 'Mechanical Engineering',
      researchLevel: 'intermediate'
    }
  }
];

export const dummyUserTrustProfiles: UserTrustProfile[] = [
  {
    userId: 's1',
    userName: 'Alex Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=alex-chen',
    userRole: 'student',
    verificationStatus: 'verified',
    badges: ['verified_student', 'top_performer', 'high_completion'],
    trustScore: {
      total: 92,
      breakdown: { verificationStatus: 30, completedOffers: 20, onTimeDeliveryRate: 15, disputeFreeHistory: 15, ratingsScore: 8, accountAge: 4 }
    },
    ratings: [
      { id: 'rt1', fromUserId: 'r1', fromUserName: 'Dr. Sarah Chen', toUserId: 's1', offerId: 'o1', offerTitle: 'ML Data Analysis', rating: 5, feedback: 'Excellent work on the analysis!', createdAt: '2024-01-20' },
      { id: 'rt2', fromUserId: 'r3', fromUserName: 'Dr. Emily Rodriguez', toUserId: 's1', offerId: 'o2', offerTitle: 'Research Paper', rating: 4, feedback: 'Good quality, delivered on time.', createdAt: '2024-01-25' }
    ],
    completedOffers: 12,
    totalOffers: 13,
    onTimeDeliveryRate: 95,
    disputeCount: 0,
    accountCreatedAt: '2023-09-01'
  },
  {
    userId: 's2',
    userName: 'Maria Santos',
    userAvatar: 'https://i.pravatar.cc/150?u=maria-santos',
    userRole: 'student',
    verificationStatus: 'verified',
    badges: ['verified_student', 'research_contributor', 'quality_work'],
    trustScore: {
      total: 88,
      breakdown: { verificationStatus: 30, completedOffers: 18, onTimeDeliveryRate: 14, disputeFreeHistory: 15, ratingsScore: 9, accountAge: 2 }
    },
    ratings: [
      { id: 'rt3', fromUserId: 'r5', fromUserName: 'Dr. Anna Schmidt', toUserId: 's2', offerId: 'o3', offerTitle: 'Climate Data Study', rating: 5, feedback: 'Outstanding research quality!', createdAt: '2024-02-01' }
    ],
    completedOffers: 9,
    totalOffers: 10,
    onTimeDeliveryRate: 90,
    disputeCount: 0,
    accountCreatedAt: '2023-11-01'
  },
  {
    userId: 's3',
    userName: 'James Park',
    userAvatar: 'https://i.pravatar.cc/150?u=james-park',
    userRole: 'student',
    verificationStatus: 'pending',
    badges: ['fast_responder'],
    trustScore: {
      total: 45,
      breakdown: { verificationStatus: 10, completedOffers: 8, onTimeDeliveryRate: 12, disputeFreeHistory: 10, ratingsScore: 4, accountAge: 1 }
    },
    ratings: [
      { id: 'rt4', fromUserId: 'r7', fromUserName: 'Dr. Hiroshi Yamamoto', toUserId: 's3', offerId: 'o4', offerTitle: 'IoT Project', rating: 4, createdAt: '2024-01-15' }
    ],
    completedOffers: 4,
    totalOffers: 5,
    onTimeDeliveryRate: 80,
    disputeCount: 1,
    accountCreatedAt: '2024-01-01'
  },
  {
    userId: 's4',
    userName: 'Emma Wilson',
    userAvatar: 'https://i.pravatar.cc/150?u=emma-wilson',
    userRole: 'student',
    verificationStatus: 'verified',
    badges: ['verified_student', 'high_completion'],
    trustScore: {
      total: 78,
      breakdown: { verificationStatus: 30, completedOffers: 14, onTimeDeliveryRate: 13, disputeFreeHistory: 15, ratingsScore: 4, accountAge: 2 }
    },
    ratings: [
      { id: 'rt5', fromUserId: 'r6', fromUserName: 'Prof. David Lee', toUserId: 's4', offerId: 'o5', offerTitle: 'Psychology Survey', rating: 4, feedback: 'Well-executed study design.', createdAt: '2024-01-28' }
    ],
    completedOffers: 7,
    totalOffers: 7,
    onTimeDeliveryRate: 85,
    disputeCount: 0,
    accountCreatedAt: '2023-10-01'
  },
  {
    userId: 's5',
    userName: 'Ahmed Hassan',
    userAvatar: 'https://i.pravatar.cc/150?u=ahmed-hassan',
    userRole: 'student',
    verificationStatus: 'verified',
    badges: ['verified_student', 'top_performer'],
    trustScore: {
      total: 85,
      breakdown: { verificationStatus: 30, completedOffers: 16, onTimeDeliveryRate: 14, disputeFreeHistory: 15, ratingsScore: 7, accountAge: 3 }
    },
    ratings: [
      { id: 'rt6', fromUserId: 'r2', fromUserName: 'Prof. James Wilson', toUserId: 's5', offerId: 'o6', offerTitle: 'Quantum Algorithm', rating: 5, feedback: 'Brilliant implementation!', createdAt: '2024-02-05' }
    ],
    completedOffers: 8,
    totalOffers: 8,
    onTimeDeliveryRate: 92,
    disputeCount: 0,
    accountCreatedAt: '2023-08-01'
  },
  {
    userId: 'r1',
    userName: 'Dr. Sarah Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=dr-sarah-chen',
    userRole: 'researcher',
    verificationStatus: 'verified',
    badges: ['verified_researcher', 'research_contributor', 'top_performer'],
    trustScore: {
      total: 95,
      breakdown: { verificationStatus: 30, completedOffers: 20, onTimeDeliveryRate: 15, disputeFreeHistory: 15, ratingsScore: 10, accountAge: 5 }
    },
    ratings: [
      { id: 'rt7', fromUserId: 's1', fromUserName: 'Alex Chen', toUserId: 'r1', offerId: 'o1', offerTitle: 'ML Data Analysis', rating: 5, feedback: 'Great mentor and collaborator!', createdAt: '2024-01-21' }
    ],
    completedOffers: 15,
    totalOffers: 15,
    onTimeDeliveryRate: 100,
    disputeCount: 0,
    accountCreatedAt: '2023-06-01'
  },
  {
    userId: 'r2',
    userName: 'Prof. James Wilson',
    userAvatar: 'https://i.pravatar.cc/150?u=prof-james-wilson',
    userRole: 'researcher',
    verificationStatus: 'verified',
    badges: ['verified_researcher', 'quality_work'],
    trustScore: {
      total: 90,
      breakdown: { verificationStatus: 30, completedOffers: 18, onTimeDeliveryRate: 15, disputeFreeHistory: 15, ratingsScore: 9, accountAge: 3 }
    },
    ratings: [],
    completedOffers: 10,
    totalOffers: 10,
    onTimeDeliveryRate: 100,
    disputeCount: 0,
    accountCreatedAt: '2023-07-01'
  },
  {
    userId: 'p1',
    userName: 'TechReview Pro',
    userAvatar: 'https://i.pravatar.cc/150?u=techreview-pro',
    userRole: 'partner',
    verificationStatus: 'verified',
    badges: ['partner_badge', 'trusted_affiliate'],
    trustScore: {
      total: 82,
      breakdown: { verificationStatus: 30, completedOffers: 16, onTimeDeliveryRate: 12, disputeFreeHistory: 15, ratingsScore: 6, accountAge: 3 }
    },
    ratings: [],
    completedOffers: 8,
    totalOffers: 8,
    onTimeDeliveryRate: 80,
    disputeCount: 0,
    accountCreatedAt: '2023-08-15'
  }
];

export const dummyRatings: UserRating[] = [
  { id: 'rt1', fromUserId: 'r1', fromUserName: 'Dr. Sarah Chen', toUserId: 's1', offerId: 'o1', offerTitle: 'ML Data Analysis', rating: 5, feedback: 'Excellent work on the analysis! Very thorough and professional.', createdAt: '2024-01-20' },
  { id: 'rt2', fromUserId: 'r3', fromUserName: 'Dr. Emily Rodriguez', toUserId: 's1', offerId: 'o2', offerTitle: 'Research Paper', rating: 4, feedback: 'Good quality, delivered on time. Would work with again.', createdAt: '2024-01-25' },
  { id: 'rt3', fromUserId: 'r5', fromUserName: 'Dr. Anna Schmidt', toUserId: 's2', offerId: 'o3', offerTitle: 'Climate Data Study', rating: 5, feedback: 'Outstanding research quality! Maria exceeded expectations.', createdAt: '2024-02-01' },
  { id: 'rt4', fromUserId: 'r7', fromUserName: 'Dr. Hiroshi Yamamoto', toUserId: 's3', offerId: 'o4', offerTitle: 'IoT Project', rating: 4, createdAt: '2024-01-15' },
  { id: 'rt5', fromUserId: 'r6', fromUserName: 'Prof. David Lee', toUserId: 's4', offerId: 'o5', offerTitle: 'Psychology Survey', rating: 4, feedback: 'Well-executed study design. Good attention to detail.', createdAt: '2024-01-28' },
  { id: 'rt6', fromUserId: 'r2', fromUserName: 'Prof. James Wilson', toUserId: 's5', offerId: 'o6', offerTitle: 'Quantum Algorithm', rating: 5, feedback: 'Brilliant implementation! Ahmed has a deep understanding of quantum computing.', createdAt: '2024-02-05' },
  { id: 'rt7', fromUserId: 's1', fromUserName: 'Alex Chen', toUserId: 'r1', offerId: 'o1', offerTitle: 'ML Data Analysis', rating: 5, feedback: 'Great mentor and collaborator! Very supportive throughout the project.', createdAt: '2024-01-21' },
  { id: 'rt8', fromUserId: 's2', fromUserName: 'Maria Santos', toUserId: 'r5', offerId: 'o3', offerTitle: 'Climate Data Study', rating: 5, feedback: 'Wonderful experience working with Dr. Schmidt.', createdAt: '2024-02-02' },
  { id: 'rt9', fromUserId: 's4', fromUserName: 'Emma Wilson', toUserId: 'r6', offerId: 'o5', offerTitle: 'Psychology Survey', rating: 5, feedback: 'Prof. Lee provided excellent guidance.', createdAt: '2024-01-29' },
  { id: 'rt10', fromUserId: 's9', fromUserName: 'Yuki Tanaka', toUserId: 'r2', offerId: 'o7', offerTitle: 'Economic Analysis', rating: 4, feedback: 'Very insightful collaboration.', createdAt: '2024-02-08' },
  { id: 'rt11', fromUserId: 's7', fromUserName: 'Priya Sharma', toUserId: 'r1', offerId: 'o8', offerTitle: 'Data Science Tutorial', rating: 5, feedback: 'Learned so much from this collaboration!', createdAt: '2024-02-10' },
  { id: 'rt12', fromUserId: 'r4', fromUserName: 'Dr. Michael Park', toUserId: 's12', offerId: 'o9', offerTitle: 'NLP Research', rating: 4, feedback: 'Good work on the linguistic analysis.', createdAt: '2024-02-12' }
];
