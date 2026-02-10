import { useState, useCallback, useMemo } from "react";
import { useUniversalAI, AIDomain } from "@/hooks/useUniversalAI";

export type PaperType =
  | "Journal Article"
  | "Conference Paper"
  | "Preprint"
  | "Thesis/Dissertation"
  | "Technical Report"
  | "Systematic Review"
  | "Meta-Analysis"
  | "Case Study"
  | "Working Paper"
  | "Book Chapter"
  | "White Paper"
  | "Patent";

export type AccessLevel = "Open Access" | "Restricted";

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  type: PaperType;
  field: string;
  journal: string;
  year: number;
  citations: number;
  doi: string;
  access: AccessLevel;
  bookmarked?: boolean;
  summarized?: boolean;
}

export interface PaperSummary {
  summary: string;
  keyFindings: string[];
  methodology: string;
  limitations: string;
  relevanceScore: number;
}

export type ResearchLevel =
  | "Beginner"
  | "Emerging"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Distinguished";

export interface ResearchMetrics {
  publications: number;
  citations: number;
  hIndex: number;
  papersRead: number;
  peerReviews: number;
}

const LEVEL_THRESHOLDS: { level: ResearchLevel; min: number }[] = [
  { level: "Distinguished", min: 90 },
  { level: "Expert", min: 75 },
  { level: "Advanced", min: 55 },
  { level: "Intermediate", min: 35 },
  { level: "Emerging", min: 15 },
  { level: "Beginner", min: 0 },
];

function computeScore(m: ResearchMetrics): number {
  const pubScore = Math.min(m.publications / 30, 1) * 30;
  const citScore = Math.min(m.citations / 500, 1) * 25;
  const hScore = Math.min(m.hIndex / 20, 1) * 20;
  const readScore = Math.min(m.papersRead / 100, 1) * 15;
  const reviewScore = Math.min(m.peerReviews / 20, 1) * 10;
  return pubScore + citScore + hScore + readScore + reviewScore;
}

function getLevel(score: number): ResearchLevel {
  return (LEVEL_THRESHOLDS.find((t) => score >= t.min) ?? LEVEL_THRESHOLDS[5]).level;
}

function getNextLevel(current: ResearchLevel): ResearchLevel | null {
  const idx = LEVEL_THRESHOLDS.findIndex((t) => t.level === current);
  return idx > 0 ? LEVEL_THRESHOLDS[idx - 1].level : null;
}

function getProgressToNext(score: number, current: ResearchLevel): number {
  const idx = LEVEL_THRESHOLDS.findIndex((t) => t.level === current);
  if (idx <= 0) return 100;
  const currentMin = LEVEL_THRESHOLDS[idx].min;
  const nextMin = LEVEL_THRESHOLDS[idx - 1].min;
  return Math.min(((score - currentMin) / (nextMin - currentMin)) * 100, 100);
}

const SAMPLE_PAPERS: ResearchPaper[] = [
  {
    id: "1", title: "Transformer Architecture for Large Language Models", authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    abstract: "We propose a new simple network architecture based entirely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments show these models achieve superior quality while being more parallelizable.",
    type: "Conference Paper", field: "Computer Science", journal: "NeurIPS 2017", year: 2017, citations: 95000, doi: "10.5555/3295222.3295349", access: "Open Access",
  },
  {
    id: "2", title: "CRISPR-Cas9 Gene Editing: Clinical Applications and Ethical Considerations", authors: ["Doudna, J.", "Charpentier, E."],
    abstract: "This review covers recent advances in CRISPR-Cas9 technology and its applications in therapeutic gene editing, addressing both technical challenges and the ethical framework needed for clinical deployment.",
    type: "Systematic Review", field: "Biotechnology", journal: "Nature Reviews Genetics", year: 2023, citations: 1200, doi: "10.1038/nrg.2023.001", access: "Restricted",
  },
  {
    id: "3", title: "Sustainable Urban Development: A Meta-Analysis of Green Infrastructure Impact", authors: ["Chen, L.", "Müller, K.", "Patel, R."],
    abstract: "A comprehensive meta-analysis examining the effectiveness of green infrastructure interventions across 150 urban centers, analyzing environmental, social, and economic outcomes.",
    type: "Meta-Analysis", field: "Environmental Science", journal: "Urban Studies", year: 2024, citations: 340, doi: "10.1177/0042098024001", access: "Open Access",
  },
  {
    id: "4", title: "Quantum Error Correction in Topological Qubits", authors: ["Kitaev, A.", "Freedman, M."],
    abstract: "We present novel approaches to quantum error correction using topological properties of anyonic systems, demonstrating fault-tolerant computation thresholds.",
    type: "Journal Article", field: "Physics", journal: "Physical Review Letters", year: 2024, citations: 89, doi: "10.1103/PhysRevLett.132.001", access: "Restricted",
  },
  {
    id: "5", title: "Deep Learning Approaches to Drug Discovery: From Molecular Representation to Clinical Trials", authors: ["Zhang, W.", "Li, S.", "Kumar, P."],
    abstract: "This working paper presents a comprehensive framework for applying deep learning across all stages of drug discovery, from molecular graph representations to predicting clinical trial outcomes.",
    type: "Working Paper", field: "Bioinformatics", journal: "arXiv", year: 2025, citations: 12, doi: "10.48550/arXiv.2025.01234", access: "Open Access",
  },
  {
    id: "6", title: "Economic Impact of AI Automation on Developing Economies", authors: ["Acemoglu, D.", "Restrepo, P."],
    abstract: "We analyze the differential effects of AI-driven automation on labor markets in developing economies, finding significant heterogeneity in outcomes across sectors and skill levels.",
    type: "Journal Article", field: "Economics", journal: "American Economic Review", year: 2024, citations: 560, doi: "10.1257/aer.2024.0456", access: "Restricted",
  },
  {
    id: "7", title: "Federated Learning for Privacy-Preserving Medical Imaging", authors: ["Li, T.", "Sahu, A.", "Talwalkar, A."],
    abstract: "This thesis investigates federated learning techniques to train medical imaging models across institutions without sharing patient data, achieving comparable accuracy to centralized approaches.",
    type: "Thesis/Dissertation", field: "Medical Informatics", journal: "Carnegie Mellon University", year: 2023, citations: 210, doi: "10.1184/cmu.2023.789", access: "Open Access",
  },
  {
    id: "8", title: "Blockchain-Based Academic Credential Verification System", authors: ["Nakamoto, S.", "Buterin, V."],
    abstract: "A technical report describing a decentralized system for verifying academic credentials using blockchain technology, enabling tamper-proof and instantly verifiable academic records.",
    type: "Technical Report", field: "Computer Science", journal: "IEEE Technical Reports", year: 2024, citations: 45, doi: "10.1109/TR.2024.001", access: "Open Access",
  },
  {
    id: "9", title: "Cognitive Behavioral Therapy in Virtual Reality Environments", authors: ["Freeman, D.", "Reeve, S."],
    abstract: "A randomized controlled trial investigating the efficacy of VR-delivered cognitive behavioral therapy for social anxiety disorder, demonstrating significant improvements over traditional methods.",
    type: "Case Study", field: "Psychology", journal: "The Lancet Psychiatry", year: 2024, citations: 178, doi: "10.1016/S2215-0366(24)00123", access: "Restricted",
  },
  {
    id: "10", title: "Foundations of Causal Inference in Machine Learning", authors: ["Pearl, J.", "Bareinboim, E."],
    abstract: "This book chapter provides a comprehensive introduction to causal inference methods applicable to machine learning, covering interventional distributions, counterfactuals, and transportability.",
    type: "Book Chapter", field: "Statistics", journal: "Cambridge University Press", year: 2023, citations: 890, doi: "10.1017/9781108242001.ch5", access: "Restricted",
  },
  {
    id: "11", title: "Method for Efficient Solar Cell Manufacturing Using Perovskite Materials", authors: ["Park, N.", "Grätzel, M."],
    abstract: "Patent covering a novel manufacturing method for perovskite solar cells that increases efficiency by 40% while reducing production costs through a roll-to-roll printing process.",
    type: "Patent", field: "Materials Science", journal: "US Patent Office", year: 2025, citations: 5, doi: "US11234567B2", access: "Open Access",
  },
  {
    id: "12", title: "The Future of Remote Work: Policy Recommendations for Post-Pandemic Economies", authors: ["Bloom, N.", "Davis, S."],
    abstract: "A white paper analyzing remote work patterns across 30 countries and providing evidence-based policy recommendations for governments and organizations transitioning to hybrid models.",
    type: "White Paper", field: "Public Policy", journal: "Brookings Institution", year: 2024, citations: 320, doi: "10.2139/ssrn.4567890", access: "Open Access",
  },
];

export function useResearchPapers() {
  const [papers, setPapers] = useState<ResearchPaper[]>(SAMPLE_PAPERS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PaperType | "All">("All");
  const [fieldFilter, setFieldFilter] = useState<string>("All");
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [summaries, setSummaries] = useState<Record<string, PaperSummary>>({});
  const { ask, loading: aiLoading } = useUniversalAI();

  const [metrics] = useState<ResearchMetrics>({
    publications: 8,
    citations: 120,
    hIndex: 5,
    papersRead: 24,
    peerReviews: 6,
  });

  const score = useMemo(() => computeScore({ ...metrics, papersRead: metrics.papersRead + readingHistory.length }), [metrics, readingHistory]);
  const level = useMemo(() => getLevel(score), [score]);
  const nextLevel = useMemo(() => getNextLevel(level), [level]);
  const progress = useMemo(() => getProgressToNext(score, level), [score, level]);

  const fields = useMemo(() => [...new Set(papers.map((p) => p.field))].sort(), [papers]);
  const paperTypes = useMemo(() => [...new Set(papers.map((p) => p.type))].sort(), [papers]);

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))) return false;
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      if (fieldFilter !== "All" && p.field !== fieldFilter) return false;
      return true;
    });
  }, [papers, search, typeFilter, fieldFilter]);

  const toggleBookmark = useCallback((id: string) => {
    setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));
  }, []);

  const summarizePaper = useCallback(
    async (paper: ResearchPaper): Promise<PaperSummary | null> => {
      const result = await ask<PaperSummary>("research" as AIDomain, "summarize-paper", {
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        journal: paper.journal,
        type: paper.type,
        field: paper.field,
      });
      if (result) {
        setSummaries((prev) => ({ ...prev, [paper.id]: result }));
        setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, summarized: true } : p)));
        setReadingHistory((prev) => (prev.includes(paper.id) ? prev : [...prev, paper.id]));
      }
      return result;
    },
    [ask]
  );

  const getImprovementPlan = useCallback(async () => {
    return ask("research" as AIDomain, "improve-level", {
      currentLevel: level,
      ...metrics,
      papersRead: metrics.papersRead + readingHistory.length,
      readingHistory: readingHistory.length,
    });
  }, [ask, level, metrics, readingHistory]);

  return {
    papers: filtered,
    allPapers: papers,
    search, setSearch,
    typeFilter, setTypeFilter,
    fieldFilter, setFieldFilter,
    fields, paperTypes,
    toggleBookmark,
    summarizePaper,
    summaries,
    aiLoading,
    metrics: { ...metrics, papersRead: metrics.papersRead + readingHistory.length },
    score, level, nextLevel, progress,
    readingHistory,
    getImprovementPlan,
  };
}
