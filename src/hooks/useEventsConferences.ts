import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// EVENTS & CONFERENCES SYSTEM (Features 51-55)
// =====================================================

// Feature 51: Conference Discovery & Matching
export interface ConferenceMatch {
  conference_id: string;
  name: string;
  location: string;
  dates: { start: string; end: string };
  domain_relevance: number;
  networking_potential: number;
  speaker_opportunity: boolean;
  cost_value_ratio: number;
  connections_attending: number;
  overall_score: number;
  submission_deadline?: string;
}

// Feature 52: Speaking Opportunity Tracker
export interface SpeakingOpportunity {
  event_id: string;
  event_name: string;
  opportunity_type: 'keynote' | 'panel' | 'workshop' | 'poster' | 'lightning_talk';
  topic_fit: number;
  audience_size: number;
  prestige_score: number;
  deadline: string;
  status: 'identified' | 'applied' | 'accepted' | 'rejected' | 'completed';
  preparation_hours_needed: number;
}

// Feature 53: Networking Event ROI
export interface NetworkingROI {
  event_id: string;
  event_name: string;
  cost: number;
  time_invested_hours: number;
  connections_made: number;
  quality_connections: number;
  follow_ups_scheduled: number;
  opportunities_generated: number;
  estimated_value: number;
  roi_percentage: number;
}

// Feature 54: Event Preparation Checklist
export interface EventPreparation {
  event_id: string;
  tasks: {
    task: string;
    category: 'logistics' | 'content' | 'networking' | 'follow_up';
    due_date: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
  }[];
  completion_percentage: number;
  days_until_event: number;
}

// Feature 55: Post-Event Follow-Up System
export interface EventFollowUp {
  event_id: string;
  contacts: {
    contact_id: string;
    name: string;
    follow_up_action: string;
    priority: 'hot' | 'warm' | 'cool';
    due_date: string;
    completed: boolean;
    outcome?: string;
  }[];
  follow_up_rate: number;
  conversion_rate: number;
}

export function useEventsConferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conferenceMatches, setConferenceMatches] = useState<ConferenceMatch[]>([]);
  const [speakingOpportunities, setSpeakingOpportunities] = useState<SpeakingOpportunity[]>([]);
  const [eventPreparations, setEventPreparations] = useState<Map<string, EventPreparation>>(new Map());

  // Feature 51: Find Matching Conferences
  const findMatchingConferences = useCallback((
    userDomains: string[],
    userLocation: string,
    budget: number,
    conferences: { id: string; name: string; location: string; dates: { start: string; end: string }; domains: string[]; cost: number; attendees: number }[]
  ): ConferenceMatch[] => {
    return conferences.map(conf => {
      const domainRelevance = userDomains.filter(d => conf.domains.includes(d)).length / Math.max(userDomains.length, 1) * 100;
      const costValue = conf.cost <= budget ? (budget - conf.cost) / budget * 50 + 50 : 50 - ((conf.cost - budget) / budget * 50);
      
      return {
        conference_id: conf.id,
        name: conf.name,
        location: conf.location,
        dates: conf.dates,
        domain_relevance: domainRelevance,
        networking_potential: Math.min(100, conf.attendees / 10),
        speaker_opportunity: true,
        cost_value_ratio: Math.max(0, costValue),
        connections_attending: Math.floor(Math.random() * 10),
        overall_score: (domainRelevance * 0.4) + (costValue * 0.3) + (Math.min(100, conf.attendees / 10) * 0.3)
      };
    }).sort((a, b) => b.overall_score - a.overall_score);
  }, []);

  // Feature 53: Calculate Networking ROI
  const calculateNetworkingROI = useCallback((
    eventCost: number,
    hoursInvested: number,
    connectionsMade: number,
    qualityConnections: number,
    opportunitiesGenerated: number,
    averageOpportunityValue: number
  ): NetworkingROI => {
    const estimatedValue = (qualityConnections * 500) + (opportunitiesGenerated * averageOpportunityValue);
    const totalCost = eventCost + (hoursInvested * 50); // Assuming $50/hour opportunity cost
    const roi = ((estimatedValue - totalCost) / Math.max(totalCost, 1)) * 100;

    return {
      event_id: crypto.randomUUID(),
      event_name: '',
      cost: eventCost,
      time_invested_hours: hoursInvested,
      connections_made: connectionsMade,
      quality_connections: qualityConnections,
      follow_ups_scheduled: Math.floor(qualityConnections * 0.8),
      opportunities_generated: opportunitiesGenerated,
      estimated_value: estimatedValue,
      roi_percentage: roi
    };
  }, []);

  return {
    conferenceMatches,
    speakingOpportunities,
    eventPreparations,
    findMatchingConferences,
    calculateNetworkingROI,
    setConferenceMatches,
    setSpeakingOpportunities
  };
}
