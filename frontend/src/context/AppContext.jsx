// App Context for Resource Planner
import { createContext, useContext, useState, useEffect } from 'react';
import { getPeriodDates, parseDateString } from '../utils/dates';
import api from '../services/api';

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  // Data state
  const [people, setPeople] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  
  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  async function loadAllData() {
    setLoading(true);
    setError(null);
    
    try {
      const [peopleData, clientsData, projectsData, assignmentsData] = await Promise.all([
        api.getPeople(),
        api.getClients(),
        api.getProjects(),
        api.getAssignments()
      ]);
      
      setPeople(peopleData.map(p => ({ id: p.id, name: p.name, role: p.role })));
      setClients(clientsData.map(c => ({ id: c.id, name: c.name })));
      setProjects(projectsData.map(p => ({ 
        id: p.id, 
        name: p.name, 
        clientId: p.client_id 
      })));
      setAssignments(assignmentsData.map(a => ({ 
        id: a.id,
        personId: a.person_id, 
        projectId: a.project_id, 
        startDate: a.start_date,
        endDate: a.end_date,
        percentage: a.percentage || 100
      })));
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running on http://localhost:5000');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // Person actions
  async function addPerson(person) {
    const result = await api.addPerson(person);
    setPeople([...people, result]);
    return result;
  }
  
  async function updatePerson(id, person) {
    const result = await api.updatePerson(id, person);
    setPeople(people.map(p => p.id === id ? result : p));
    return result;
  }
  
  async function deletePerson(id) {
    await api.deletePerson(id);
    setPeople(people.filter(p => p.id !== id));
    setAssignments(assignments.filter(a => a.personId !== id));
  }
  
  // Client actions
  async function addClient(client) {
    const result = await api.addClient(client);
    setClients([...clients, result]);
    return result;
  }
  
  async function updateClient(id, client) {
    const result = await api.updateClient(id, client);
    setClients(clients.map(c => c.id === id ? result : c));
    return result;
  }
  
  async function deleteClient(id) {
    await api.deleteClient(id);
    const projectIds = projects.filter(p => p.clientId === id).map(p => p.id);
    setAssignments(assignments.filter(a => !projectIds.includes(a.projectId)));
    setProjects(projects.filter(p => p.clientId !== id));
    setClients(clients.filter(c => c.id !== id));
  }
  
  // Project actions
  async function addProject(project) {
    const result = await api.addProject(project);
    setProjects([...projects, result]);
    return result;
  }
  
  async function updateProject(id, project) {
    const result = await api.updateProject(id, project);
    setProjects(projects.map(p => p.id === id ? result : p));
    return result;
  }
  
  async function deleteProject(id) {
    await api.deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
    setAssignments(assignments.filter(a => a.projectId !== id));
  }
  
  // Assignment actions
  async function addAssignment(assignment) {
    const result = await api.addAssignment(assignment);
    const newAssignment = {
      id: result.id,
      personId: assignment.personId,
      projectId: assignment.projectId,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      percentage: assignment.percentage || 100
    };
    setAssignments([...assignments, newAssignment]);
    return newAssignment;
  }

  async function updateAssignment(id, assignment) {
    const result = await api.updateAssignment(id, assignment);
    const updatedAssignment = {
      id: result.id,
      personId: result.personId,
      projectId: result.projectId,
      startDate: result.startDate,
      endDate: result.endDate,
      percentage: result.percentage ?? assignment.percentage ?? 100
    };
    setAssignments(assignments.map(a => (a.id === id ? updatedAssignment : a)));
    return updatedAssignment;
  }
  
  async function deleteAssignment(id) {
    await api.deleteAssignment(id);
    setAssignments(assignments.filter(a => a.id !== id));
  }
  
  async function moveAssignment(assignmentId, targetPersonId, targetPeriod) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    // Calculate new dates based on target period
    const { startDate: periodStart } = getPeriodDates(targetPeriod);
    const duration = calculateDurationDays(assignment.startDate, assignment.endDate);
    
    const newStartDate = formatDateForInput(periodStart);
    const newEndDate = formatDateForInput(
      new Date(periodStart.getTime() + duration * 24 * 60 * 60 * 1000)
    );
    
    // Delete old and create new
    await api.deleteAssignment(assignmentId);
    const result = await api.addAssignment({
      personId: targetPersonId,
      projectId: assignment.projectId,
      startDate: newStartDate,
      endDate: newEndDate,
      percentage: assignment.percentage
    });
    
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    setAssignments(prev => [...prev, {
      id: result.id,
      personId: targetPersonId,
      projectId: assignment.projectId,
      startDate: newStartDate,
      endDate: newEndDate,
      percentage: assignment.percentage
    }]);
  }
  
  // Bulk upload actions
  async function bulkUploadPeople(peopleData) {
    const result = await api.bulkUploadPeople(peopleData);
    setPeople([...people, ...result.added]);
    return result;
  }
  
  async function bulkUploadClients(clientsData) {
    const result = await api.bulkUploadClients(clientsData);
    setClients([...clients, ...result.added]);
    return result;
  }
  
  async function bulkUploadProjects(projectsData) {
    const result = await api.bulkUploadProjects(projectsData);
    setProjects([...projects, ...result.added]);
    return result;
  }
  
  async function bulkUploadAssignments(assignmentsData) {
    const result = await api.bulkUploadAssignments(assignmentsData);
    const addedAssignments = result.added.map(a => ({
      id: a.id,
      personId: a.personId,
      projectId: a.projectId,
      startDate: a.startDate,
      endDate: a.endDate,
      percentage: a.percentage
    }));
    const combinedAssignments = [...assignments, ...addedAssignments];
    setAssignments(combinedAssignments);

    if (combinedAssignments.length > 0) {
      const earliestStart = combinedAssignments.reduce((earliest, assignment) => {
        const start = parseDateString(assignment.startDate);
        return start < earliest ? start : earliest;
      }, parseDateString(combinedAssignments[0].startDate));
      const currentStart = getPeriodDates(currentPeriodOffset).startDate;
      if (earliestStart < currentStart) {
        const offset = (earliestStart.getFullYear() - 2026) * 12 + earliestStart.getMonth();
        setCurrentPeriodOffset(offset);
      }
    }
    return result;
  }
  
  const value = {
    // Data
    people,
    clients,
    projects,
    assignments,
    
    // UI State
    loading,
    error,
    currentPeriodOffset,
    setCurrentPeriodOffset,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Actions
    loadAllData,
    addPerson,
    updatePerson,
    deletePerson,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    moveAssignment,
    bulkUploadPeople,
    bulkUploadClients,
    bulkUploadProjects,
    bulkUploadAssignments
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
