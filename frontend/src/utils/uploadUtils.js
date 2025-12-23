/**
 * Upload Utilities
 * Handles CSV parsing, validation, and data transformation
 */

import { parseDateString } from './dates';

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @param {string} type - Data type (people, clients, projects, assignments)
 * @returns {Array} Parsed data array
 */
export function parseCSV(csvText, type) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 * @param {string} line - CSV line
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

/**
 * Validate and transform people data
 * @param {Array} data - Raw parsed data
 * @returns {Array} Validated people data
 */
export function validatePeopleData(data) {
  const validated = [];
  const errors = [];

  data.forEach((row, index) => {
    const lineNum = index + 2; // +2 for header and 0-index
    
    // Required fields
    if (!row.name || !row.role) {
      errors.push(`Line ${lineNum}: Missing name or role`);
      return;
    }

    validated.push({
      name: row.name.trim(),
      role: row.role.trim(),
    });
  });

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.join('\n'));
  }

  return validated;
}

/**
 * Validate and transform clients data
 * @param {Array} data - Raw parsed data
 * @returns {Array} Validated clients data
 */
export function validateClientsData(data) {
  const validated = [];
  const errors = [];

  data.forEach((row, index) => {
    const lineNum = index + 2;
    
    // Required fields
    if (!row.name) {
      errors.push(`Line ${lineNum}: Missing client name`);
      return;
    }

    validated.push({
      name: row.name.trim(),
    });
  });

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.join('\n'));
  }

  return validated;
}

/**
 * Validate and transform projects data
 * @param {Array} data - Raw parsed data
 * @param {Array} clients - Existing clients for validation
 * @returns {Array} Validated projects data
 */
export function validateProjectsData(data, clients) {
  const validated = [];
  const errors = [];
  const clientMap = new Map(clients.map(c => [c.name.toLowerCase(), c.id]));

  data.forEach((row, index) => {
    const lineNum = index + 2;
    
    // Required fields
    if (!row.name || !row.client) {
      errors.push(`Line ${lineNum}: Missing project name or client`);
      return;
    }

    // Find client ID
    const clientName = row.client.trim().toLowerCase();
    const clientId = clientMap.get(clientName);
    
    if (!clientId) {
      errors.push(`Line ${lineNum}: Client "${row.client}" not found`);
      return;
    }

    validated.push({
      name: row.name.trim(),
      client_id: clientId,
    });
  });

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.join('\n'));
  }

  return validated;
}

/**
 * Validate and transform assignments data
 * @param {Array} data - Raw parsed data
 * @param {Array} people - Existing people for validation
 * @param {Array} projects - Existing projects for validation
 * @returns {Array} Validated assignments data
 */
export function validateAssignmentsData(data, people, projects) {
  const validated = [];
  const errors = [];
  
  const peopleMap = new Map(people.map(p => [p.name.toLowerCase(), p.id]));
  const projectsMap = new Map(projects.map(p => [p.name.toLowerCase(), p.id]));

  data.forEach((row, index) => {
    const lineNum = index + 2;
    
    // Required fields
    if (!row.person || !row.project || !row.start_date || !row.end_date) {
      errors.push(`Line ${lineNum}: Missing required fields (person, project, start_date, end_date)`);
      return;
    }

    // Find person ID
    const personName = row.person.trim().toLowerCase();
    const personId = peopleMap.get(personName);
    if (!personId) {
      errors.push(`Line ${lineNum}: Person "${row.person}" not found`);
      return;
    }

    // Find project ID
    const projectName = row.project.trim().toLowerCase();
    const projectId = projectsMap.get(projectName);
    if (!projectId) {
      errors.push(`Line ${lineNum}: Project "${row.project}" not found`);
      return;
    }

    // Validate dates
    let startDate, endDate;
    try {
      startDate = parseDateString(row.start_date.trim());
      endDate = parseDateString(row.end_date.trim());
    } catch (error) {
      errors.push(`Line ${lineNum}: Invalid date format (use YYYY-MM-DD)`);
      return;
    }

    if (endDate < startDate) {
      errors.push(`Line ${lineNum}: End date must be after start date`);
      return;
    }

    // Validate percentage
    const percentage = parseInt(row.percentage || '100', 10);
    if (isNaN(percentage) || percentage < 0 || percentage > 200) {
      errors.push(`Line ${lineNum}: Invalid percentage (must be 0-200)`);
      return;
    }

    validated.push({
      person_id: personId,
      project_id: projectId,
      start_date: formatDateForBackend(startDate),
      end_date: formatDateForBackend(endDate),
      percentage: percentage,
    });
  });

  if (errors.length > 0) {
    throw new Error('Validation errors:\n' + errors.join('\n'));
  }

  return validated;
}

/**
 * Format date for backend (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDateForBackend(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate sample CSV templates
 */
export const CSV_TEMPLATES = {
  people: `name,role
John Doe,Developer
Jane Smith,Designer
Bob Johnson,Project Manager`,

  clients: `name
Acme Corp
TechStart Inc
Global Solutions`,

  projects: `name,client
Website Redesign,Acme Corp
Mobile App,TechStart Inc
ERP System,Global Solutions`,

  assignments: `person,project,start_date,end_date,percentage
John Doe,Website Redesign,2026-01-01,2026-03-31,100
Jane Smith,Mobile App,2026-02-01,2026-04-30,80
Bob Johnson,ERP System,2026-01-15,2026-06-30,50`,
};

/**
 * Download CSV template
 * @param {string} type - Template type (people, clients, projects, assignments)
 */
export function downloadTemplate(type) {
  const template = CSV_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown template type: ${type}`);
  }

  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_template.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Detect duplicate entries
 * @param {Array} data - Data to check
 * @param {string} field - Field to check for duplicates
 * @returns {Array} Array of duplicate values
 */
export function findDuplicates(data, field) {
  const seen = new Set();
  const duplicates = [];

  data.forEach(item => {
    const value = item[field]?.toLowerCase().trim();
    if (value) {
      if (seen.has(value)) {
        duplicates.push(value);
      } else {
        seen.add(value);
      }
    }
  });

  return [...new Set(duplicates)]; // Remove duplicate entries in duplicates array
}

/**
 * Check for over-allocation in assignments
 * @param {Array} assignments - Assignments to check
 * @param {Array} people - People list
 * @returns {Array} Array of warnings
 */
export function checkOverAllocation(assignments, people) {
  const warnings = [];
  const allocationByPersonMonth = new Map();

  // Group by person and month
  assignments.forEach(assignment => {
    const person = people.find(p => p.id === assignment.person_id);
    if (!person) return;

    const startDate = parseDateString(assignment.start_date);
    const endDate = parseDateString(assignment.end_date);

    // Check each month in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = `${person.name}-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      const current = allocationByPersonMonth.get(key) || 0;
      allocationByPersonMonth.set(key, current + assignment.percentage);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  });

  // Find over-allocations
  allocationByPersonMonth.forEach((percentage, key) => {
    if (percentage > 100) {
      const [name, year, month] = key.split('-');
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
      warnings.push(`${name} is ${percentage}% allocated in ${monthName} ${year} (over by ${percentage - 100}%)`);
    }
  });

  return warnings;
}

export default {
  parseCSV,
  validatePeopleData,
  validateClientsData,
  validateProjectsData,
  validateAssignmentsData,
  downloadTemplate,
  findDuplicates,
  checkOverAllocation,
  CSV_TEMPLATES,
};
