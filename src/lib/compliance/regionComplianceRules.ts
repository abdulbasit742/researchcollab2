/**
 * Region-Based Compliance Rules — configurable per-region regulatory requirements.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("regionCompliance");

export interface RegionComplianceConfig {
  kycMandatory: boolean;
  maxWithdrawalWithoutKYC: number;
  maxPoolContributionWithoutKYC: number;
  reportingThreshold: number;
  capitalPoolLimit: number;
  crossBorderDealsAllowed: boolean;
}

const REGION_RULES: Record<string, RegionComplianceConfig> = {
  "ap-south": {
    kycMandatory: true,
    maxWithdrawalWithoutKYC: 0,
    maxPoolContributionWithoutKYC: 0,
    reportingThreshold: 50000,
    capitalPoolLimit: 10000000,
    crossBorderDealsAllowed: false,
  },
  "us-east": {
    kycMandatory: true,
    maxWithdrawalWithoutKYC: 0,
    maxPoolContributionWithoutKYC: 0,
    reportingThreshold: 10000,
    capitalPoolLimit: 50000000,
    crossBorderDealsAllowed: true,
  },
  "eu-west": {
    kycMandatory: true,
    maxWithdrawalWithoutKYC: 0,
    maxPoolContributionWithoutKYC: 0,
    reportingThreshold: 15000,
    capitalPoolLimit: 25000000,
    crossBorderDealsAllowed: true,
  },
  default: {
    kycMandatory: false,
    maxWithdrawalWithoutKYC: 5000,
    maxPoolContributionWithoutKYC: 10000,
    reportingThreshold: 25000,
    capitalPoolLimit: 5000000,
    crossBorderDealsAllowed: false,
  },
};

export function getRegionComplianceRules(regionCode: string): RegionComplianceConfig {
  const rules = REGION_RULES[regionCode] ?? REGION_RULES["default"];
  log.info("Region compliance rules loaded", { regionCode });
  return rules;
}

export function isKYCRequired(regionCode: string): boolean {
  return getRegionComplianceRules(regionCode).kycMandatory;
}

export function getWithdrawalLimit(regionCode: string): number {
  return getRegionComplianceRules(regionCode).maxWithdrawalWithoutKYC;
}

export function getReportingThreshold(regionCode: string): number {
  return getRegionComplianceRules(regionCode).reportingThreshold;
}
