import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// GLOBAL MOBILITY & CROSS-BORDER (Features 31-40)
// =====================================================

// Feature 31: Visa & Work Authorization Tracking
export interface VisaStatus {
  visa_type: string;
  country: string;
  status: 'active' | 'pending' | 'expired' | 'renewal_needed';
  issue_date: string;
  expiry_date: string;
  work_authorization: boolean;
  renewal_eligible: boolean;
  days_until_expiry: number;
}

// Feature 32: Cross-Border Collaboration Compliance
export interface CrossBorderCompliance {
  collaboration_id: string;
  countries_involved: string[];
  compliance_requirements: {
    requirement: string;
    status: 'met' | 'pending' | 'not_met';
    deadline?: string;
  }[];
  export_control_check: boolean;
  data_residency_compliant: boolean;
  tax_implications: string[];
}

// Feature 33: International Payment Optimization
export interface PaymentOptimization {
  sender_country: string;
  receiver_country: string;
  amount: number;
  currency: string;
  recommended_methods: {
    method: string;
    fees: number;
    exchange_rate: number;
    transfer_time: string;
    net_amount: number;
  }[];
  best_option: string;
}

// Feature 34: Timezone Collaboration Tools
export interface TimezoneCollaboration {
  participants: { user_id: string; timezone: string; work_hours: { start: number; end: number } }[];
  overlap_windows: { start: string; end: string; duration_hours: number }[];
  best_meeting_times: string[];
  async_communication_recommended: boolean;
}

// Feature 35: International Credential Recognition
export interface CredentialRecognition {
  credential_id: string;
  issuing_country: string;
  credential_type: string;
  recognition_status: {
    country: string;
    recognized: boolean;
    equivalency: string;
    additional_requirements: string[];
  }[];
  global_recognition_score: number;
}

// Feature 36: Remote Work Tax Implications
export interface RemoteWorkTax {
  primary_residence: string;
  work_locations: { country: string; days_worked: number }[];
  tax_obligations: {
    jurisdiction: string;
    obligation_type: 'income_tax' | 'social_security' | 'local_tax';
    estimated_amount: number;
    filing_deadline: string;
  }[];
  treaty_benefits: string[];
  risk_flags: string[];
}

// Feature 37: Cultural Context Intelligence
export interface CulturalContext {
  country: string;
  business_culture: {
    communication_style: 'direct' | 'indirect';
    hierarchy_importance: 'high' | 'medium' | 'low';
    meeting_punctuality: 'strict' | 'flexible';
    negotiation_style: string;
  };
  etiquette_tips: string[];
  holidays_to_note: { name: string; date: string }[];
  language_considerations: string[];
}

// Feature 38: Global Opportunity Matching
export interface GlobalOpportunity {
  opportunity_id: string;
  location: string;
  remote_eligible: boolean;
  visa_sponsorship: boolean;
  relocation_support: boolean;
  cost_of_living_index: number;
  salary_adjusted_value: number;
  quality_of_life_score: number;
  your_eligibility: 'eligible' | 'requires_visa' | 'not_eligible';
}

// Feature 39: International Network Mapping
export interface InternationalNetwork {
  countries: {
    country: string;
    connections: number;
    connection_strength: number;
    key_institutions: string[];
    opportunities_available: number;
  }[];
  strongest_regions: string[];
  expansion_recommendations: string[];
}

// Feature 40: Relocation Decision Support
export interface RelocationAnalysis {
  destination: string;
  factors: {
    factor: string;
    current_score: number;
    destination_score: number;
    importance_weight: number;
  }[];
  overall_recommendation: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
  key_considerations: string[];
  estimated_adjustment_period: string;
}

export function useGlobalMobility() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visaStatuses, setVisaStatuses] = useState<VisaStatus[]>([]);
  const [internationalNetwork, setInternationalNetwork] = useState<InternationalNetwork | null>(null);
  const [culturalContexts, setCulturalContexts] = useState<Map<string, CulturalContext>>(new Map());

  // Feature 31: Check Visa Status
  const checkVisaStatus = useCallback((
    visaType: string,
    country: string,
    issueDate: string,
    expiryDate: string
  ): VisaStatus => {
    const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return {
      visa_type: visaType,
      country,
      status: daysUntilExpiry < 0 ? 'expired' 
        : daysUntilExpiry < 90 ? 'renewal_needed' 
        : 'active',
      issue_date: issueDate,
      expiry_date: expiryDate,
      work_authorization: true,
      renewal_eligible: daysUntilExpiry > -30,
      days_until_expiry: daysUntilExpiry
    };
  }, []);

  // Feature 34: Calculate Timezone Overlaps
  const calculateTimezoneOverlaps = useCallback((
    participants: { user_id: string; timezone: string; workStart: number; workEnd: number }[]
  ): TimezoneCollaboration => {
    // Simplified overlap calculation
    const overlaps: { start: string; end: string; duration_hours: number }[] = [];
    
    // Find common working hours (simplified)
    const commonStart = Math.max(...participants.map(p => p.workStart));
    const commonEnd = Math.min(...participants.map(p => p.workEnd));
    
    if (commonEnd > commonStart) {
      overlaps.push({
        start: `${commonStart}:00`,
        end: `${commonEnd}:00`,
        duration_hours: commonEnd - commonStart
      });
    }

    return {
      participants: participants.map(p => ({
        user_id: p.user_id,
        timezone: p.timezone,
        work_hours: { start: p.workStart, end: p.workEnd }
      })),
      overlap_windows: overlaps,
      best_meeting_times: overlaps.length > 0 
        ? [`${commonStart + 1}:00`, `${commonStart + 2}:00`] 
        : [],
      async_communication_recommended: overlaps.length === 0 || overlaps[0].duration_hours < 2
    };
  }, []);

  // Feature 37: Get Cultural Context
  const getCulturalContext = useCallback((country: string): CulturalContext => {
    // Return cultural intelligence for country
    const contexts: Record<string, Partial<CulturalContext>> = {
      'Japan': {
        business_culture: {
          communication_style: 'indirect',
          hierarchy_importance: 'high',
          meeting_punctuality: 'strict',
          negotiation_style: 'Consensus-building, relationship-focused'
        },
        etiquette_tips: [
          'Exchange business cards with both hands',
          'Bow when greeting',
          'Address people by surname with -san suffix'
        ]
      },
      'Germany': {
        business_culture: {
          communication_style: 'direct',
          hierarchy_importance: 'medium',
          meeting_punctuality: 'strict',
          negotiation_style: 'Data-driven, thorough preparation expected'
        },
        etiquette_tips: [
          'Be punctual - lateness is disrespectful',
          'Use formal titles until invited otherwise',
          'Prepare detailed documentation'
        ]
      }
    };

    const context = contexts[country] || {
      business_culture: {
        communication_style: 'direct',
        hierarchy_importance: 'medium',
        meeting_punctuality: 'flexible',
        negotiation_style: 'Standard professional approach'
      },
      etiquette_tips: ['Research local customs', 'Be respectful and professional']
    };

    return {
      country,
      business_culture: context.business_culture!,
      etiquette_tips: context.etiquette_tips || [],
      holidays_to_note: [],
      language_considerations: []
    };
  }, []);

  // Feature 40: Analyze Relocation
  const analyzeRelocation = useCallback((
    destination: string,
    currentLocation: string,
    priorities: { factor: string; importance: number }[]
  ): RelocationAnalysis => {
    // Simplified relocation analysis
    const factors = priorities.map(p => ({
      factor: p.factor,
      current_score: 70 + Math.random() * 20,
      destination_score: 60 + Math.random() * 30,
      importance_weight: p.importance
    }));

    const weightedCurrent = factors.reduce((sum, f) => sum + f.current_score * f.importance_weight, 0) / 
      factors.reduce((sum, f) => sum + f.importance_weight, 0);
    const weightedDestination = factors.reduce((sum, f) => sum + f.destination_score * f.importance_weight, 0) / 
      factors.reduce((sum, f) => sum + f.importance_weight, 0);

    const diff = weightedDestination - weightedCurrent;

    return {
      destination,
      factors,
      overall_recommendation: diff > 15 ? 'strongly_recommend' 
        : diff > 5 ? 'recommend' 
        : diff > -5 ? 'neutral' 
        : 'not_recommend',
      key_considerations: [
        'Cost of living adjustment',
        'Professional network impact',
        'Career growth opportunities'
      ],
      estimated_adjustment_period: '3-6 months'
    };
  }, []);

  return {
    visaStatuses,
    internationalNetwork,
    culturalContexts,
    checkVisaStatus,
    calculateTimezoneOverlaps,
    getCulturalContext,
    analyzeRelocation,
    setVisaStatuses,
    setInternationalNetwork
  };
}
