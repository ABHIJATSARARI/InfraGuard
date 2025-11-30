
export interface AnalysisResult {
  type: string;
  severity: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  recommended_fix: string;
  estimated_cost: string;
  hazard_risk: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  timestamp: number;
  image: string; // Base64
  location: Location;
  analysis: AnalysisResult;
  status: 'pending' | 'reviewed' | 'in-progress' | 'resolved';
  assignedTo?: string;
  priorityScore?: number; // AI-calculated priority (0-100)
  daysOverdue?: number; // SLA tracking
  aiPredictedResolutionTime?: string; // AI prediction
  communityImpact?: number; // Affected people estimate
}

export type Tab = 'report' | 'map' | 'dashboard';
