import { Report } from "./types";

// Default location (e.g., San Francisco for demo purposes)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

// Mock data to populate the dashboard/map initially
export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    timestamp: Date.now() - 10000000,
    image: 'https://picsum.photos/400/300?grayscale', // Placeholder
    location: { lat: 37.7750, lng: -122.4180 },
    status: 'in-progress',
    priorityScore: 85,
    daysOverdue: 3,
    aiPredictedResolutionTime: '2-3 days',
    communityImpact: 450,
    analysis: {
      type: 'Pothole',
      severity: 4,
      urgency: 'High',
      description: 'Deep pothole approx 2ft wide in center lane.',
      recommended_fix: 'Asphalt patch and seal',
      estimated_cost: '$200-$400',
      hazard_risk: 'Vehicle suspension damage, accident risk'
    }
  },
  {
    id: '2',
    timestamp: Date.now() - 5000000,
    image: 'https://picsum.photos/400/301?grayscale',
    location: { lat: 37.7730, lng: -122.4200 },
    status: 'pending',
    priorityScore: 72,
    daysOverdue: 1,
    aiPredictedResolutionTime: '1-2 days',
    communityImpact: 230,
    analysis: {
      type: 'Broken Streetlight',
      severity: 3,
      urgency: 'Medium',
      description: 'Lamp head detached and hanging by wire.',
      recommended_fix: 'Replace fixture and secure wiring',
      estimated_cost: '$150-$300',
      hazard_risk: 'Falling debris, poor visibility'
    }
  },
  {
    id: '3',
    timestamp: Date.now() - 2000000,
    image: 'https://picsum.photos/400/302?grayscale',
    location: { lat: 37.7760, lng: -122.4220 },
    status: 'resolved',
    priorityScore: 45,
    daysOverdue: 0,
    aiPredictedResolutionTime: '3-5 days',
    communityImpact: 120,
    analysis: {
      type: 'Cracked Sidewalk',
      severity: 2,
      urgency: 'Low',
      description: 'Uneven pavement lifted by tree roots.',
      recommended_fix: 'Concrete grinding or slab replacement',
      estimated_cost: '$100-$250',
      hazard_risk: 'Trip hazard for pedestrians'
    }
  }
];