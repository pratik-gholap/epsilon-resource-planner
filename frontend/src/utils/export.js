// Export utility functions for Resource Planner
import * as XLSX from 'xlsx';

/**
 * Export assignments to Excel
 */
export function exportToExcel(people, clients, projects, assignments) {
  // Prepare assignments data
  const assignmentsData = assignments.map(a => {
    const person = people.find(p => p.id === a.personId);
    const project = projects.find(p => p.id === a.projectId);
    const client = project ? clients.find(c => c.id === project.clientId) : null;
    
    return {
      'Person Name': person ? person.name : 'Unknown',
      'Person Role': person ? person.role : 'Unknown',
      'Project Name': project ? project.name : 'Unknown',
      'Client Name': client ? client.name : 'Unknown',
      'Start Date': a.startDate,
      'End Date': a.endDate,
      'Allocation %': a.percentage || 100
    };
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(assignmentsData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Assignments");
  
  // Generate filename with current date
  const filename = `resource-planner-assignments-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
}

/**
 * Parse CSV content
 */
export function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}
