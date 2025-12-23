// API Service for Resource Planner Backend

const API_BASE_URL = '/api';

class APIService {
  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // People endpoints
  async getPeople() {
    return this.request('/people');
  }

  async addPerson(person) {
    return this.request('/people', 'POST', person);
  }

  async updatePerson(id, person) {
    return this.request(`/people/${id}`, 'PUT', person);
  }

  async deletePerson(id) {
    return this.request(`/people/${id}`, 'DELETE');
  }

  // Clients endpoints
  async getClients() {
    return this.request('/clients');
  }

  async addClient(client) {
    return this.request('/clients', 'POST', client);
  }

  async updateClient(id, client) {
    return this.request(`/clients/${id}`, 'PUT', client);
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, 'DELETE');
  }

  // Projects endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async addProject(project) {
    return this.request('/projects', 'POST', project);
  }

  async updateProject(id, project) {
    return this.request(`/projects/${id}`, 'PUT', project);
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, 'DELETE');
  }

  // Assignments endpoints
  async getAssignments() {
    return this.request('/assignments');
  }

  async addAssignment(assignment) {
    return this.request('/assignments', 'POST', assignment);
  }

  async updateAssignment(id, assignment) {
    return this.request(`/assignments/${id}`, 'PUT', assignment);
  }

  async deleteAssignment(id) {
    return this.request(`/assignments/${id}`, 'DELETE');
  }

  // Bulk upload endpoints
  async bulkUploadPeople(people) {
    return this.request('/bulk-upload/people', 'POST', { people });
  }

  async bulkUploadClients(clients) {
    return this.request('/bulk-upload/clients', 'POST', { clients });
  }

  async bulkUploadProjects(projects) {
    return this.request('/bulk-upload/projects', 'POST', { projects });
  }

  async bulkUploadAssignments(assignments) {
    return this.request('/bulk-upload/assignments', 'POST', { assignments });
  }

  // Utility endpoints
  async healthCheck() {
    return this.request('/health');
  }

  async clearAll() {
    return this.request('/clear-all', 'POST');
  }
}

export default new APIService();
