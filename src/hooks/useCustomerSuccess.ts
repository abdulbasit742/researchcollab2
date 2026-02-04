import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Feature Domain: Customer Success & CRM Systems

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: "lead" | "prospect" | "customer" | "churned";
  tier: "free" | "starter" | "pro" | "enterprise";
  mrr: number;
  healthScore: number;
  assignedCsm?: string;
  createdAt: string;
  lastActivity: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: "qualification" | "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  expectedCloseDate: string;
  owner: string;
  nextAction?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  category: string;
  customerId: string;
  assignee?: string;
  createdAt: string;
  firstResponseTime?: number;
  resolutionTime?: number;
}

export interface CustomerJourney {
  id: string;
  customerId: string;
  milestones: { name: string; date: string; completed: boolean }[];
  healthTrend: "improving" | "stable" | "declining";
  riskFactors: string[];
  expansionOpportunities: string[];
}

export function useCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelineValue, setPipelineValue] = useState(2500000);

  const fetchCustomers = useCallback(async () => {
    setCustomers([
      {
        id: "1",
        name: "Sarah Johnson",
        company: "TechCorp Inc",
        email: "sarah@techcorp.com",
        status: "customer",
        tier: "enterprise",
        mrr: 5000,
        healthScore: 85,
        assignedCsm: "Mike Chen",
        createdAt: "2023-06-15",
        lastActivity: "2024-12-10",
      },
    ]);
  }, []);

  const fetchDeals = useCallback(async () => {
    setDeals([
      {
        id: "1",
        title: "Enterprise Upgrade - TechCorp",
        company: "TechCorp Inc",
        value: 120000,
        stage: "proposal",
        probability: 60,
        expectedCloseDate: "2025-02-28",
        owner: "Alex Smith",
        nextAction: "Follow up on proposal",
      },
    ]);
  }, []);

  const createDeal = useCallback(async (deal: Partial<Deal>) => {
    console.log("Creating deal:", deal);
    return { success: true, dealId: "deal-123" };
  }, []);

  const updateDealStage = useCallback(async (dealId: string, stage: Deal["stage"]) => {
    console.log("Updating deal stage:", dealId, stage);
    return { success: true };
  }, []);

  const predictWinProbability = useCallback(async (dealId: string) => {
    console.log("Predicting win probability:", dealId);
    return { probability: 65, factors: [], recommendations: [] };
  }, []);

  return { customers, deals, pipelineValue, fetchCustomers, fetchDeals, createDeal, updateDealStage, predictWinProbability };
}

export function useCustomerHealth() {
  const [healthScores, setHealthScores] = useState<any[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<Customer[]>([]);
  const [churnPredictions, setChurnPredictions] = useState<any[]>([]);

  const calculateHealthScore = useCallback(async (customerId: string) => {
    console.log("Calculating health score:", customerId);
    return { score: 78, factors: [], trend: "stable" };
  }, []);

  const identifyAtRisk = useCallback(async () => {
    console.log("Identifying at-risk customers");
    return { atRisk: [], interventions: [] };
  }, []);

  const predictChurn = useCallback(async (customerId: string) => {
    console.log("Predicting churn:", customerId);
    return { probability: 0.15, riskFactors: [], recommendations: [] };
  }, []);

  const triggerIntervention = useCallback(async (customerId: string, interventionType: string) => {
    console.log("Triggering intervention:", customerId, interventionType);
    return { success: true, taskId: "task-123" };
  }, []);

  return { healthScores, atRiskCustomers, churnPredictions, calculateHealthScore, identifyAtRisk, predictChurn, triggerIntervention };
}

export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState({
    openTickets: 45,
    avgResponseTime: 2.5, // hours
    avgResolutionTime: 24, // hours
    csat: 4.2,
    nps: 45,
  });

  const fetchTickets = useCallback(async () => {
    setTickets([
      {
        id: "1",
        subject: "Integration issue with API",
        description: "Unable to authenticate with the API...",
        priority: "high",
        status: "in_progress",
        category: "technical",
        customerId: "cust-1",
        assignee: "Support Agent 1",
        createdAt: "2024-12-10T10:00:00Z",
        firstResponseTime: 30, // minutes
      },
    ]);
  }, []);

  const createTicket = useCallback(async (ticket: Partial<SupportTicket>) => {
    console.log("Creating ticket:", ticket);
    return { success: true, ticketId: "ticket-123" };
  }, []);

  const assignTicket = useCallback(async (ticketId: string, assigneeId: string) => {
    console.log("Assigning ticket:", ticketId, assigneeId);
    return { success: true };
  }, []);

  const resolveTicket = useCallback(async (ticketId: string, resolution: string) => {
    console.log("Resolving ticket:", ticketId, resolution);
    return { success: true };
  }, []);

  const suggestResolution = useCallback(async (ticketId: string) => {
    console.log("AI suggesting resolution:", ticketId);
    return { suggestions: [], similarTickets: [], knowledgeArticles: [] };
  }, []);

  return { tickets, metrics, fetchTickets, createTicket, assignTicket, resolveTicket, suggestResolution };
}

export function useCustomerJourney() {
  const [journeys, setJourneys] = useState<CustomerJourney[]>([]);
  const [touchpoints, setTouchpoints] = useState<any[]>([]);

  const fetchJourney = useCallback(async (customerId: string) => {
    console.log("Fetching customer journey:", customerId);
    return {
      milestones: [],
      touchpoints: [],
      healthTrend: "stable",
      expansionOpportunities: [],
    };
  }, []);

  const trackTouchpoint = useCallback(async (customerId: string, touchpoint: any) => {
    console.log("Tracking touchpoint:", customerId, touchpoint);
    return { success: true };
  }, []);

  const predictNextBestAction = useCallback(async (customerId: string) => {
    console.log("Predicting next best action:", customerId);
    return { action: "schedule_qbr", reason: "", expectedOutcome: "" };
  }, []);

  const generateJourneyMap = useCallback(async (customerId: string) => {
    return { visualUrl: "/journey-maps/customer-1.png" };
  }, []);

  return { journeys, touchpoints, fetchJourney, trackTouchpoint, predictNextBestAction, generateJourneyMap };
}

export function useRevenueOperations() {
  const [revenueMetrics, setRevenueMetrics] = useState({
    mrr: 500000,
    arr: 6000000,
    nrr: 115,
    expansion: 50000,
    contraction: 10000,
    churn: 15000,
  });
  const [forecasts, setForecasts] = useState<any[]>([]);

  const forecastRevenue = useCallback(async (period: string) => {
    console.log("Forecasting revenue:", period);
    return { forecast: 650000, confidence: 0.85, scenarios: [] };
  }, []);

  const analyzeRetention = useCallback(async () => {
    return { cohortAnalysis: [], retentionCurve: [], insights: [] };
  }, []);

  const calculateLTV = useCallback(async (customerId: string) => {
    console.log("Calculating LTV:", customerId);
    return { ltv: 150000, paybackPeriod: 8, factors: [] };
  }, []);

  const identifyExpansionOpportunities = useCallback(async () => {
    return { opportunities: [], totalPotential: 250000 };
  }, []);

  return { revenueMetrics, forecasts, forecastRevenue, analyzeRetention, calculateLTV, identifyExpansionOpportunities };
}

export function useNPSSurveys() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [npsScore, setNpsScore] = useState(45);
  const [responses, setResponses] = useState<any[]>([]);

  const sendSurvey = useCallback(async (customerId: string, surveyType: string) => {
    console.log("Sending survey:", customerId, surveyType);
    return { success: true, surveyId: "survey-123" };
  }, []);

  const analyzeResponses = useCallback(async () => {
    return { themes: [], sentimentBreakdown: {}, actionItems: [] };
  }, []);

  const triggerFollowUp = useCallback(async (responseId: string) => {
    console.log("Triggering follow-up:", responseId);
    return { success: true };
  }, []);

  return { surveys, npsScore, responses, sendSurvey, analyzeResponses, triggerFollowUp };
}
