// Date utility functions for Resource Planner

export const START_DATE = new Date(2026, 0, 1); // January 1, 2026

/**
 * Parse YYYY-MM-DD string as local date (not UTC)
 */
export function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date as YYYY-MM-DD for input fields
 */
export function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string (YYYY-MM-DD) to mm/dd/yy for tooltips
 */
export function formatDateForTooltip(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const shortYear = year.slice(-2);
  return `${month}/${day}/${shortYear}`;
}

/**
 * Format date as "Jan 1"
 */
export function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format date range as "Jan 1 - Jan 14"
 * Accepts both Date objects and YYYY-MM-DD strings
 */
export function formatDateRange(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseDateString(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDateString(endDate) : endDate;
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Get date range for a period (monthly view)
 * periodOffset 0 = Jan 2026, 1 = Feb 2026, etc.
 */
export function getPeriodDates(periodOffset) {
  const monthOffset = periodOffset;
  const year = 2026 + Math.floor(monthOffset / 12);
  const month = ((monthOffset % 12) + 12) % 12; // Handle negative offsets
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const label = `${monthNames[month]} ${year}`;
  
  return { startDate, endDate, label };
}

/**
 * Check if a date range overlaps with a period
 */
export function dateRangeOverlapsPeriod(startDate, endDate, period) {
  const { startDate: periodStart, endDate: periodEnd } = getPeriodDates(period);
  const assignStart = parseDateString(startDate);
  const assignEnd = parseDateString(endDate);
  
  return assignStart <= periodEnd && assignEnd >= periodStart;
}

/**
 * Get which periods a date range spans
 */
export function getPeriodsForDateRange(startDate, endDate) {
  const periods = new Set();
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  
  let currentPeriod = Math.floor((start - START_DATE) / (14 * 24 * 60 * 60 * 1000));
  const endPeriod = Math.floor((end - START_DATE) / (14 * 24 * 60 * 60 * 1000));
  
  for (let p = currentPeriod; p <= endPeriod; p++) {
    periods.add(p);
  }
  
  return Array.from(periods);
}

/**
 * Calculate duration in days between two dates
 * Accepts both Date objects and YYYY-MM-DD strings
 */
export function calculateDurationDays(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseDateString(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDateString(endDate) : endDate;
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
  return diffDays;
}
