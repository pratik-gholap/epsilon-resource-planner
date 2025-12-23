/**
 * Sample Data Generator for Epsilon Resource Planner
 * 
 * Run this in the browser console when the app is open to add test data
 * Make sure the backend is running on http://localhost:5000
 */

const API_URL = 'http://localhost:5000/api';

async function addSampleData() {
  console.log('🚀 Adding sample data to Resource Planner...');
  
  try {
    // Step 1: Add Clients
    console.log('📋 Adding clients...');
    const clients = [
      { name: 'Acme Corporation' },
      { name: 'TechStart Inc' },
      { name: 'Global Dynamics' }
    ];
    
    const clientIds = [];
    for (const client of clients) {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      const data = await response.json();
      clientIds.push(data.id);
      console.log(`✓ Added client: ${client.name}`);
    }
    
    // Step 2: Add Projects
    console.log('\n📊 Adding projects...');
    const projects = [
      { name: 'Website Redesign', client_id: clientIds[0] },
      { name: 'Mobile App Development', client_id: clientIds[0] },
      { name: 'Cloud Migration', client_id: clientIds[1] },
      { name: 'Data Analytics Platform', client_id: clientIds[1] },
      { name: 'Security Audit', client_id: clientIds[2] }
    ];
    
    const projectIds = [];
    for (const project of projects) {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      const data = await response.json();
      projectIds.push(data.id);
      console.log(`✓ Added project: ${project.name}`);
    }
    
    // Step 3: Add People
    console.log('\n👥 Adding team members...');
    const people = [
      { name: 'Sarah Johnson', role: 'Developer' },
      { name: 'Mike Chen', role: 'Developer' },
      { name: 'Emily Rodriguez', role: 'Designer' },
      { name: 'David Kim', role: 'Project Manager' },
      { name: 'Lisa Anderson', role: 'Developer' },
      { name: 'James Wilson', role: 'QA Engineer' },
      { name: 'Maria Garcia', role: 'Designer' },
      { name: 'Robert Taylor', role: 'DevOps Engineer' }
    ];
    
    const personIds = [];
    for (const person of people) {
      const response = await fetch(`${API_URL}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
      });
      const data = await response.json();
      personIds.push(data.id);
      console.log(`✓ Added person: ${person.name} (${person.role})`);
    }
    
    // Step 4: Add Assignments
    console.log('\n📅 Adding assignments...');
    const assignments = [
      // January 2026
      { person_id: personIds[0], project_id: projectIds[0], start_date: '2026-01-05', end_date: '2026-02-28', percentage: 80 },
      { person_id: personIds[1], project_id: projectIds[0], start_date: '2026-01-05', end_date: '2026-01-31', percentage: 50 },
      { person_id: personIds[2], project_id: projectIds[0], start_date: '2026-01-15', end_date: '2026-03-15', percentage: 60 },
      
      // February 2026
      { person_id: personIds[3], project_id: projectIds[1], start_date: '2026-02-01', end_date: '2026-04-30', percentage: 100 },
      { person_id: personIds[1], project_id: projectIds[1], start_date: '2026-02-01', end_date: '2026-03-31', percentage: 40 },
      
      // March 2026
      { person_id: personIds[4], project_id: projectIds[2], start_date: '2026-03-01', end_date: '2026-05-31', percentage: 75 },
      { person_id: personIds[7], project_id: projectIds[2], start_date: '2026-03-01', end_date: '2026-04-15', percentage: 100 },
      
      // April 2026
      { person_id: personIds[5], project_id: projectIds[3], start_date: '2026-04-01', end_date: '2026-06-30', percentage: 50 },
      { person_id: personIds[0], project_id: projectIds[3], start_date: '2026-04-01', end_date: '2026-05-31', percentage: 30 },
      
      // May 2026
      { person_id: personIds[6], project_id: projectIds[4], start_date: '2026-05-01', end_date: '2026-07-31', percentage: 60 },
      { person_id: personIds[5], project_id: projectIds[4], start_date: '2026-05-15', end_date: '2026-06-15', percentage: 40 },
      
      // Overlapping assignments to test allocation warnings
      { person_id: personIds[1], project_id: projectIds[2], start_date: '2026-03-15', end_date: '2026-04-15', percentage: 50 },
    ];
    
    for (const assignment of assignments) {
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      await response.json();
      console.log(`✓ Added assignment`);
    }
    
    console.log('\n✅ Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   People: ${people.length}`);
    console.log(`   Assignments: ${assignments.length}`);
    console.log('\n🔄 Refresh the page to see the data!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

// Run the function
addSampleData();
