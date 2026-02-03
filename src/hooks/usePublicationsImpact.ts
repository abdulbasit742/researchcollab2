import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// PUBLICATIONS & SCHOLARLY IMPACT (Features 56-60)
// =====================================================

// Feature 56: Citation Network Analysis
export interface CitationNetwork {
  publication_id: string;
  total_citations: number;
  self_citations: number;
  influential_citations: number;
  citation_velocity: number; // citations per year
  citing_domains: { domain: string; count: number }[];
  citation_sentiment: 'positive' | 'neutral' | 'critical';
  h_index_contribution: number;
}

// Feature 57: Co-Author Network Visualization
export interface CoAuthorNetwork {
  user_id: string;
  co_authors: {
    author_id: string;
    name: string;
    publications_together: number;
    first_collaboration: string;
    relationship_strength: number;
    complementary_expertise: string[];
  }[];
  network_breadth: number;
  collaboration_diversity: number;
  key_collaborators: string[];
}

// Feature 58: Publication Pipeline Management
export interface PublicationPipeline {
  publications: {
    id: string;
    title: string;
    stage: 'ideation' | 'research' | 'writing' | 'review' | 'revision' | 'submitted' | 'published';
    target_journal: string;
    co_authors: string[];
    deadline: string;
    progress_percentage: number;
    blockers: string[];
  }[];
  average_time_to_publication: number;
  success_rate: number;
}

// Feature 59: Journal Fit Scoring
export interface JournalFit {
  journal_id: string;
  journal_name: string;
  topic_alignment: number;
  methodology_fit: number;
  impact_factor: number;
  acceptance_rate: number;
  review_time_avg_weeks: number;
  audience_relevance: number;
  overall_fit_score: number;
  recommendation: 'strong_fit' | 'good_fit' | 'moderate_fit' | 'weak_fit';
}

// Feature 60: Research Impact Dashboard
export interface ResearchImpact {
  user_id: string;
  total_publications: number;
  total_citations: number;
  h_index: number;
  i10_index: number;
  citation_trend: 'growing' | 'stable' | 'declining';
  top_cited_work: { title: string; citations: number };
  field_rank_percentile: number;
  altmetric_score: number;
  media_mentions: number;
  policy_citations: number;
}

export function usePublicationsImpact() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [citationNetworks, setCitationNetworks] = useState<Map<string, CitationNetwork>>(new Map());
  const [coAuthorNetwork, setCoAuthorNetwork] = useState<CoAuthorNetwork | null>(null);
  const [publicationPipeline, setPublicationPipeline] = useState<PublicationPipeline | null>(null);
  const [researchImpact, setResearchImpact] = useState<ResearchImpact | null>(null);

  // Feature 56: Analyze Citation Network
  const analyzeCitationNetwork = useCallback((
    publicationId: string,
    citations: { citing_paper: string; domain: string; sentiment: string; is_self: boolean }[]
  ): CitationNetwork => {
    const selfCitations = citations.filter(c => c.is_self).length;
    const influential = citations.filter(c => c.sentiment === 'positive').length;
    
    const domainCounts = citations.reduce((acc, c) => {
      acc[c.domain] = (acc[c.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      publication_id: publicationId,
      total_citations: citations.length,
      self_citations: selfCitations,
      influential_citations: influential,
      citation_velocity: citations.length / 2, // Simplified
      citing_domains: Object.entries(domainCounts).map(([domain, count]) => ({ domain, count })),
      citation_sentiment: influential > citations.length * 0.6 ? 'positive' : influential < citations.length * 0.3 ? 'critical' : 'neutral',
      h_index_contribution: citations.length >= 10 ? 1 : 0
    };
  }, []);

  // Feature 59: Score Journal Fit
  const scoreJournalFit = useCallback((
    paperTopics: string[],
    paperMethodology: string,
    journal: { id: string; name: string; topics: string[]; methodologies: string[]; impactFactor: number; acceptanceRate: number; reviewWeeks: number }
  ): JournalFit => {
    const topicOverlap = paperTopics.filter(t => journal.topics.includes(t)).length / Math.max(paperTopics.length, 1);
    const methodFit = journal.methodologies.includes(paperMethodology) ? 100 : 50;
    
    const overallScore = (topicOverlap * 40) + (methodFit * 0.2) + (journal.impactFactor * 5) + (journal.acceptanceRate * 0.2);

    return {
      journal_id: journal.id,
      journal_name: journal.name,
      topic_alignment: topicOverlap * 100,
      methodology_fit: methodFit,
      impact_factor: journal.impactFactor,
      acceptance_rate: journal.acceptanceRate,
      review_time_avg_weeks: journal.reviewWeeks,
      audience_relevance: topicOverlap * 100,
      overall_fit_score: overallScore,
      recommendation: overallScore > 80 ? 'strong_fit' : overallScore > 60 ? 'good_fit' : overallScore > 40 ? 'moderate_fit' : 'weak_fit'
    };
  }, []);

  // Feature 60: Calculate Research Impact
  const calculateResearchImpact = useCallback((
    publications: { title: string; citations: number; year: number }[]
  ): ResearchImpact => {
    const sortedByCitations = [...publications].sort((a, b) => b.citations - a.citations);
    
    // Calculate h-index
    let hIndex = 0;
    for (let i = 0; i < sortedByCitations.length; i++) {
      if (sortedByCitations[i].citations >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }

    // Calculate i10-index
    const i10Index = publications.filter(p => p.citations >= 10).length;

    const totalCitations = publications.reduce((sum, p) => sum + p.citations, 0);
    const recentCitations = publications.filter(p => p.year >= new Date().getFullYear() - 2)
      .reduce((sum, p) => sum + p.citations, 0);

    return {
      user_id: user?.id || '',
      total_publications: publications.length,
      total_citations: totalCitations,
      h_index: hIndex,
      i10_index: i10Index,
      citation_trend: recentCitations > totalCitations * 0.4 ? 'growing' : 'stable',
      top_cited_work: sortedByCitations[0] || { title: 'N/A', citations: 0 },
      field_rank_percentile: Math.min(99, hIndex * 5),
      altmetric_score: Math.floor(totalCitations * 0.3),
      media_mentions: Math.floor(totalCitations * 0.05),
      policy_citations: Math.floor(totalCitations * 0.02)
    };
  }, [user]);

  return {
    citationNetworks,
    coAuthorNetwork,
    publicationPipeline,
    researchImpact,
    analyzeCitationNetwork,
    scoreJournalFit,
    calculateResearchImpact,
    setPublicationPipeline,
    setResearchImpact
  };
}
