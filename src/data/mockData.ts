import type { County, WarningAlert, Indicator, FieldSubmission } from '../types';

export const counties: County[] = [
  { id: 'nairobi', name: 'Nairobi', region: 'Low Risk', lat: -1.286, lon: 36.817, risk: 'low', rainfall7d: 18, tempAvg: 19.5, humidity: 58, standingWater: 2, suspected: 210, tested: 950, positive: 8, activeAlerts: 0, pendingVerification: 3, lastUpdated: '31 Aug 2026' },
  { id: 'mombasa', name: 'Mombasa', region: 'Coastal Endemic', lat: -4.043, lon: 39.658, risk: 'low', rainfall7d: 30, tempAvg: 27.4, humidity: 74, standingWater: 5, suspected: 180, tested: 640, positive: 32, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'kisumu', name: 'Kisumu', region: 'Lake Endemic', lat: -0.091, lon: 34.768, risk: 'alert', rainfall7d: 98, tempAvg: 24.8, humidity: 71, standingWater: 22, suspected: 640, tested: 1480, positive: 429, activeAlerts: 1, pendingVerification: 6, lastUpdated: '31 Aug 2026' },
  { id: 'homabay', name: 'Homa Bay', region: 'Lake Endemic', lat: -0.529, lon: 34.457, risk: 'critical', rainfall7d: 132, tempAvg: 25.1, humidity: 76, standingWater: 31, suspected: 820, tested: 1610, positive: 612, activeAlerts: 1, pendingVerification: 9, lastUpdated: '31 Aug 2026' },
  { id: 'siaya', name: 'Siaya', region: 'Lake Endemic', lat: 0.061, lon: 34.288, risk: 'alert', rainfall7d: 110, tempAvg: 24.6, humidity: 74, standingWater: 27, suspected: 590, tested: 1310, positive: 432, activeAlerts: 1, pendingVerification: 4, lastUpdated: '31 Aug 2026' },
  { id: 'busia', name: 'Busia', region: 'Lake Endemic', lat: 0.463, lon: 34.242, risk: 'alert', rainfall7d: 121, tempAvg: 24.9, humidity: 77, standingWater: 29, suspected: 610, tested: 1390, positive: 431, activeAlerts: 1, pendingVerification: 7, lastUpdated: '31 Aug 2026' },
  { id: 'migori', name: 'Migori', region: 'Lake Endemic', lat: -1.063, lon: 34.473, risk: 'watch', rainfall7d: 76, tempAvg: 24.0, humidity: 69, standingWater: 15, suspected: 470, tested: 1120, positive: 246, activeAlerts: 1, pendingVerification: 2, lastUpdated: '31 Aug 2026' },
  { id: 'kisii', name: 'Kisii', region: 'Highland Fringe Endemic', lat: -0.678, lon: 34.775, risk: 'watch', rainfall7d: 64, tempAvg: 21.3, humidity: 68, standingWater: 9, suspected: 320, tested: 900, positive: 162, activeAlerts: 0, pendingVerification: 2, lastUpdated: '31 Aug 2026' },
  { id: 'vihiga', name: 'Vihiga', region: 'Lake Endemic', lat: 0.049, lon: 34.722, risk: 'watch', rainfall7d: 70, tempAvg: 22.5, humidity: 70, standingWater: 11, suspected: 260, tested: 720, positive: 137, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'kakamega', name: 'Kakamega', region: 'Lake Endemic', lat: 0.284, lon: 34.752, risk: 'alert', rainfall7d: 89, tempAvg: 23.4, humidity: 72, standingWater: 18, suspected: 540, tested: 1250, positive: 325, activeAlerts: 0, pendingVerification: 3, lastUpdated: '31 Aug 2026' },
  { id: 'bungoma', name: 'Bungoma', region: 'Lake Endemic', lat: 0.569, lon: 34.559, risk: 'watch', rainfall7d: 58, tempAvg: 22.7, humidity: 66, standingWater: 8, suspected: 300, tested: 880, positive: 150, activeAlerts: 0, pendingVerification: 2, lastUpdated: '31 Aug 2026' },
  { id: 'kilifi', name: 'Kilifi', region: 'Coastal Endemic', lat: -3.630, lon: 39.849, risk: 'alert', rainfall7d: 84, tempAvg: 27.0, humidity: 78, standingWater: 19, suspected: 470, tested: 1080, positive: 259, activeAlerts: 1, pendingVerification: 5, lastUpdated: '31 Aug 2026' },
  { id: 'kwale', name: 'Kwale', region: 'Coastal Endemic', lat: -4.174, lon: 39.452, risk: 'watch', rainfall7d: 55, tempAvg: 26.8, humidity: 76, standingWater: 10, suspected: 260, tested: 680, positive: 109, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'tanariver', name: 'Tana River', region: 'Coastal Endemic', lat: -1.5, lon: 40.03, risk: 'watch', rainfall7d: 48, tempAvg: 28.2, humidity: 65, standingWater: 7, suspected: 150, tested: 420, positive: 59, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'lamu', name: 'Lamu', region: 'Coastal Endemic', lat: -2.272, lon: 40.902, risk: 'low', rainfall7d: 22, tempAvg: 27.9, humidity: 71, standingWater: 3, suspected: 70, tested: 220, positive: 13, activeAlerts: 0, pendingVerification: 0, lastUpdated: '31 Aug 2026' },
  { id: 'kericho', name: 'Kericho', region: 'Highland Epidemic-Prone', lat: -0.367, lon: 35.283, risk: 'watch', rainfall7d: 66, tempAvg: 18.9, humidity: 72, standingWater: 6, suspected: 180, tested: 560, positive: 67, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'nakuru', name: 'Nakuru', region: 'Highland / Low Risk', lat: -0.303, lon: 36.08, risk: 'low', rainfall7d: 33, tempAvg: 19.6, humidity: 60, standingWater: 3, suspected: 140, tested: 600, positive: 24, activeAlerts: 0, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'turkana', name: 'Turkana', region: 'Semi-Arid Seasonal', lat: 3.118, lon: 35.596, risk: 'watch', rainfall7d: 58, tempAvg: 30.5, humidity: 40, standingWater: 9, suspected: 95, tested: 260, positive: 23, activeAlerts: 1, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'marsabit', name: 'Marsabit', region: 'Semi-Arid Seasonal', lat: 2.335, lon: 37.99, risk: 'low', rainfall7d: 12, tempAvg: 26.8, humidity: 35, standingWater: 1, suspected: 40, tested: 130, positive: 3, activeAlerts: 0, pendingVerification: 0, lastUpdated: '31 Aug 2026' },
  { id: 'wajir', name: 'Wajir', region: 'Semi-Arid Seasonal', lat: 1.75, lon: 40.06, risk: 'low', rainfall7d: 9, tempAvg: 31.2, humidity: 30, standingWater: 0, suspected: 30, tested: 90, positive: 1, activeAlerts: 0, pendingVerification: 0, lastUpdated: '31 Aug 2026' },
  { id: 'garissa', name: 'Garissa', region: 'Semi-Arid Seasonal', lat: -0.456, lon: 39.646, risk: 'watch', rainfall7d: 41, tempAvg: 30.8, humidity: 42, standingWater: 4, suspected: 60, tested: 210, positive: 17, activeAlerts: 0, pendingVerification: 0, lastUpdated: '31 Aug 2026' },
  { id: 'baringo', name: 'Baringo', region: 'Semi-Arid Seasonal', lat: 0.491, lon: 35.743, risk: 'watch', rainfall7d: 52, tempAvg: 24.1, humidity: 55, standingWater: 6, suspected: 130, tested: 400, positive: 46, activeAlerts: 1, pendingVerification: 1, lastUpdated: '31 Aug 2026' },
  { id: 'kiambu', name: 'Kiambu', region: 'Low Risk', lat: -1.171, lon: 36.835, risk: 'low', rainfall7d: 20, tempAvg: 19.9, humidity: 58, standingWater: 2, suspected: 160, tested: 720, positive: 12, activeAlerts: 0, pendingVerification: 2, lastUpdated: '31 Aug 2026' },
  { id: 'kajiado', name: 'Kajiado', region: 'Low Risk', lat: -1.852, lon: 36.777, risk: 'low', rainfall7d: 15, tempAvg: 22.4, humidity: 46, standingWater: 1, suspected: 90, tested: 380, positive: 6, activeAlerts: 0, pendingVerification: 0, lastUpdated: '31 Aug 2026' },
];

export const alerts: WarningAlert[] = [
  { id: 'AL-1042', countyId: 'homabay', ward: 'Rangwe', level: 'critical', createdAt: '31 Aug 2026, 07:40', status: 'investigating', confidence: 'High', indicators: ['Rainfall increased 68% above the 4-week average.', 'Environmental teams logged 14 new standing-water observations in the past 5 days.', 'Temperature is within the configured vector-suitability range (22–28°C).'], expectedPeriod: 'Next 2–4 weeks', recommendedActions: ['Increase active surveillance in Rangwe and neighbouring wards.', 'Review recent malaria trends against the seasonal baseline.', 'Dispatch a field team to verify standing-water observations.', 'Coordinate with the sub-county health office on response.'], assignedTeam: 'Homa Bay Sub-County Rapid Response', dataSources: ['Weather observations', 'Environmental observations', 'Surveillance records'] },
  { id: 'AL-1041', countyId: 'kisumu', ward: 'Nyando', level: 'alert', createdAt: '30 Aug 2026, 18:05', status: 'acknowledged', confidence: 'Moderate', indicators: ['Positivity rate rose from 24% to 29% over two reporting periods.', 'Community health workers reported increased fever cases.'], expectedPeriod: 'Next 2 weeks', recommendedActions: ['Verify surveillance data with reporting facilities.', 'Increase bed-net distribution monitoring.', 'Notify the county malaria focal person.'], assignedTeam: 'Kisumu County Surveillance Unit', dataSources: ['Surveillance records', 'Community observations'] },
  { id: 'AL-1039', countyId: 'busia', ward: 'Matayos', level: 'alert', createdAt: '29 Aug 2026, 09:12', status: 'created', confidence: 'Moderate', indicators: ['Heavy rainfall recorded for 4 consecutive days.', 'Blocked drainage reported near 3 villages.'], expectedPeriod: 'Next 3 weeks', recommendedActions: ['Conduct targeted field verification of drainage sites.', 'Engage county public works on drainage clearing.'], assignedTeam: 'Busia Vector Control Team', dataSources: ['Weather observations', 'Community environmental observations'] },
  { id: 'AL-1037', countyId: 'siaya', ward: 'Ugunja', level: 'watch', createdAt: '28 Aug 2026, 14:30', status: 'acknowledged', confidence: 'Low', indicators: ['Rainfall trending upward but still within seasonal norms.', 'One suspected breeding site pending verification.'], expectedPeriod: 'Next 4 weeks', recommendedActions: ['Continue routine monitoring.', 'Schedule a verification visit within 5 working days.'], assignedTeam: 'Siaya Field Supervisors', dataSources: ['Weather observations'] },
  { id: 'AL-1035', countyId: 'kilifi', ward: 'Ganze', level: 'alert', createdAt: '27 Aug 2026, 11:00', status: 'investigating', confidence: 'High', indicators: ['Standing water observations up 40% month-on-month.', 'Positivity rate above the county alert threshold (24%).'], expectedPeriod: 'Next 2–3 weeks', recommendedActions: ['Deploy a vector surveillance team.', 'Cross-check with the nearest reporting health facility.'], assignedTeam: 'Coast Regional Response Team', dataSources: ['Environmental observations', 'Surveillance records', 'Vector surveillance'] },
  { id: 'AL-1030', countyId: 'turkana', ward: 'Loima', level: 'watch', createdAt: '25 Aug 2026, 16:45', status: 'created', confidence: 'Low', indicators: ['Unseasonal rainfall recorded after a prolonged dry spell.', 'Historically low-transmission area; monitoring is precautionary.'], expectedPeriod: 'Next 4–6 weeks', recommendedActions: ['Monitor for early indicators of transmission.', 'Alert the county health office to the unusual rainfall pattern.'], assignedTeam: 'Turkana County Health Team', dataSources: ['Weather observations'] },
  { id: 'AL-1027', countyId: 'baringo', ward: 'Marigat', level: 'watch', createdAt: '24 Aug 2026, 08:20', status: 'resolved', confidence: 'Moderate', indicators: ['Flooding reported along the Perkerra river.', 'No corresponding rise in suspected cases observed.'], expectedPeriod: 'Resolved — no significant risk change observed', recommendedActions: ['No further action required at this time.', 'Continue routine seasonal monitoring.'], assignedTeam: 'Baringo Field Supervisors', dataSources: ['Weather observations', 'Surveillance records'] },
  { id: 'AL-1024', countyId: 'migori', ward: 'Suna East', level: 'alert', createdAt: '23 Aug 2026, 13:55', status: 'acknowledged', confidence: 'Moderate', indicators: ['Bed-net usage survey shows a decline in nightly use.', 'Positivity rate steady but above the regional average.'], expectedPeriod: 'Next 3 weeks', recommendedActions: ['Coordinate community bed-net sensitization.', 'Review distribution and net-condition data.'], assignedTeam: 'Migori Community Health Unit', dataSources: ['Baseline survey data', 'Surveillance records'] },
];

export const indicators: Indicator[] = [
  { code: 'IND-01', name: 'Correct knowledge of malaria transmission and prevention', baseline: 52, endline: 78, target: 80, unit: '%', goodDirection: 'up' },
  { code: 'IND-02', name: 'Household bed-net ownership (at least one net)', baseline: 61, endline: 79, target: 85, unit: '%', goodDirection: 'up' },
  { code: 'IND-03', name: 'Children under 5 who slept under a net last night', baseline: 58, endline: 74, target: 80, unit: '%', goodDirection: 'up' },
  { code: 'IND-04', name: 'Awareness of malaria early-warning alerts', baseline: 21, endline: 47, target: 60, unit: '%', goodDirection: 'up' },
  { code: 'IND-05', name: 'Sought care within 24 hours of fever onset', baseline: 44, endline: 63, target: 75, unit: '%', goodDirection: 'up' },
  { code: 'IND-06', name: 'Households reporting standing water near the compound', baseline: 37, endline: 24, target: 15, unit: '%', goodDirection: 'down' },
  { code: 'IND-07', name: 'Awareness of common mosquito-breeding environments', baseline: 49, endline: 71, target: 75, unit: '%', goodDirection: 'up' },
];

export const fieldSubmissions: FieldSubmission[] = [
  { id: 'SUB-3301', type: 'Weather Observation', enumerator: 'J. Otieno', county: 'Homa Bay', ward: 'Rangwe', status: 'pending', timestamp: '31 Aug 2026, 16:20' },
  { id: 'SUB-3298', type: 'Environmental Observation', enumerator: 'F. Wekesa', county: 'Busia', ward: 'Matayos', status: 'under_review', timestamp: '31 Aug 2026, 14:05' },
  { id: 'SUB-3295', type: 'Baseline Survey', enumerator: 'M. Chebet', county: 'Kericho', ward: 'Ainamoi', status: 'verified', timestamp: '31 Aug 2026, 11:48' },
  { id: 'SUB-3291', type: 'Vector Surveillance', enumerator: 'D. Mwangi', county: 'Kilifi', ward: 'Ganze', status: 'pending', timestamp: '30 Aug 2026, 17:33' },
  { id: 'SUB-3288', type: 'Endline Survey', enumerator: 'S. Achieng', county: 'Kisumu', ward: 'Nyando', status: 'rejected', timestamp: '30 Aug 2026, 10:12' },
  { id: 'SUB-3284', type: 'Weather Observation', enumerator: 'P. Kiprono', county: 'Baringo', ward: 'Marigat', status: 'verified', timestamp: '29 Aug 2026, 09:55' },
  { id: 'SUB-3280', type: 'Environmental Observation', enumerator: 'L. Nyaboke', county: 'Migori', ward: 'Suna East', status: 'pending', timestamp: '28 Aug 2026, 15:40' },
  { id: 'SUB-3276', type: 'Baseline Survey', enumerator: 'R. Kamau', county: 'Turkana', ward: 'Loima', status: 'under_review', timestamp: '27 Aug 2026, 12:15' },
];

export const weeklyLabels = ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6', 'Wk7', 'Wk8', 'Wk9', 'Wk10', 'Wk11', 'Wk12'];

export const surveillanceTrend = {
  suspected: [1180, 1220, 1265, 1300, 1350, 1410, 1470, 1520, 1600, 1660, 1725, 1790],
  positive: [340, 360, 375, 395, 420, 455, 490, 520, 560, 600, 640, 680],
};

export const dailyLabels = ['Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31', 'Sep 1'];

export const weatherTrend = {
  rainfall: [4, 6, 5, 9, 12, 15, 18, 22, 26, 24, 20, 17, 14, 11],
  temperature: [23, 23, 24, 24, 23, 22, 22, 21, 21, 22, 22, 23, 23, 24],
};
