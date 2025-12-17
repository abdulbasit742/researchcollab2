// Dummy users data for matching system
export interface StudentProfile {
  id: string;
  type: "student";
  name: string;
  avatar: string;
  university: string;
  department: string;
  location: string;
  semester: number;
  cgpa?: number;
  researchLevel: "beginner" | "intermediate" | "advanced" | "publication-ready";
  backgroundSummary: string;
  researchInterests: string[];
  passionAreas: string[];
  preferredDomain: "academia" | "industry" | "both";
  goals: string[];
  skills: string[];
  servicesOffered: string[];
  hourlyRate?: number;
  availability: string;
  projects: { title: string; description: string; link?: string }[];
  verified: boolean;
  orcid?: string;
}

export interface ResearcherProfile {
  id: string;
  type: "researcher";
  name: string;
  avatar: string;
  title: string;
  university: string;
  department: string;
  location: string;
  discipline: string;
  researchInterests: string[];
  collaborationType: string[];
  availability: string;
  preferredStudentLevel: string[];
  publications?: number;
  hIndex?: number;
  verified: boolean;
}

export type UserProfile = StudentProfile | ResearcherProfile;

export const dummyStudents: StudentProfile[] = [
  {
    id: "s1",
    type: "student",
    name: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?u=alex-chen",
    university: "MIT",
    department: "Computer Science",
    location: "Boston, USA",
    semester: 6,
    cgpa: 3.8,
    researchLevel: "advanced",
    backgroundSummary: "Focus on machine learning and computer vision. Built several ML models for medical imaging analysis.",
    researchInterests: ["Machine Learning", "Computer Vision", "Healthcare AI"],
    passionAreas: ["AI", "Medical Imaging", "Deep Learning"],
    preferredDomain: "both",
    goals: ["Co-author paper", "Build portfolio", "FYP support"],
    skills: ["Python", "TensorFlow", "PyTorch", "OpenCV", "R"],
    servicesOffered: ["Data Analysis", "Coding / App Dev", "FYP / Thesis"],
    hourlyRate: 35,
    availability: "20 hrs/week",
    projects: [
      { title: "Medical Image Classifier", description: "CNN for detecting tumors in MRI scans", link: "https://github.com" },
      { title: "Sentiment Analysis API", description: "NLP model for social media sentiment", link: "https://github.com" }
    ],
    verified: true,
    orcid: "0000-0001-1234-5678"
  },
  {
    id: "s2",
    type: "student",
    name: "Maria Santos",
    avatar: "https://i.pravatar.cc/150?u=maria-santos",
    university: "Stanford University",
    department: "Environmental Science",
    location: "California, USA",
    semester: 8,
    cgpa: 3.9,
    researchLevel: "publication-ready",
    backgroundSummary: "Climate modeling and sustainability research. Published 2 papers on carbon capture technologies.",
    researchInterests: ["Climate Science", "Sustainability", "Carbon Capture"],
    passionAreas: ["Environment", "Renewable Energy", "Climate Change"],
    preferredDomain: "academia",
    goals: ["Co-author paper", "Learn research"],
    skills: ["MATLAB", "Python", "GIS", "Statistical Analysis", "R"],
    servicesOffered: ["Research Writing", "Data Analysis"],
    hourlyRate: 40,
    availability: "10 hrs/week",
    projects: [
      { title: "Climate Prediction Model", description: "ML model for regional climate forecasting" }
    ],
    verified: true
  },
  {
    id: "s3",
    type: "student",
    name: "James Park",
    avatar: "https://i.pravatar.cc/150?u=james-park",
    university: "Seoul National University",
    department: "Electrical Engineering",
    location: "Seoul, South Korea",
    semester: 4,
    cgpa: 3.6,
    researchLevel: "intermediate",
    backgroundSummary: "Working on IoT systems and embedded programming. Interested in smart city applications.",
    researchInterests: ["IoT", "Embedded Systems", "Smart Cities"],
    passionAreas: ["IoT", "Hardware", "Automation"],
    preferredDomain: "industry",
    goals: ["Build portfolio", "Earn via projects"],
    skills: ["C++", "Arduino", "Raspberry Pi", "PCB Design", "Python"],
    servicesOffered: ["Coding / App Dev", "FYP / Thesis"],
    hourlyRate: 25,
    availability: "40+ hrs/week",
    projects: [
      { title: "Smart Home System", description: "IoT-based home automation with voice control" }
    ],
    verified: false
  },
  {
    id: "s4",
    type: "student",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?u=emma-wilson",
    university: "University of Oxford",
    department: "Psychology",
    location: "Oxford, UK",
    semester: 5,
    cgpa: 3.7,
    researchLevel: "intermediate",
    backgroundSummary: "Cognitive psychology research with focus on memory and learning. Experience with behavioral experiments.",
    researchInterests: ["Cognitive Psychology", "Memory", "Learning"],
    passionAreas: ["Psychology", "Neuroscience", "Education"],
    preferredDomain: "academia",
    goals: ["Co-author paper", "Learn research", "FYP support"],
    skills: ["SPSS", "R", "Survey Design", "Statistical Analysis", "Python"],
    servicesOffered: ["Data Analysis", "Research Writing"],
    hourlyRate: 30,
    availability: "20 hrs/week",
    projects: [
      { title: "Memory Retention Study", description: "Longitudinal study on spaced repetition effects" }
    ],
    verified: true
  },
  {
    id: "s5",
    type: "student",
    name: "Ahmed Hassan",
    avatar: "https://i.pravatar.cc/150?u=ahmed-hassan",
    university: "Cairo University",
    department: "Physics",
    location: "Cairo, Egypt",
    semester: 7,
    cgpa: 3.5,
    researchLevel: "advanced",
    backgroundSummary: "Quantum computing research with focus on quantum error correction algorithms.",
    researchInterests: ["Quantum Computing", "Quantum Physics", "Algorithms"],
    passionAreas: ["Quantum", "Physics", "Mathematics"],
    preferredDomain: "academia",
    goals: ["Co-author paper", "Build portfolio"],
    skills: ["Qiskit", "Python", "MATLAB", "Linear Algebra", "Quantum Mechanics"],
    servicesOffered: ["Coding / App Dev", "Data Analysis"],
    hourlyRate: 28,
    availability: "10 hrs/week",
    projects: [
      { title: "Quantum Error Correction", description: "Novel approach to surface code implementation" }
    ],
    verified: true,
    orcid: "0000-0002-9876-5432"
  },
  {
    id: "s6",
    type: "student",
    name: "Sophie Mueller",
    avatar: "https://i.pravatar.cc/150?u=sophie-mueller",
    university: "TU Munich",
    department: "Mechanical Engineering",
    location: "Munich, Germany",
    semester: 6,
    researchLevel: "intermediate",
    backgroundSummary: "Robotics and automation. Working on autonomous drone navigation systems.",
    researchInterests: ["Robotics", "Autonomous Systems", "Control Theory"],
    passionAreas: ["Robotics", "AI", "Automation"],
    preferredDomain: "industry",
    goals: ["Earn via projects", "Build portfolio"],
    skills: ["ROS", "Python", "C++", "MATLAB", "CAD"],
    servicesOffered: ["Coding / App Dev", "Design / UI", "FYP / Thesis"],
    hourlyRate: 35,
    availability: "20 hrs/week",
    projects: [
      { title: "Drone Navigation System", description: "Computer vision-based autonomous navigation" }
    ],
    verified: false
  },
  {
    id: "s7",
    type: "student",
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/150?u=priya-sharma",
    university: "IIT Delhi",
    department: "Data Science",
    location: "New Delhi, India",
    semester: 3,
    cgpa: 3.9,
    researchLevel: "beginner",
    backgroundSummary: "Passionate about data science and analytics. Learning ML and statistical modeling.",
    researchInterests: ["Data Science", "Analytics", "Machine Learning"],
    passionAreas: ["AI", "Big Data", "Business Intelligence"],
    preferredDomain: "both",
    goals: ["Learn research", "Build portfolio", "Earn via projects"],
    skills: ["Python", "SQL", "Tableau", "Excel", "Power BI"],
    servicesOffered: ["Data Analysis", "Presentation / Posters"],
    hourlyRate: 20,
    availability: "40+ hrs/week",
    projects: [
      { title: "Sales Dashboard", description: "Interactive Tableau dashboard for retail analytics" }
    ],
    verified: true
  },
  {
    id: "s8",
    type: "student",
    name: "Lucas Silva",
    avatar: "https://i.pravatar.cc/150?u=lucas-silva",
    university: "University of São Paulo",
    department: "Biomedical Engineering",
    location: "São Paulo, Brazil",
    semester: 5,
    cgpa: 3.6,
    researchLevel: "intermediate",
    backgroundSummary: "Medical device development and biomedical signal processing. Focus on wearable health monitors.",
    researchInterests: ["Biomedical Engineering", "Wearables", "Signal Processing"],
    passionAreas: ["Healthcare", "IoT", "Medical Devices"],
    preferredDomain: "industry",
    goals: ["Build portfolio", "FYP support"],
    skills: ["MATLAB", "Python", "Signal Processing", "3D Printing", "Electronics"],
    servicesOffered: ["Coding / App Dev", "FYP / Thesis", "Design / UI"],
    hourlyRate: 25,
    availability: "20 hrs/week",
    projects: [
      { title: "ECG Monitor", description: "Portable ECG device with ML-based arrhythmia detection" }
    ],
    verified: false
  },
  {
    id: "s9",
    type: "student",
    name: "Yuki Tanaka",
    avatar: "https://i.pravatar.cc/150?u=yuki-tanaka",
    university: "University of Tokyo",
    department: "Economics",
    location: "Tokyo, Japan",
    semester: 6,
    cgpa: 3.8,
    researchLevel: "advanced",
    backgroundSummary: "Behavioral economics and game theory. Research on decision-making under uncertainty.",
    researchInterests: ["Behavioral Economics", "Game Theory", "Decision Science"],
    passionAreas: ["Economics", "Psychology", "Finance"],
    preferredDomain: "academia",
    goals: ["Co-author paper", "Learn research"],
    skills: ["R", "Stata", "Python", "Econometrics", "Survey Design"],
    servicesOffered: ["Data Analysis", "Research Writing"],
    hourlyRate: 32,
    availability: "10 hrs/week",
    projects: [
      { title: "Risk Perception Study", description: "Cross-cultural study on financial risk perception" }
    ],
    verified: true
  },
  {
    id: "s10",
    type: "student",
    name: "Nina Petrov",
    avatar: "https://i.pravatar.cc/150?u=nina-petrov",
    university: "Moscow State University",
    department: "Mathematics",
    location: "Moscow, Russia",
    semester: 7,
    cgpa: 4.0,
    researchLevel: "publication-ready",
    backgroundSummary: "Pure mathematics with focus on algebraic topology. Working on homology theory extensions.",
    researchInterests: ["Algebraic Topology", "Abstract Algebra", "Category Theory"],
    passionAreas: ["Mathematics", "Theory", "Logic"],
    preferredDomain: "academia",
    goals: ["Co-author paper"],
    skills: ["LaTeX", "MATLAB", "Python", "Proof Writing", "Topology"],
    servicesOffered: ["Research Writing", "FYP / Thesis"],
    hourlyRate: 35,
    availability: "5 hrs/week",
    projects: [
      { title: "Homology Extensions", description: "New computational methods for persistent homology" }
    ],
    verified: true,
    orcid: "0000-0003-5555-1234"
  },
  {
    id: "s11",
    type: "student",
    name: "David Okonkwo",
    avatar: "https://i.pravatar.cc/150?u=david-okonkwo",
    university: "University of Lagos",
    department: "Computer Engineering",
    location: "Lagos, Nigeria",
    semester: 4,
    cgpa: 3.4,
    researchLevel: "beginner",
    backgroundSummary: "Full-stack development and mobile app creation. Interested in fintech applications.",
    researchInterests: ["Software Engineering", "Mobile Development", "Fintech"],
    passionAreas: ["Web Dev", "Mobile", "Startups"],
    preferredDomain: "industry",
    goals: ["Earn via projects", "Build portfolio"],
    skills: ["React", "Node.js", "React Native", "Firebase", "MongoDB"],
    servicesOffered: ["Coding / App Dev", "Design / UI"],
    hourlyRate: 18,
    availability: "40+ hrs/week",
    projects: [
      { title: "Payment App", description: "Mobile payment solution for local merchants" }
    ],
    verified: false
  },
  {
    id: "s12",
    type: "student",
    name: "Isabella Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=isabella-rodriguez",
    university: "University of Buenos Aires",
    department: "Linguistics",
    location: "Buenos Aires, Argentina",
    semester: 5,
    cgpa: 3.7,
    researchLevel: "intermediate",
    backgroundSummary: "Computational linguistics and NLP. Working on multilingual language models.",
    researchInterests: ["NLP", "Computational Linguistics", "Language Models"],
    passionAreas: ["AI", "Languages", "Culture"],
    preferredDomain: "both",
    goals: ["Co-author paper", "Learn research", "Build portfolio"],
    skills: ["Python", "NLP", "Transformers", "Spanish", "Portuguese"],
    servicesOffered: ["Research Writing", "Data Analysis", "Coding / App Dev"],
    hourlyRate: 28,
    availability: "20 hrs/week",
    projects: [
      { title: "Multilingual NER", description: "Named entity recognition for Spanish dialects" }
    ],
    verified: true
  }
];

export const dummyResearchers: ResearcherProfile[] = [
  {
    id: "r1",
    type: "researcher",
    name: "Dr. Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=dr-sarah-chen",
    title: "Associate Professor",
    university: "MIT",
    department: "Computer Science",
    location: "Cambridge, USA",
    discipline: "Machine Learning",
    researchInterests: ["Deep Learning", "Computer Vision", "Healthcare AI"],
    collaborationType: ["Co-author", "Mentor", "Project Partner"],
    availability: "5 hrs/week",
    preferredStudentLevel: ["advanced", "publication-ready"],
    publications: 45,
    hIndex: 28,
    verified: true
  },
  {
    id: "r2",
    type: "researcher",
    name: "Prof. James Wilson",
    avatar: "https://i.pravatar.cc/150?u=prof-james-wilson",
    title: "Full Professor",
    university: "Stanford University",
    department: "Quantum Computing",
    location: "California, USA",
    discipline: "Quantum Computing",
    researchInterests: ["Quantum Algorithms", "Quantum Error Correction", "Optimization"],
    collaborationType: ["Co-author", "Mentor"],
    availability: "10 hrs/week",
    preferredStudentLevel: ["intermediate", "advanced"],
    publications: 78,
    hIndex: 42,
    verified: true
  },
  {
    id: "r3",
    type: "researcher",
    name: "Dr. Emily Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=dr-emily-rodriguez",
    title: "Assistant Professor",
    university: "Johns Hopkins",
    department: "Biomedical Engineering",
    location: "Baltimore, USA",
    discipline: "Medical Imaging",
    researchInterests: ["Medical Imaging", "Deep Learning", "Diagnostics"],
    collaborationType: ["Co-author", "Project Partner"],
    availability: "10 hrs/week",
    preferredStudentLevel: ["intermediate", "advanced", "publication-ready"],
    publications: 32,
    hIndex: 18,
    verified: true
  },
  {
    id: "r4",
    type: "researcher",
    name: "Dr. Michael Park",
    avatar: "https://i.pravatar.cc/150?u=dr-michael-park",
    title: "Associate Professor",
    university: "Harvard Law School",
    department: "Legal Technology",
    location: "Boston, USA",
    discipline: "Legal Tech",
    researchInterests: ["NLP", "Legal AI", "Document Analysis"],
    collaborationType: ["Project Partner"],
    availability: "5 hrs/week",
    preferredStudentLevel: ["advanced"],
    publications: 28,
    hIndex: 15,
    verified: true
  },
  {
    id: "r5",
    type: "researcher",
    name: "Dr. Anna Schmidt",
    avatar: "https://i.pravatar.cc/150?u=dr-anna-schmidt",
    title: "Senior Researcher",
    university: "TU Munich",
    department: "Energy Systems",
    location: "Munich, Germany",
    discipline: "Renewable Energy",
    researchInterests: ["Renewable Energy", "Grid Optimization", "IoT"],
    collaborationType: ["Co-author", "Mentor", "Project Partner"],
    availability: "20 hrs/week",
    preferredStudentLevel: ["beginner", "intermediate", "advanced"],
    publications: 52,
    hIndex: 24,
    verified: true
  },
  {
    id: "r6",
    type: "researcher",
    name: "Prof. David Lee",
    avatar: "https://i.pravatar.cc/150?u=prof-david-lee",
    title: "Full Professor",
    university: "University of Oxford",
    department: "Social Sciences",
    location: "Oxford, UK",
    discipline: "Computational Social Science",
    researchInterests: ["Social Media Analysis", "Sentiment Analysis", "Network Science"],
    collaborationType: ["Co-author", "Mentor"],
    availability: "10 hrs/week",
    preferredStudentLevel: ["intermediate", "advanced", "publication-ready"],
    publications: 65,
    hIndex: 35,
    verified: true
  },
  {
    id: "r7",
    type: "researcher",
    name: "Dr. Hiroshi Yamamoto",
    avatar: "https://i.pravatar.cc/150?u=dr-hiroshi-yamamoto",
    title: "Associate Professor",
    university: "University of Tokyo",
    department: "Robotics",
    location: "Tokyo, Japan",
    discipline: "Robotics",
    researchInterests: ["Autonomous Systems", "Human-Robot Interaction", "Control Theory"],
    collaborationType: ["Co-author", "Project Partner"],
    availability: "5 hrs/week",
    preferredStudentLevel: ["advanced", "publication-ready"],
    publications: 41,
    hIndex: 22,
    verified: true
  },
  {
    id: "r8",
    type: "researcher",
    name: "Dr. Fatima Al-Hassan",
    avatar: "https://i.pravatar.cc/150?u=dr-fatima-alhassan",
    title: "Research Fellow",
    university: "King Abdullah University",
    department: "Environmental Science",
    location: "Saudi Arabia",
    discipline: "Climate Science",
    researchInterests: ["Climate Modeling", "Sustainability", "Water Resources"],
    collaborationType: ["Co-author", "Mentor", "Project Partner"],
    availability: "20 hrs/week",
    preferredStudentLevel: ["beginner", "intermediate"],
    publications: 25,
    hIndex: 12,
    verified: true
  }
];

export const allUsers: UserProfile[] = [...dummyStudents, ...dummyResearchers];

// Match scoring algorithm
export function calculateMatchScore(user1: UserProfile, user2: UserProfile): number {
  let score = 0;

  // Get interests for both users
  const interests1 = user1.researchInterests || [];
  const interests2 = user2.researchInterests || [];
  
  // Interests overlap (35%)
  const interestsOverlap = interests1.filter(i => 
    interests2.some(j => j.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(j.toLowerCase()))
  ).length;
  const maxInterests = Math.max(interests1.length, interests2.length, 1);
  score += (interestsOverlap / maxInterests) * 35;

  // Skills overlap (25%) - only for students
  if (user1.type === "student" && user2.type === "student") {
    const skills1 = user1.skills || [];
    const skills2 = user2.skills || [];
    const skillsOverlap = skills1.filter(s => 
      skills2.some(t => t.toLowerCase() === s.toLowerCase())
    ).length;
    const maxSkills = Math.max(skills1.length, skills2.length, 1);
    score += (skillsOverlap / maxSkills) * 25;
  } else if (user1.type === "student" && user2.type === "researcher") {
    // Check if student skills match researcher needs
    const studentSkills = user1.skills || [];
    const researcherInterests = user2.researchInterests || [];
    const relevantSkills = studentSkills.filter(s =>
      researcherInterests.some(r => r.toLowerCase().includes(s.toLowerCase()))
    ).length;
    score += Math.min(relevantSkills * 5, 25);
  } else {
    score += 15; // Base score for researcher-researcher
  }

  // Research level compatibility (20%)
  if (user1.type === "student" && user2.type === "researcher") {
    const studentLevel = user1.researchLevel;
    const preferredLevels = user2.preferredStudentLevel || [];
    if (preferredLevels.includes(studentLevel)) {
      score += 20;
    } else {
      score += 8;
    }
  } else if (user1.type === "student" && user2.type === "student") {
    const levels = ["beginner", "intermediate", "advanced", "publication-ready"];
    const level1 = levels.indexOf(user1.researchLevel);
    const level2 = levels.indexOf(user2.researchLevel);
    const diff = Math.abs(level1 - level2);
    score += Math.max(20 - diff * 5, 5);
  } else {
    score += 15;
  }

  // Location match (10%)
  const loc1 = user1.location.toLowerCase();
  const loc2 = user2.location.toLowerCase();
  if (loc1 === loc2) {
    score += 10;
  } else if (loc1.includes("remote") || loc2.includes("remote") || 
             loc1.split(",")[1]?.trim() === loc2.split(",")[1]?.trim()) {
    score += 5;
  }

  // Availability compatibility (10%)
  const avail1 = user1.availability;
  const avail2 = user2.availability;
  if (avail1 === avail2) {
    score += 10;
  } else {
    score += 5;
  }

  return Math.round(Math.min(score, 100));
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
