/**
 * Deployment Manager — blue-green deployment hooks, version tracking,
 * migration validation, and rollback triggers.
 */

export interface DeploymentVersion {
  version: string;
  deployedAt: string;
  status: "active" | "rolling_back" | "rolled_back" | "pending";
  environment: "test" | "live";
  changelog: string[];
  migrationsApplied: string[];
}

const deploymentHistory: DeploymentVersion[] = [];
let currentVersion: DeploymentVersion | null = null;

export function registerDeployment(params: {
  version: string;
  environment: "test" | "live";
  changelog: string[];
  migrationsApplied?: string[];
}): DeploymentVersion {
  const deployment: DeploymentVersion = {
    version: params.version,
    deployedAt: new Date().toISOString(),
    status: "active",
    environment: params.environment,
    changelog: params.changelog,
    migrationsApplied: params.migrationsApplied ?? [],
  };

  // Deactivate previous
  if (currentVersion) {
    currentVersion.status = "rolled_back";
  }

  deploymentHistory.push(deployment);
  currentVersion = deployment;
  return deployment;
}

export function getCurrentVersion(): DeploymentVersion | null {
  return currentVersion;
}

export function getDeploymentHistory(): DeploymentVersion[] {
  return [...deploymentHistory];
}

export function rollback(): DeploymentVersion | null {
  if (deploymentHistory.length < 2) return null;

  const current = deploymentHistory[deploymentHistory.length - 1];
  current.status = "rolled_back";

  const previous = deploymentHistory[deploymentHistory.length - 2];
  previous.status = "active";
  currentVersion = previous;

  return previous;
}

export function validateMigrations(required: string[]): { valid: boolean; missing: string[] } {
  const applied = currentVersion?.migrationsApplied ?? [];
  const missing = required.filter(m => !applied.includes(m));
  return { valid: missing.length === 0, missing };
}

// ─── Blue-Green Deployment Hooks ───
export interface BlueGreenState {
  activeSlot: "blue" | "green";
  blueVersion?: string;
  greenVersion?: string;
  switchedAt?: string;
}

let blueGreenState: BlueGreenState = { activeSlot: "blue" };

export function getBlueGreenState(): BlueGreenState {
  return { ...blueGreenState };
}

export function deployToInactiveSlot(version: string): BlueGreenState {
  const inactiveSlot = blueGreenState.activeSlot === "blue" ? "green" : "blue";
  if (inactiveSlot === "blue") {
    blueGreenState.blueVersion = version;
  } else {
    blueGreenState.greenVersion = version;
  }
  return { ...blueGreenState };
}

export function switchSlots(): BlueGreenState {
  blueGreenState.activeSlot = blueGreenState.activeSlot === "blue" ? "green" : "blue";
  blueGreenState.switchedAt = new Date().toISOString();
  return { ...blueGreenState };
}
