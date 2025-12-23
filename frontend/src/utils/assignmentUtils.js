// Assignment utility functions for Resource Planner
import { parseDateString, formatDateForInput } from './dates';

/**
 * Split an assignment spanning multiple months into one entry per month
 * CRITICAL: This ensures proper filtering and display in monthly timeline view
 * 
 * Example: Jan 15 - Mar 20 becomes:
 *   1. Jan 15 - Jan 31
 *   2. Feb 1 - Feb 28
 *   3. Mar 1 - Mar 20
 */
export function splitAssignmentByMonth(assignmentData) {
  const start = parseDateString(assignmentData.startDate);
  const end = parseDateString(assignmentData.endDate);
  
  const entries = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= endMonth) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    // Clamp assignment dates to month boundaries
    let entryStart, entryEnd;
    
    if (start >= monthStart && start <= monthEnd) {
      // Assignment starts this month
      entryStart = formatDateForInput(start);
    } else {
      // Assignment started before this month
      entryStart = formatDateForInput(monthStart);
    }
    
    if (end >= monthStart && end <= monthEnd) {
      // Assignment ends this month
      entryEnd = formatDateForInput(end);
    } else {
      // Assignment continues past this month
      entryEnd = formatDateForInput(monthEnd);
    }
    
    entries.push({
      ...assignmentData,
      startDate: entryStart,
      endDate: entryEnd
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return entries;
}

/**
 * Calculate partial month positioning for visual display
 * Returns marginLeft and width percentages
 * 
 * @param {string} assignmentStart - YYYY-MM-DD format
 * @param {string} assignmentEnd - YYYY-MM-DD format
 * @param {Date} monthStart - First day of month
 * @param {Date} monthEnd - Last day of month
 * @returns {object} { marginLeft: number, width: number }
 */
export function calculatePartialMonthPosition(assignmentStart, assignmentEnd, monthStart, monthEnd) {
  const assignStart = parseDateString(assignmentStart);
  const assignEnd = parseDateString(assignmentEnd);
  
  const daysInMonth = monthEnd.getDate();
  
  // Clamp to month boundaries
  const effectiveStart = assignStart < monthStart ? monthStart : assignStart;
  const effectiveEnd = assignEnd > monthEnd ? monthEnd : assignEnd;
  
  const startDay = effectiveStart.getDate();
  const endDay = effectiveEnd.getDate();
  const daysCovered = endDay - startDay + 1;
  
  // Calculate positioning as percentages
  let startOffset = ((startDay - 1) / daysInMonth) * 100;
  let widthPercent = (daysCovered / daysInMonth) * 100;
  
  // Minimum 15% width for visibility
  const minWidth = 15;
  if (widthPercent < minWidth) {
    widthPercent = minWidth;
    // Adjust offset if minimum width pushes past 100%
    if (startOffset + widthPercent > 100) {
      startOffset = 100 - widthPercent;
    }
  }
  
  return {
    marginLeft: startOffset,
    width: widthPercent
  };
}

/**
 * Get all assignments for a specific person in a specific month
 * Uses proper date comparison with parseDateString
 */
export function getAssignmentsForPersonInMonth(assignments, personId, monthStart, monthEnd) {
  return assignments.filter(assignment => {
    if (assignment.personId !== personId) return false;
    
    // CRITICAL: Use parseDateString to avoid timezone issues
    const assignStart = parseDateString(assignment.startDate);
    const assignEnd = parseDateString(assignment.endDate);
    
    // Check for overlap: assignment overlaps if it starts before month ends
    // AND ends after month starts
    return assignStart <= monthEnd && assignEnd >= monthStart;
  });
}

/**
 * Calculate total allocation percentage for a person in a month
 */
export function calculateTotalAllocation(assignments, personId, monthStart, monthEnd) {
  const relevantAssignments = getAssignmentsForPersonInMonth(
    assignments, 
    personId, 
    monthStart, 
    monthEnd
  );
  
  return relevantAssignments.reduce((sum, assignment) => {
    return sum + assignment.percentage;
  }, 0);
}

/**
 * Check if a person is over-allocated in a specific month
 */
export function isOverAllocated(assignments, personId, monthStart, monthEnd) {
  return calculateTotalAllocation(assignments, personId, monthStart, monthEnd) > 100;
}

/**
 * Get allocation level category
 */
export function getAllocationLevel(percentage) {
  if (percentage > 100) return 'over';
  if (percentage > 70) return 'high';
  if (percentage > 30) return 'medium';
  return 'low';
}
