// Color utility functions for Resource Planner

/**
 * Generate consistent color for each client based on client ID
 */
export function getClientColor(clientId) {
  if (!clientId) return '#f97316'; // Default orange for unknown clients
  
  // Predefined color palette for clients (vibrant, distinguishable colors)
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#a855f7', // Violet
    '#f43f5e', // Rose
    '#0ea5e9', // Sky
    '#22c55e', // Emerald
    '#eab308', // Yellow
    '#6366f1', // Indigo
  ];
  
  return colors[clientId % colors.length];
}

/**
 * Get allocation shading opacity (for progressive shading effect)
 * Maps 0-100% to 0.3-1.0 opacity
 */
export function getAllocationOpacity(percentage) {
  const minOpacity = 0.3;
  const maxOpacity = 1.0;
  const normalized = Math.min(percentage / 100, 1);
  return minOpacity + (normalized * (maxOpacity - minOpacity));
}

/**
 * Get heat map class based on allocation percentage
 * Spec: 0-30% = Low (green), 31-70% = Medium (yellow), 71-100%+ = High (red)
 */
export function getHeatMapClass(allocation) {
  if (allocation > 70) return 'heat-high';   // Red (71-100%+)
  if (allocation > 30) return 'heat-medium'; // Yellow (31-70%)
  return 'heat-low';                         // Green (0-30%)
}

/**
 * Get allocation badge class
 * Spec: 0-70% = OK, 71-100% = Warning, 100%+ = Over
 */
export function getAllocationBadgeClass(allocation) {
  if (allocation > 100) return 'allocation-over';     // Over-allocated (>100%)
  if (allocation > 70) return 'allocation-warning';   // High (71-100%)
  return 'allocation-ok';                             // OK (0-70%)
}
