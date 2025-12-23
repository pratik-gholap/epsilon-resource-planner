/**
 * API Utility Functions
 * Handles all communication with the Flask backend
 * Base URL: http://localhost:5000
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================
// PEOPLE API
// ============================================

export async function getPeople() {
  return fetchAPI('/people');
}

export async function addPerson(personData) {
  return fetchAPI('/people', {
    method: 'POST',
    body: JSON.stringify(personData),
  });
}

export async function updatePerson(id, personData) {
  return fetchAPI(`/people/${id}`, {
    method: 'PUT',
    body: JSON.stringify(personData),
  });
}

export async function deletePerson(id) {
  return fetchAPI(`/people/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// CLIENTS API
// ============================================

export async function getClients() {
  return fetchAPI('/clients');
}

export async function addClient(clientData) {
  return fetchAPI('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
}

export async function updateClient(id, clientData) {
  return fetchAPI(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
}

export async function deleteClient(id) {
  return fetchAPI(`/clients/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// PROJECTS API
// ============================================

export async function getProjects() {
  return fetchAPI('/projects');
}

export async function addProject(projectData) {
  return fetchAPI('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id, projectData) {
  return fetchAPI(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
}

export async function deleteProject(id) {
  return fetchAPI(`/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// ASSIGNMENTS API
// ============================================

export async function getAssignments() {
  return fetchAPI('/assignments');
}

export async function addAssignment(assignmentData) {
  return fetchAPI('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  });
}

export async function updateAssignment(id, assignmentData) {
  return fetchAPI(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignmentData),
  });
}

export async function deleteAssignment(id) {
  return fetchAPI(`/assignments/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Upload CSV data for bulk import
 */
export async function uploadCSV(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData, // FormData doesn't need Content-Type header
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

/**
 * Get all data at once (for export)
 */
export async function getAllData() {
  try {
    const [people, clients, projects, assignments] = await Promise.all([
      getPeople(),
      getClients(),
      getProjects(),
      getAssignments(),
    ]);

    return {
      people,
      clients,
      projects,
      assignments,
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check if backend is running
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  // People
  getPeople,
  addPerson,
  updatePerson,
  deletePerson,
  
  // Clients
  getClients,
  addClient,
  updateClient,
  deleteClient,
  
  // Projects
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  
  // Assignments
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  
  // Bulk
  uploadCSV,
  getAllData,
  
  // Health
  checkBackendHealth,
};
