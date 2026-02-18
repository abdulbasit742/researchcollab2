import { useState, useCallback, useMemo } from "react";
import { useUniversalAI, AIDomain } from "@/hooks/useUniversalAI";
import { useUserSubscription } from "@/hooks/useSubscriptions";
import { toast } from "sonner";

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

export type SortOption = "citations-desc" | "year-desc" | "year-asc" | "title-asc" | "analyzed";

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

export interface PaperComparison {
  methodology: string;
  findings: string;
  citationImpact: string;
  complementary: string;
  recommendation: string;
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

export interface ReadingStats {
  byField: Record<string, number>;
  topField: string | null;
  streak: number;
  totalAnalyzed: number;
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
    id: "kruk-mobile-devices", title: "A look at advanced learners' use of mobile devices for English language study: Insights from interview data", authors: ["Kruk, M."],
    abstract: "The paper discusses the results of a study which explored advanced learners of English engagement with their mobile devices to develop learning experiences that meet their needs and goals as foreign language learners. The data were collected from 20 students by means of a semi-structured interview. The gathered data were subjected to qualitative and quantitative analysis.",
    type: "Journal Article", field: "Applied Linguistics", journal: "The EUROCALL Review", year: 2017, citations: 142, doi: "10.14746/ssllt.2017.7.2.3", access: "Open Access",
  },
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
  // ... keep existing code
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
  // ── 100 Additional Papers ──
  { id: "13", title: "Reinforcement Learning for Autonomous Vehicle Navigation", authors: ["Silver, D.", "Huang, A."], abstract: "Presents a deep reinforcement learning framework for autonomous driving in complex urban environments with safety guarantees.", type: "Conference Paper", field: "Computer Science", journal: "ICML 2024", year: 2024, citations: 430, doi: "10.5555/icml2024.013", access: "Open Access" },
  { id: "14", title: "mRNA Vaccine Design Optimization Using AI", authors: ["Kariko, K.", "Weissman, D."], abstract: "AI-assisted optimization of mRNA sequences for enhanced immunogenicity and stability in next-generation vaccine platforms.", type: "Journal Article", field: "Biotechnology", journal: "Cell", year: 2024, citations: 890, doi: "10.1016/j.cell.2024.01", access: "Restricted" },
  { id: "15", title: "Climate Change Impact on Global Food Security", authors: ["Lobell, D.", "Field, C."], abstract: "Quantitative assessment of climate-driven yield changes across major food crops through 2050 using ensemble modeling.", type: "Systematic Review", field: "Environmental Science", journal: "Nature Food", year: 2024, citations: 670, doi: "10.1038/s43016-024-001", access: "Open Access" },
  { id: "16", title: "Graph Neural Networks for Social Network Analysis", authors: ["Kipf, T.", "Welling, M."], abstract: "Novel GNN architectures for community detection and influence propagation in large-scale social networks.", type: "Conference Paper", field: "Computer Science", journal: "AAAI 2024", year: 2024, citations: 320, doi: "10.1609/aaai.v38i1.001", access: "Open Access" },
  { id: "17", title: "Microplastic Contamination in Deep Ocean Ecosystems", authors: ["Jambeck, J.", "Law, K."], abstract: "First comprehensive survey of microplastic distribution in hadal zone ecosystems across five ocean trenches.", type: "Journal Article", field: "Environmental Science", journal: "Science", year: 2024, citations: 540, doi: "10.1126/science.2024.017", access: "Restricted" },
  { id: "18", title: "Neuromorphic Computing for Edge AI Applications", authors: ["Davies, M.", "Schuman, C."], abstract: "Design principles for neuromorphic processors enabling real-time AI inference at ultra-low power consumption.", type: "Technical Report", field: "Computer Science", journal: "Intel Labs", year: 2024, citations: 180, doi: "10.1109/JPROC.2024.018", access: "Open Access" },
  { id: "19", title: "Precision Medicine in Oncology: Genomic Biomarker Discovery", authors: ["Vogelstein, B.", "Papadopoulos, N."], abstract: "Systematic identification of actionable genomic biomarkers across 50 cancer types using multi-omics integration.", type: "Meta-Analysis", field: "Biotechnology", journal: "Cancer Cell", year: 2024, citations: 780, doi: "10.1016/j.ccell.2024.019", access: "Restricted" },
  { id: "20", title: "Decentralized Finance: Risk Assessment and Regulatory Frameworks", authors: ["Auer, R.", "Claessens, S."], abstract: "Empirical analysis of systemic risks in DeFi protocols with proposed regulatory frameworks for financial stability.", type: "Working Paper", field: "Economics", journal: "BIS Working Papers", year: 2024, citations: 210, doi: "10.2139/ssrn.4020020", access: "Open Access" },
  { id: "21", title: "Single-Cell RNA Sequencing in Developmental Biology", authors: ["Trapnell, C.", "Regev, A."], abstract: "Atlas of cellular differentiation trajectories during human embryonic development using single-cell transcriptomics.", type: "Journal Article", field: "Biotechnology", journal: "Nature", year: 2024, citations: 1200, doi: "10.1038/s41586-024-021", access: "Restricted" },
  { id: "22", title: "Adversarial Robustness in Large Language Models", authors: ["Carlini, N.", "Wagner, D."], abstract: "Comprehensive evaluation of adversarial attack vectors against LLMs with novel defense mechanisms.", type: "Conference Paper", field: "Computer Science", journal: "USENIX Security 2024", year: 2024, citations: 290, doi: "10.5555/usenix.2024.022", access: "Open Access" },
  { id: "23", title: "Renewable Energy Storage: Solid-State Battery Advances", authors: ["Goodenough, J.", "Janek, J."], abstract: "Breakthrough in solid-state electrolyte design achieving 500 Wh/kg energy density with 10,000+ cycle stability.", type: "Journal Article", field: "Materials Science", journal: "Energy & Environmental Science", year: 2024, citations: 450, doi: "10.1039/D4EE00023", access: "Open Access" },
  { id: "24", title: "Mental Health Interventions via Digital Therapeutics", authors: ["Mohr, D.", "Schueller, S."], abstract: "RCT of app-based digital therapeutics for depression showing non-inferiority to in-person CBT across diverse populations.", type: "Journal Article", field: "Psychology", journal: "JAMA Psychiatry", year: 2024, citations: 380, doi: "10.1001/jamapsychiatry.2024.024", access: "Restricted" },
  { id: "25", title: "Optical Computing for Machine Learning Acceleration", authors: ["Shen, Y.", "Harris, N."], abstract: "Photonic neural network architecture demonstrating 1000x energy efficiency improvement over electronic counterparts.", type: "Journal Article", field: "Physics", journal: "Nature Photonics", year: 2024, citations: 210, doi: "10.1038/s41566-024-025", access: "Restricted" },
  { id: "26", title: "Global Migration Patterns and Economic Development", authors: ["Clemens, M.", "Pritchett, L."], abstract: "Longitudinal analysis of migration flows and their causal impact on GDP growth in origin and destination countries.", type: "Journal Article", field: "Economics", journal: "Quarterly Journal of Economics", year: 2024, citations: 340, doi: "10.1093/qje/2024.026", access: "Restricted" },
  { id: "27", title: "Automated Theorem Proving with Neural Networks", authors: ["Lample, G.", "Charton, F."], abstract: "Neural theorem prover achieving gold-medal level performance on International Mathematical Olympiad problems.", type: "Conference Paper", field: "Computer Science", journal: "ICLR 2025", year: 2025, citations: 150, doi: "10.5555/iclr2025.027", access: "Open Access" },
  { id: "28", title: "Gut Microbiome and Neurodegenerative Disease", authors: ["Cryan, J.", "Dinan, T."], abstract: "Evidence for gut-brain axis dysfunction in Alzheimer's disease with potential microbiome-based therapeutic interventions.", type: "Systematic Review", field: "Biotechnology", journal: "Nature Reviews Neuroscience", year: 2024, citations: 620, doi: "10.1038/s41583-024-028", access: "Restricted" },
  { id: "29", title: "Sustainable Concrete Using Carbon Capture", authors: ["Mehta, P.", "Monteiro, P."], abstract: "Novel cement formulation that sequesters atmospheric CO2 during curing, achieving net-negative carbon footprint.", type: "Patent", field: "Materials Science", journal: "European Patent Office", year: 2024, citations: 35, doi: "EP4567890A1", access: "Open Access" },
  { id: "30", title: "Computational Social Science: Methods and Ethics", authors: ["Lazer, D.", "Radford, J."], abstract: "Framework for ethical computational social science research using digital trace data with privacy-preserving analytics.", type: "Book Chapter", field: "Statistics", journal: "Oxford University Press", year: 2024, citations: 190, doi: "10.1093/oso/2024.030", access: "Restricted" },
  { id: "31", title: "Multimodal AI for Medical Diagnosis", authors: ["Rajpurkar, P.", "Lungren, M."], abstract: "Multimodal foundation model combining imaging, EHR, and genomic data for comprehensive diagnostic support.", type: "Journal Article", field: "Medical Informatics", journal: "Nature Medicine", year: 2025, citations: 180, doi: "10.1038/s41591-025-031", access: "Restricted" },
  { id: "32", title: "Ocean Thermal Energy Conversion: Feasibility Study", authors: ["Vega, L.", "Nihous, G."], abstract: "Techno-economic assessment of next-generation OTEC plants for tropical island nations achieving grid parity.", type: "Technical Report", field: "Environmental Science", journal: "NREL Technical Reports", year: 2024, citations: 65, doi: "10.2172/nrel.2024.032", access: "Open Access" },
  { id: "33", title: "Language Model Alignment via Constitutional AI", authors: ["Bai, Y.", "Kadavath, S."], abstract: "Training methodology for aligning language models with human values using self-supervised constitutional principles.", type: "Conference Paper", field: "Computer Science", journal: "NeurIPS 2024", year: 2024, citations: 520, doi: "10.5555/neurips.2024.033", access: "Open Access" },
  { id: "34", title: "Epigenetic Clocks and Biological Age Prediction", authors: ["Horvath, S.", "Raj, K."], abstract: "Fourth-generation epigenetic clock achieving 2-year accuracy in biological age prediction across diverse populations.", type: "Journal Article", field: "Biotechnology", journal: "Aging Cell", year: 2024, citations: 340, doi: "10.1111/acel.2024.034", access: "Open Access" },
  { id: "35", title: "Smart Grid Optimization Using Quantum Computing", authors: ["Farhi, E.", "Harrow, A."], abstract: "Quantum approximate optimization for real-time power grid load balancing with renewable energy integration.", type: "Journal Article", field: "Physics", journal: "PRX Quantum", year: 2024, citations: 120, doi: "10.1103/PRXQuantum.5.035", access: "Open Access" },
  { id: "36", title: "Behavioral Economics of Charitable Giving", authors: ["Thaler, R.", "Sunstein, C."], abstract: "Nudge-based intervention study increasing charitable donations by 40% through default option architecture.", type: "Journal Article", field: "Economics", journal: "Journal of Political Economy", year: 2024, citations: 280, doi: "10.1086/jpe.2024.036", access: "Restricted" },
  { id: "37", title: "CRISPR Base Editing for Sickle Cell Disease", authors: ["Liu, D.", "Gaudelli, N."], abstract: "Phase II clinical trial results of adenine base editing for sickle cell disease showing 95% correction efficiency.", type: "Case Study", field: "Biotechnology", journal: "New England Journal of Medicine", year: 2025, citations: 290, doi: "10.1056/NEJMoa2025037", access: "Restricted" },
  { id: "38", title: "Causal Inference in Observational Health Studies", authors: ["Hernán, M.", "Robins, J."], abstract: "Modern methods for causal inference from electronic health records using target trial emulation frameworks.", type: "Book Chapter", field: "Statistics", journal: "Chapman & Hall/CRC", year: 2024, citations: 450, doi: "10.1201/chap.2024.038", access: "Restricted" },
  { id: "39", title: "Digital Twin Technology for Manufacturing", authors: ["Grieves, M.", "Vickers, J."], abstract: "Industrial digital twin framework enabling predictive maintenance with 99.7% accuracy in aerospace manufacturing.", type: "White Paper", field: "Computer Science", journal: "NASA Technical Reports", year: 2024, citations: 170, doi: "10.2514/nasa.2024.039", access: "Open Access" },
  { id: "40", title: "Coral Reef Restoration Using 3D Bioprinting", authors: ["Hoegh-Guldberg, O.", "Hughes, T."], abstract: "Bioprinted calcium carbonate scaffolds with embedded coral larvae achieving 3x faster reef regeneration rates.", type: "Journal Article", field: "Environmental Science", journal: "Nature Ecology & Evolution", year: 2024, citations: 230, doi: "10.1038/s41559-024-040", access: "Open Access" },
  { id: "41", title: "Diffusion Models for Protein Structure Prediction", authors: ["Jumper, J.", "Hassabis, D."], abstract: "Generative diffusion model predicting novel protein structures with atomic-level accuracy beyond AlphaFold.", type: "Journal Article", field: "Bioinformatics", journal: "Science", year: 2025, citations: 680, doi: "10.1126/science.2025.041", access: "Open Access" },
  { id: "42", title: "Education Inequality in Sub-Saharan Africa", authors: ["Banerjee, A.", "Duflo, E."], abstract: "Large-scale RCT evaluating technology-enabled teaching interventions across 12 Sub-Saharan African countries.", type: "Journal Article", field: "Public Policy", journal: "Review of Economic Studies", year: 2024, citations: 310, doi: "10.1093/restud/2024.042", access: "Restricted" },
  { id: "43", title: "Topological Insulators for Quantum Computing", authors: ["Kane, C.", "Mele, E."], abstract: "Experimental realization of Majorana fermions in topological insulator heterostructures for fault-tolerant quantum gates.", type: "Journal Article", field: "Physics", journal: "Physical Review X", year: 2024, citations: 180, doi: "10.1103/PhysRevX.14.043", access: "Open Access" },
  { id: "44", title: "Natural Language Processing for Legal Document Analysis", authors: ["Zhong, H.", "Xiao, C."], abstract: "Transformer-based system for automated legal document review achieving 94% accuracy on contract clause extraction.", type: "Conference Paper", field: "Computer Science", journal: "ACL 2024", year: 2024, citations: 140, doi: "10.18653/v1/2024.acl.044", access: "Open Access" },
  { id: "45", title: "Antibiotic Resistance: Global Surveillance Network", authors: ["Laxminarayan, R.", "Outterson, K."], abstract: "Real-time global surveillance data revealing accelerating AMR patterns with machine learning-based early warning system.", type: "Journal Article", field: "Biotechnology", journal: "The Lancet Infectious Diseases", year: 2024, citations: 490, doi: "10.1016/S1473-3099(24)00045", access: "Restricted" },
  { id: "46", title: "Space Debris Mitigation Using Laser Systems", authors: ["Phipps, C.", "Bonnal, C."], abstract: "Ground-based laser system for active debris removal demonstrating de-orbiting of objects up to 10cm diameter.", type: "Technical Report", field: "Physics", journal: "ESA Technical Reports", year: 2024, citations: 55, doi: "10.2514/esa.2024.046", access: "Open Access" },
  { id: "47", title: "Explainable AI in Healthcare Decision Support", authors: ["Ribeiro, M.", "Singh, S."], abstract: "SHAP-based interpretability framework for clinical decision support systems meeting FDA transparency requirements.", type: "Journal Article", field: "Medical Informatics", journal: "npj Digital Medicine", year: 2024, citations: 350, doi: "10.1038/s41746-024-047", access: "Open Access" },
  { id: "48", title: "Carbon Nanotube Computing: Beyond Silicon", authors: ["Shulaker, M.", "Hills, G."], abstract: "First fully functional 16-bit RISC-V processor built from carbon nanotube transistors at 10nm feature size.", type: "Journal Article", field: "Materials Science", journal: "Nature Electronics", year: 2024, citations: 290, doi: "10.1038/s41928-024-048", access: "Restricted" },
  { id: "49", title: "Childhood Nutrition and Cognitive Development", authors: ["Black, R.", "Victora, C."], abstract: "30-year longitudinal study linking early childhood nutrition interventions to adult cognitive outcomes and earnings.", type: "Meta-Analysis", field: "Public Policy", journal: "The Lancet", year: 2024, citations: 780, doi: "10.1016/S0140-6736(24)00049", access: "Restricted" },
  { id: "50", title: "Synthetic Biology for Carbon Fixation", authors: ["Church, G.", "Erb, T."], abstract: "Engineered metabolic pathways for CO2 fixation achieving 10x efficiency of natural photosynthesis.", type: "Journal Article", field: "Biotechnology", journal: "Science", year: 2025, citations: 320, doi: "10.1126/science.2025.050", access: "Open Access" },
  { id: "51", title: "Autonomous Drone Swarms for Precision Agriculture", authors: ["Sahin, E.", "Trianni, V."], abstract: "Multi-agent drone coordination for crop monitoring and precision spraying reducing pesticide use by 60%.", type: "Conference Paper", field: "Computer Science", journal: "ICRA 2024", year: 2024, citations: 110, doi: "10.1109/ICRA.2024.051", access: "Open Access" },
  { id: "52", title: "Sleep Architecture and Memory Consolidation", authors: ["Walker, M.", "Stickgold, R."], abstract: "Optogenetic manipulation of sleep spindles demonstrating causal role in declarative memory consolidation.", type: "Journal Article", field: "Psychology", journal: "Neuron", year: 2024, citations: 410, doi: "10.1016/j.neuron.2024.052", access: "Restricted" },
  { id: "53", title: "Bayesian Deep Learning for Uncertainty Quantification", authors: ["Gal, Y.", "Ghahramani, Z."], abstract: "Scalable Bayesian inference methods for deep neural networks with applications to safety-critical systems.", type: "Journal Article", field: "Statistics", journal: "Journal of Machine Learning Research", year: 2024, citations: 380, doi: "10.5555/jmlr.2024.053", access: "Open Access" },
  { id: "54", title: "Water Purification Using Graphene Oxide Membranes", authors: ["Nair, R.", "Geim, A."], abstract: "Scalable graphene oxide membrane technology for desalination achieving 99.9% salt rejection at low pressure.", type: "Patent", field: "Materials Science", journal: "WIPO", year: 2024, citations: 90, doi: "WO2024054A1", access: "Open Access" },
  { id: "55", title: "Political Polarization in Social Media Ecosystems", authors: ["Bakshy, E.", "Messing, S."], abstract: "Causal analysis of algorithmic amplification of political polarization across four major social media platforms.", type: "Journal Article", field: "Public Policy", journal: "PNAS", year: 2024, citations: 560, doi: "10.1073/pnas.2024055", access: "Open Access" },
  { id: "56", title: "Wearable Biosensors for Continuous Health Monitoring", authors: ["Kim, J.", "Rogers, J."], abstract: "Flexible epidermal sensor arrays for non-invasive monitoring of glucose, cortisol, and lactate in sweat.", type: "Journal Article", field: "Medical Informatics", journal: "Nature Biotechnology", year: 2024, citations: 430, doi: "10.1038/s41587-024-056", access: "Restricted" },
  { id: "57", title: "Multi-Agent Reinforcement Learning for Supply Chain", authors: ["Lowe, R.", "Wu, Y."], abstract: "Decentralized MARL framework for adaptive supply chain optimization during demand uncertainty and disruptions.", type: "Working Paper", field: "Economics", journal: "arXiv", year: 2024, citations: 75, doi: "10.48550/arXiv.2024.057", access: "Open Access" },
  { id: "58", title: "Ancient DNA and Human Migration Patterns", authors: ["Reich, D.", "Patterson, N."], abstract: "Paleogenomic analysis of 5,000 ancient individuals revealing previously unknown migration routes across Eurasia.", type: "Journal Article", field: "Biotechnology", journal: "Nature", year: 2024, citations: 820, doi: "10.1038/s41586-024-058", access: "Restricted" },
  { id: "59", title: "Zero-Knowledge Proofs for Privacy-Preserving Computation", authors: ["Ben-Sasson, E.", "Chiesa, A."], abstract: "Efficient zkSNARK construction enabling verifiable computation with logarithmic proof size and constant verification time.", type: "Conference Paper", field: "Computer Science", journal: "CRYPTO 2024", year: 2024, citations: 190, doi: "10.1007/978-3-031-2024-059", access: "Open Access" },
  { id: "60", title: "Vertical Farming: Economic Viability Assessment", authors: ["Kozai, T.", "Niu, G."], abstract: "Comprehensive economic model comparing vertical farming with conventional agriculture across 20 crop types.", type: "White Paper", field: "Environmental Science", journal: "World Bank", year: 2024, citations: 140, doi: "10.1596/wb.2024.060", access: "Open Access" },
  { id: "61", title: "Attention Mechanisms in Computer Vision", authors: ["Dosovitskiy, A.", "Kolesnikov, A."], abstract: "Efficient self-attention for high-resolution image processing enabling real-time video understanding.", type: "Conference Paper", field: "Computer Science", journal: "CVPR 2024", year: 2024, citations: 680, doi: "10.1109/CVPR.2024.061", access: "Open Access" },
  { id: "62", title: "Biodegradable Electronics for Medical Implants", authors: ["Rogers, J.", "Hwang, S."], abstract: "Transient electronic implants for post-surgical monitoring that dissolve safely within the body after use.", type: "Journal Article", field: "Materials Science", journal: "Science Advances", year: 2024, citations: 260, doi: "10.1126/sciadv.2024.062", access: "Open Access" },
  { id: "63", title: "Universal Basic Income: Evidence from Global Pilots", authors: ["Marinescu, I.", "Hoynes, H."], abstract: "Meta-analysis of 23 UBI pilot programs across 15 countries examining labor supply, wellbeing, and fiscal impacts.", type: "Meta-Analysis", field: "Economics", journal: "Journal of Economic Perspectives", year: 2024, citations: 420, doi: "10.1257/jep.38.2.063", access: "Restricted" },
  { id: "64", title: "Peptide Therapeutics: Next-Generation Drug Design", authors: ["Henninot, A.", "Collins, J."], abstract: "AI-designed cyclic peptides with enhanced oral bioavailability and target selectivity for metabolic diseases.", type: "Journal Article", field: "Bioinformatics", journal: "Nature Chemical Biology", year: 2024, citations: 340, doi: "10.1038/s41589-024-064", access: "Restricted" },
  { id: "65", title: "Earthquake Early Warning Systems Using IoT", authors: ["Allen, R.", "Melgar, D."], abstract: "Dense IoT sensor network for earthquake early warning achieving 30-second advance notification with 98% accuracy.", type: "Technical Report", field: "Physics", journal: "USGS Technical Reports", year: 2024, citations: 80, doi: "10.3133/usgs.2024.065", access: "Open Access" },
  { id: "66", title: "Trauma-Informed Education: A Systematic Review", authors: ["Brunzell, T.", "Stokes, H."], abstract: "Systematic review of trauma-informed practices in K-12 education showing significant improvements in academic outcomes.", type: "Systematic Review", field: "Psychology", journal: "Review of Educational Research", year: 2024, citations: 210, doi: "10.3102/00346543.2024.066", access: "Restricted" },
  { id: "67", title: "Federated Analytics for Smart Cities", authors: ["McMahan, B.", "Ramage, D."], abstract: "Privacy-preserving federated analytics platform for urban planning using data from 50 million mobile devices.", type: "Conference Paper", field: "Computer Science", journal: "KDD 2024", year: 2024, citations: 160, doi: "10.1145/3637528.067", access: "Open Access" },
  { id: "68", title: "Stem Cell Therapy for Spinal Cord Injury", authors: ["Yamanaka, S.", "Okano, H."], abstract: "Phase III clinical trial of iPSC-derived neural progenitors for chronic spinal cord injury with functional recovery.", type: "Journal Article", field: "Biotechnology", journal: "Cell Stem Cell", year: 2025, citations: 450, doi: "10.1016/j.stem.2025.068", access: "Restricted" },
  { id: "69", title: "High-Temperature Superconductivity at Ambient Pressure", authors: ["Dias, R.", "Salamat, A."], abstract: "Room-temperature superconducting hydride compound confirmed by independent replication at ambient pressure.", type: "Journal Article", field: "Physics", journal: "Nature", year: 2025, citations: 1500, doi: "10.1038/s41586-025-069", access: "Open Access" },
  { id: "70", title: "Circular Economy Metrics for Corporate Reporting", authors: ["Geissdoerfer, M.", "Savaget, P."], abstract: "Standardized circular economy performance framework adopted by Fortune 500 companies for sustainability reporting.", type: "White Paper", field: "Economics", journal: "Ellen MacArthur Foundation", year: 2024, citations: 190, doi: "10.2139/ssrn.4070070", access: "Open Access" },
  { id: "71", title: "Robot-Assisted Surgery: Outcomes Meta-Analysis", authors: ["Intuitive, R.", "Yuh, D."], abstract: "Meta-analysis of 200 RCTs comparing robot-assisted vs. conventional surgery across 15 specialties.", type: "Meta-Analysis", field: "Medical Informatics", journal: "Annals of Surgery", year: 2024, citations: 520, doi: "10.1097/SLA.2024.071", access: "Restricted" },
  { id: "72", title: "Quantum Machine Learning: Theory and Applications", authors: ["Biamonte, J.", "Wittek, P."], abstract: "Comprehensive framework connecting quantum computing advantages to machine learning tasks with provable speedups.", type: "Journal Article", field: "Physics", journal: "Reviews of Modern Physics", year: 2024, citations: 380, doi: "10.1103/RevModPhys.96.072", access: "Open Access" },
  { id: "73", title: "Disaster Risk Reduction in Coastal Communities", authors: ["Wisner, B.", "Blaikie, P."], abstract: "Community-based disaster risk reduction strategies for sea-level rise adaptation in 30 Pacific Island nations.", type: "Case Study", field: "Public Policy", journal: "Global Environmental Change", year: 2024, citations: 170, doi: "10.1016/j.gloenvcha.2024.073", access: "Open Access" },
  { id: "74", title: "Continual Learning in Neural Networks", authors: ["Kirkpatrick, J.", "Pascanu, R."], abstract: "Novel regularization techniques for continual learning eliminating catastrophic forgetting in sequential task settings.", type: "Conference Paper", field: "Computer Science", journal: "ICML 2024", year: 2024, citations: 270, doi: "10.5555/icml2024.074", access: "Open Access" },
  { id: "75", title: "Atmospheric Methane Monitoring via Satellite", authors: ["Jacob, D.", "Turner, A."], abstract: "Global methane emission mapping at 25m resolution using hyperspectral satellite imagery with point-source detection.", type: "Journal Article", field: "Environmental Science", journal: "Science", year: 2024, citations: 390, doi: "10.1126/science.2024.075", access: "Restricted" },
  { id: "76", title: "Digital Literacy and Economic Mobility", authors: ["Hargittai, E.", "Hsieh, Y."], abstract: "Longitudinal study linking digital literacy skills to income mobility across socioeconomic strata in 25 countries.", type: "Journal Article", field: "Public Policy", journal: "American Sociological Review", year: 2024, citations: 240, doi: "10.1177/00031224.2024.076", access: "Restricted" },
  { id: "77", title: "3D Bioprinting of Functional Organs", authors: ["Atala, A.", "Murphy, S."], abstract: "Vascularized kidney tissue construct with functional filtration demonstrated in large animal model.", type: "Journal Article", field: "Biotechnology", journal: "Nature Medicine", year: 2025, citations: 560, doi: "10.1038/s41591-025-077", access: "Restricted" },
  { id: "78", title: "Sparse Transformers for Efficient NLP", authors: ["Child, R.", "Gray, S."], abstract: "Sparse attention patterns reducing transformer complexity from O(n²) to O(n√n) for long-document processing.", type: "Conference Paper", field: "Computer Science", journal: "NeurIPS 2024", year: 2024, citations: 330, doi: "10.5555/neurips.2024.078", access: "Open Access" },
  { id: "79", title: "Soil Carbon Sequestration Through Regenerative Agriculture", authors: ["Lal, R.", "Minasny, B."], abstract: "Global potential assessment of regenerative agricultural practices for carbon sequestration: 2-5 Gt CO2/year.", type: "Systematic Review", field: "Environmental Science", journal: "Nature Reviews Earth & Environment", year: 2024, citations: 440, doi: "10.1038/s43017-024-079", access: "Open Access" },
  { id: "80", title: "Fairness in Machine Learning: A Survey", authors: ["Mehrabi, N.", "Morstatter, F."], abstract: "Comprehensive taxonomy of fairness definitions, bias sources, and mitigation strategies in ML systems.", type: "Journal Article", field: "Computer Science", journal: "ACM Computing Surveys", year: 2024, citations: 890, doi: "10.1145/3616540.080", access: "Open Access" },
  { id: "81", title: "Nuclear Fusion: ITER Progress Report", authors: ["Bigot, B.", "Shimada, M."], abstract: "First plasma achievement at ITER with deuterium-tritium fusion performance exceeding design specifications.", type: "Technical Report", field: "Physics", journal: "ITER Organization", year: 2025, citations: 120, doi: "10.13182/iter.2025.081", access: "Open Access" },
  { id: "82", title: "Gene Drive Technology for Malaria Elimination", authors: ["Burt, A.", "Hammond, A."], abstract: "Contained field trial of gene drive modified mosquitoes showing 90% reduction in malaria transmission.", type: "Journal Article", field: "Biotechnology", journal: "Nature", year: 2025, citations: 380, doi: "10.1038/s41586-025-082", access: "Restricted" },
  { id: "83", title: "Cryptocurrency Regulation and Market Stability", authors: ["Gandal, N.", "Halaburda, H."], abstract: "Empirical analysis of regulatory interventions and their impact on cryptocurrency market volatility across 40 jurisdictions.", type: "Journal Article", field: "Economics", journal: "Journal of Financial Economics", year: 2024, citations: 260, doi: "10.1016/j.jfineco.2024.083", access: "Restricted" },
  { id: "84", title: "Brain-Computer Interfaces for Communication", authors: ["Hochberg, L.", "Shenoy, K."], abstract: "High-bandwidth intracortical BCI enabling paralyzed patients to type at 90 words per minute with 99% accuracy.", type: "Journal Article", field: "Medical Informatics", journal: "Nature", year: 2025, citations: 720, doi: "10.1038/s41586-025-084", access: "Open Access" },
  { id: "85", title: "Adaptive Learning Platforms in Higher Education", authors: ["VanLehn, K.", "Koedinger, K."], abstract: "AI-adaptive courseware improving student outcomes by 0.5 SD in STEM subjects across 50 universities.", type: "Journal Article", field: "Applied Linguistics", journal: "Computers & Education", year: 2024, citations: 280, doi: "10.1016/j.compedu.2024.085", access: "Open Access" },
  { id: "86", title: "Dark Matter Detection: Next-Generation Experiments", authors: ["Aprile, E.", "Baudis, L."], abstract: "Design and projected sensitivity of 50-tonne liquid xenon detector for WIMP dark matter searches.", type: "Technical Report", field: "Physics", journal: "CERN Reports", year: 2024, citations: 140, doi: "10.17181/cern.2024.086", access: "Open Access" },
  { id: "87", title: "Autonomous Ship Navigation Systems", authors: ["Rødseth, Ø.", "Tjora, Å."], abstract: "AI-based autonomous navigation for commercial shipping achieving IMO safety standards in open ocean tests.", type: "Conference Paper", field: "Computer Science", journal: "IEEE ITSC 2024", year: 2024, citations: 95, doi: "10.1109/ITSC.2024.087", access: "Open Access" },
  { id: "88", title: "Microbiome Engineering for Crop Resilience", authors: ["Busby, P.", "Soman, C."], abstract: "Synthetic microbial consortia enhancing drought tolerance in wheat by 45% under field conditions.", type: "Journal Article", field: "Biotechnology", journal: "Nature Plants", year: 2024, citations: 310, doi: "10.1038/s41477-024-088", access: "Open Access" },
  { id: "89", title: "Housing Policy and Wealth Inequality", authors: ["Piketty, T.", "Saez, E."], abstract: "Cross-country analysis of housing policies and their contribution to wealth inequality over 50 years.", type: "Journal Article", field: "Economics", journal: "Journal of Economic Literature", year: 2024, citations: 470, doi: "10.1257/jel.62.2.089", access: "Restricted" },
  { id: "90", title: "Edge Computing for Real-Time Video Analytics", authors: ["Shi, W.", "Dustdar, S."], abstract: "Low-latency edge computing framework enabling real-time object detection at 60fps on resource-constrained devices.", type: "Journal Article", field: "Computer Science", journal: "IEEE Internet of Things Journal", year: 2024, citations: 220, doi: "10.1109/JIOT.2024.090", access: "Open Access" },
  { id: "91", title: "Psychedelic-Assisted Therapy: Clinical Evidence", authors: ["Carhart-Harris, R.", "Nutt, D."], abstract: "Phase III trial of psilocybin-assisted therapy for treatment-resistant depression showing 70% remission at 12 months.", type: "Journal Article", field: "Psychology", journal: "New England Journal of Medicine", year: 2025, citations: 890, doi: "10.1056/NEJMoa2025091", access: "Restricted" },
  { id: "92", title: "Metamaterials for Acoustic Cloaking", authors: ["Cummer, S.", "Christensen, J."], abstract: "Practical acoustic metamaterial cloak demonstrated for underwater applications with broadband performance.", type: "Journal Article", field: "Materials Science", journal: "Physical Review Letters", year: 2024, citations: 170, doi: "10.1103/PhysRevLett.132.092", access: "Open Access" },
  { id: "93", title: "COVID-19 Long-Term Sequelae: 5-Year Follow-Up", authors: ["Sudre, C.", "Murray, B."], abstract: "Largest long COVID cohort study tracking 100,000 patients over 5 years documenting persistent symptoms and recovery.", type: "Journal Article", field: "Medical Informatics", journal: "The Lancet", year: 2025, citations: 1200, doi: "10.1016/S0140-6736(25)00093", access: "Open Access" },
  { id: "94", title: "Algorithmic Trading and Market Microstructure", authors: ["Hasbrouck, J.", "Saar, G."], abstract: "High-frequency data analysis revealing impact of algorithmic trading on price discovery and market liquidity.", type: "Journal Article", field: "Economics", journal: "Review of Financial Studies", year: 2024, citations: 310, doi: "10.1093/rfs/2024.094", access: "Restricted" },
  { id: "95", title: "Self-Healing Polymers for Aerospace Applications", authors: ["White, S.", "Sottos, N."], abstract: "Autonomic healing polymer composites restoring 95% structural integrity after impact damage without intervention.", type: "Journal Article", field: "Materials Science", journal: "Advanced Materials", year: 2024, citations: 240, doi: "10.1002/adma.2024.095", access: "Restricted" },
  { id: "96", title: "Time Series Foundation Models", authors: ["Rasul, K.", "Ashok, A."], abstract: "Pre-trained foundation model for time series forecasting achieving state-of-art across 30 benchmark datasets.", type: "Conference Paper", field: "Computer Science", journal: "ICLR 2025", year: 2025, citations: 180, doi: "10.5555/iclr2025.096", access: "Open Access" },
  { id: "97", title: "Biodiversity Loss and Ecosystem Services Valuation", authors: ["Dasgupta, P.", "Kinzig, A."], abstract: "Economic valuation framework for biodiversity loss estimating $10T annual impact on global ecosystem services.", type: "Systematic Review", field: "Environmental Science", journal: "Nature", year: 2024, citations: 560, doi: "10.1038/s41586-024-097", access: "Open Access" },
  { id: "98", title: "Emotion AI: Affective Computing Ethics", authors: ["Picard, R.", "Klein, J."], abstract: "Ethical framework for emotion recognition AI addressing consent, accuracy disparities, and manipulation risks.", type: "Journal Article", field: "Psychology", journal: "Science Robotics", year: 2024, citations: 190, doi: "10.1126/scirobotics.2024.098", access: "Open Access" },
  { id: "99", title: "Hydrogen Fuel Cell Vehicles: Infrastructure Challenges", authors: ["Staffell, I.", "Scamman, D."], abstract: "Techno-economic analysis of hydrogen fueling infrastructure deployment strategies for passenger vehicles.", type: "White Paper", field: "Environmental Science", journal: "IEA", year: 2024, citations: 130, doi: "10.1787/iea.2024.099", access: "Open Access" },
  { id: "100", title: "Computational Creativity in Music Composition", authors: ["Briot, J.", "Pachet, F."], abstract: "Deep generative models producing original musical compositions indistinguishable from human-composed works in blind tests.", type: "Journal Article", field: "Computer Science", journal: "Artificial Intelligence", year: 2024, citations: 150, doi: "10.1016/j.artint.2024.100", access: "Open Access" },
  { id: "101", title: "Agricultural Robotics for Harvesting", authors: ["Bac, C.", "van Henten, E."], abstract: "Soft robotic gripper system for delicate fruit harvesting achieving 98% success rate without bruising.", type: "Journal Article", field: "Computer Science", journal: "Journal of Field Robotics", year: 2024, citations: 120, doi: "10.1002/rob.2024.101", access: "Open Access" },
  { id: "102", title: "Longevity Research: Senolytics Clinical Trials", authors: ["Kirkland, J.", "Tchkonia, T."], abstract: "Phase II results of senolytic drug combination showing biological age reversal by 5 years in elderly patients.", type: "Journal Article", field: "Biotechnology", journal: "Nature Aging", year: 2025, citations: 670, doi: "10.1038/s43587-025-102", access: "Restricted" },
  { id: "103", title: "Augmented Reality in Surgical Training", authors: ["Vávra, P.", "Gállik, J."], abstract: "AR-guided surgical simulation reducing training time by 50% while improving procedural accuracy in residents.", type: "Case Study", field: "Medical Informatics", journal: "Surgical Endoscopy", year: 2024, citations: 180, doi: "10.1007/s00464-2024-103", access: "Open Access" },
  { id: "104", title: "Central Bank Digital Currencies: Design Principles", authors: ["Adrian, T.", "Mancini-Griffoli, T."], abstract: "Comparative analysis of CBDC designs across 20 central banks with privacy and interoperability frameworks.", type: "Working Paper", field: "Economics", journal: "IMF Working Papers", year: 2024, citations: 290, doi: "10.5089/imf.2024.104", access: "Open Access" },
  { id: "105", title: "Wildfire Prediction Using Machine Learning", authors: ["Jain, P.", "Coogan, S."], abstract: "Ensemble ML model for wildfire risk prediction achieving 7-day advance warning with 92% spatial accuracy.", type: "Journal Article", field: "Environmental Science", journal: "Nature Communications", year: 2024, citations: 250, doi: "10.1038/s41467-024-105", access: "Open Access" },
  { id: "106", title: "Ethics of Autonomous Weapons Systems", authors: ["Scharre, P.", "Horowitz, M."], abstract: "International law analysis and proposed governance frameworks for lethal autonomous weapons systems.", type: "Book Chapter", field: "Public Policy", journal: "Cambridge University Press", year: 2024, citations: 340, doi: "10.1017/9781108.2024.106", access: "Restricted" },
  { id: "107", title: "Perovskite-Silicon Tandem Solar Cells", authors: ["De Wolf, S.", "Ballif, C."], abstract: "Record 33.9% efficiency perovskite-silicon tandem cell with 25-year stability projection.", type: "Journal Article", field: "Materials Science", journal: "Science", year: 2025, citations: 410, doi: "10.1126/science.2025.107", access: "Open Access" },
  { id: "108", title: "Speech-Language Pathology and AI Diagnostics", authors: ["Green, J.", "Patel, R."], abstract: "Deep learning system for early detection of speech disorders in children aged 2-5 from 30-second audio samples.", type: "Journal Article", field: "Applied Linguistics", journal: "Journal of Speech, Language, and Hearing Research", year: 2024, citations: 140, doi: "10.1044/2024_JSLHR.108", access: "Open Access" },
  { id: "109", title: "Distributed Ledger for Scientific Data Provenance", authors: ["Tenopir, C.", "Rice, N."], abstract: "Blockchain-based system ensuring reproducibility and provenance tracking for scientific datasets across institutions.", type: "Technical Report", field: "Computer Science", journal: "DataCite Technical Reports", year: 2024, citations: 70, doi: "10.5438/datacite.2024.109", access: "Open Access" },
  { id: "110", title: "Childhood Obesity Prevention: School-Based Programs", authors: ["Waters, E.", "de Silva-Sanigorski, A."], abstract: "Cluster RCT of comprehensive school nutrition and activity programs reducing childhood obesity by 25%.", type: "Journal Article", field: "Public Policy", journal: "BMJ", year: 2024, citations: 350, doi: "10.1136/bmj.2024.110", access: "Open Access" },
  { id: "111", title: "Topological Quantum Error Correction", authors: ["Fowler, A.", "Mariantoni, M."], abstract: "Surface code implementation on 1000-qubit processor achieving logical error rates below 10⁻⁶.", type: "Journal Article", field: "Physics", journal: "Nature Physics", year: 2025, citations: 290, doi: "10.1038/s41567-025-111", access: "Restricted" },
  { id: "112", title: "Refugee Integration and Labor Market Outcomes", authors: ["Brell, C.", "Dustmann, C."], abstract: "Quasi-experimental evidence on refugee integration policies and employment outcomes across EU member states.", type: "Journal Article", field: "Economics", journal: "Journal of the European Economic Association", year: 2024, citations: 210, doi: "10.1093/jeea/2024.112", access: "Restricted" },
];

export type UserResearchTier = "free" | "pro" | "elite";

const AI_LIMITS: Record<UserResearchTier, number> = {
  free: 3,
  pro: 50,
  elite: Infinity,
};

export function useResearchPapers() {
  const [papers, setPapers] = useState<ResearchPaper[]>(SAMPLE_PAPERS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PaperType | "All">("All");
  const [fieldFilter, setFieldFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("citations-desc");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [summaries, setSummaries] = useState<Record<string, PaperSummary>>({});
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [aiActionsUsed, setAiActionsUsed] = useState(0);
  const { ask, loading: aiLoading } = useUniversalAI();
  const { currentTier } = useUserSubscription();

  const userTier: UserResearchTier = useMemo(() => {
    if (!currentTier) return "free";
    const name = currentTier.name.toLowerCase();
    if (name === "elite") return "elite";
    if (name === "pro") return "pro";
    return "free";
  }, [currentTier]);

  const aiLimit = AI_LIMITS[userTier];
  const canUseAI = aiActionsUsed < aiLimit;

  const canAccessPaper = useCallback((paper: ResearchPaper) => {
    if (paper.access === "Open Access") return true;
    return userTier === "pro" || userTier === "elite";
  }, [userTier]);

  const trackAIAction = useCallback(() => {
    setAiActionsUsed((prev) => prev + 1);
  }, []);

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

  const readingStats = useMemo<ReadingStats>(() => {
    const byField: Record<string, number> = {};
    for (const id of readingHistory) {
      const paper = papers.find((p) => p.id === id);
      if (paper) byField[paper.field] = (byField[paper.field] || 0) + 1;
    }
    const topField = Object.entries(byField).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { byField, topField, streak: Math.min(readingHistory.length, 7), totalAnalyzed: readingHistory.length };
  }, [readingHistory, papers]);

  const filtered = useMemo(() => {
    let result = papers.filter((p) => {
      if (showBookmarked && !p.bookmarked) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))) return false;
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      if (fieldFilter !== "All" && p.field !== fieldFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "citations-desc": return b.citations - a.citations;
        case "year-desc": return b.year - a.year;
        case "year-asc": return a.year - b.year;
        case "title-asc": return a.title.localeCompare(b.title);
        case "analyzed": {
          const aAnalyzed = readingHistory.includes(a.id) ? 1 : 0;
          const bAnalyzed = readingHistory.includes(b.id) ? 1 : 0;
          return bAnalyzed - aAnalyzed;
        }
        default: return 0;
      }
    });

    return result;
  }, [papers, search, typeFilter, fieldFilter, sortBy, showBookmarked, readingHistory]);

  const toggleBookmark = useCallback((id: string) => {
    setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));
  }, []);

  const toggleCompareSelect = useCallback((id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) { toast.info("You can compare up to 3 papers"); return prev; }
      return [...prev, id];
    });
  }, []);

  const clearCompareSelection = useCallback(() => setSelectedForCompare([]), []);

  const summarizePaper = useCallback(
    async (paper: ResearchPaper): Promise<PaperSummary | null> => {
      if (!canAccessPaper(paper)) {
        toast.error("Upgrade to Pro or Elite to access restricted papers");
        return null;
      }
      if (!canUseAI) {
        toast.error(`AI action limit reached for ${userTier} tier. Upgrade for more.`);
        return null;
      }
      const result = await ask<PaperSummary>("research" as AIDomain, "summarize-paper", {
        title: paper.title, abstract: paper.abstract, authors: paper.authors,
        journal: paper.journal, type: paper.type, field: paper.field,
      });
      if (result) {
        trackAIAction();
        setSummaries((prev) => ({ ...prev, [paper.id]: result }));
        setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, summarized: true } : p)));
        setReadingHistory((prev) => (prev.includes(paper.id) ? prev : [...prev, paper.id]));
      }
      return result;
    },
    [ask, canAccessPaper, canUseAI, userTier, trackAIAction]
  );

  const comparePapers = useCallback(
    async (paperIds: string[]): Promise<PaperComparison | null> => {
      const papersToCompare = papers.filter((p) => paperIds.includes(p.id));
      if (papersToCompare.length < 2) return null;
      return ask<PaperComparison>("research" as AIDomain, "compare-papers", {
        papers: papersToCompare.map((p) => ({ title: p.title, abstract: p.abstract, authors: p.authors, field: p.field, citations: p.citations, year: p.year })),
      });
    },
    [ask, papers]
  );

  const getRelatedPapers = useCallback(
    async (paper: ResearchPaper): Promise<string[] | null> => {
      const result = await ask<{ relatedIds: string[] }>("research" as AIDomain, "related-papers", {
        paper: { title: paper.title, field: paper.field, abstract: paper.abstract },
        availablePapers: papers.filter((p) => p.id !== paper.id).map((p) => ({ id: p.id, title: p.title, field: p.field })),
      });
      return result?.relatedIds || null;
    },
    [ask, papers]
  );

  const exportCitations = useCallback(() => {
    const toExport = papers.filter((p) => p.bookmarked || p.summarized);
    if (toExport.length === 0) { toast.info("No bookmarked or analyzed papers to export"); return; }
    const citations = toExport.map((p) => {
      const authors = p.authors.join(", ");
      return `${authors} (${p.year}). ${p.title}. ${p.journal}. https://doi.org/${p.doi}`;
    }).join("\n\n");
    navigator.clipboard.writeText(citations);
    toast.success(`${toExport.length} citation(s) copied to clipboard`);
  }, [papers]);

  const getImprovementPlan = useCallback(async () => {
    return ask("research" as AIDomain, "improve-level", {
      currentLevel: level, ...metrics,
      papersRead: metrics.papersRead + readingHistory.length,
      readingHistory: readingHistory.length,
    });
  }, [ask, level, metrics, readingHistory]);

  // AI Chat with Document
  const chatWithPaper = useCallback(
    async (paper: ResearchPaper, question: string): Promise<string | null> => {
      const result = await ask<{ answer: string }>("research" as AIDomain, "chat-with-paper", {
        paper: { title: paper.title, abstract: paper.abstract, authors: paper.authors, field: paper.field, methodology: summaries[paper.id]?.methodology },
        question,
      });
      return result?.answer || null;
    },
    [ask, summaries]
  );

  // Plain English Summary
  const simplifySummary = useCallback(
    async (paper: ResearchPaper): Promise<string | null> => {
      const summary = summaries[paper.id];
      if (!summary) return null;
      const result = await ask<{ simplified: string }>("research" as AIDomain, "simplify-summary", {
        title: paper.title, summary: summary.summary, findings: summary.keyFindings,
      });
      return result?.simplified || null;
    },
    [ask, summaries]
  );

  // Research Gap Finder
  const findResearchGaps = useCallback(async () => {
    const analyzed = papers.filter((p) => readingHistory.includes(p.id));
    if (analyzed.length < 2) return null;
    return ask<{ gaps: string[]; contradictions: string[]; connections: string[]; recommendations: string[] }>(
      "research" as AIDomain, "find-research-gaps", {
        papers: analyzed.map((p) => ({ title: p.title, field: p.field, abstract: p.abstract, year: p.year })),
      }
    );
  }, [ask, papers, readingHistory]);

  // Literature Review Outline
  const generateLitReview = useCallback(
    async (topic: string): Promise<string | null> => {
      const analyzed = papers.filter((p) => readingHistory.includes(p.id) || p.summarized);
      const result = await ask<{ outline: string }>("research" as AIDomain, "lit-review-outline", {
        topic,
        papers: analyzed.map((p) => ({
          title: p.title, authors: p.authors, year: p.year, field: p.field,
          abstract: p.abstract, journal: p.journal,
        })),
      });
      return result?.outline || null;
    },
    [ask, papers, readingHistory]
  );

  // Annotated Bibliography
  const generateAnnotatedBib = useCallback(async (): Promise<string | null> => {
    const toExport = papers.filter((p) => p.bookmarked || p.summarized);
    if (toExport.length === 0) { toast.info("No bookmarked or analyzed papers"); return null; }
    const result = await ask<{ bibliography: string }>("research" as AIDomain, "annotated-bibliography", {
      papers: toExport.map((p) => ({
        title: p.title, authors: p.authors, year: p.year, journal: p.journal,
        doi: p.doi, abstract: p.abstract, field: p.field,
        summary: summaries[p.id]?.summary,
      })),
    });
    return result?.bibliography || null;
  }, [ask, papers, summaries]);

  return {
    papers: filtered, allPapers: papers,
    search, setSearch, typeFilter, setTypeFilter, fieldFilter, setFieldFilter,
    sortBy, setSortBy, showBookmarked, setShowBookmarked,
    fields, paperTypes,
    toggleBookmark, summarizePaper, summaries, aiLoading,
    metrics: { ...metrics, papersRead: metrics.papersRead + readingHistory.length },
    score, level, nextLevel, progress, readingHistory, readingStats,
    getImprovementPlan, comparePapers, getRelatedPapers, exportCitations,
    selectedForCompare, toggleCompareSelect, clearCompareSelection,
    chatWithPaper, simplifySummary, findResearchGaps, generateLitReview, generateAnnotatedBib,
    userTier, canUseAI, canAccessPaper, aiActionsUsed, aiLimit,
  };
}
