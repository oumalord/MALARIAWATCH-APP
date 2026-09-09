export type RiskLevel = 'low' | 'watch' | 'alert' | 'critical';
export type AlertStatus = 'created' | 'acknowledged' | 'investigating' | 'resolved';
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface County {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  risk: RiskLevel;
  rainfall7d: number;
  tempAvg: number;
  humidity: number;
  standingWater: number;
  suspected: number;
  tested: number;
  positive: number;
  activeAlerts: number;
  pendingVerification: number;
  lastUpdated: string;
}

export interface WarningAlert {
  id: string;
  countyId: string;
  ward: string;
  level: RiskLevel;
  createdAt: string;
  status: AlertStatus;
  confidence: 'Low' | 'Moderate' | 'High';
  indicators: string[];
  expectedPeriod: string;
  recommendedActions: string[];
  assignedTeam: string;
  dataSources: string[];
}

export interface Indicator {
  code: string;
  name: string;
  baseline: number;
  endline: number;
  target: number;
  unit: string;
  goodDirection: 'up' | 'down';
}

export interface FieldSubmission {
  id: string;
  type: string;
  enumerator: string;
  county: string;
  ward: string;
  status: VerificationStatus;
  timestamp: string;
}
