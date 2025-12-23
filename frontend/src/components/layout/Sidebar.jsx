import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CollapsibleGroup from '../common/CollapsibleGroup';

export default function Sidebar({ openModal }) {
  const { people, clients, projects, deletePerson, deleteClient, deleteProject } = useApp();
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Group people by role
  const peopleByRole = {};
  people.forEach(person => {
    if (!peopleByRole[person.role]) {
      peopleByRole[person.role] = [];
    }
    peopleByRole[person.role].push(person);
  });
  
  // Group projects by client
  const projectsByClient = {};
  projects.forEach(project => {
    const client = clients.find(c => c.id === project.clientId);
    const clientName = client ? client.name : 'Unknown Client';
    if (!projectsByClient[clientName]) {
      projectsByClient[clientName] = [];
    }
    projectsByClient[clientName].push(project);
  });
  
  const handleEdit = (type, item) => {
    openModal(type, item);
  };
  
  const handleDelete = async (type, id) => {
    const confirmMessage = `Are you sure you want to delete this ${type}?`;
    if (window.confirm(confirmMessage)) {
      try {
        if (type === 'person') await deletePerson(id);
        else if (type === 'client') await deleteClient(id);
        else if (type === 'project') await deleteProject(id);
      } catch (error) {
        alert(`Failed to delete ${type}`);
      }
    }
  };
  
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      height: 'fit-content'
    }}>
      {/* Projects Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Projects
          <span style={{
            background: 'var(--accent-primary)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            minWidth: '24px',
            textAlign: 'center'
          }}>
            {projects.length}
          </span>
        </div>
        
        {projects.length === 0 ? (
          <div className="empty-cell">No projects</div>
        ) : (
          Object.keys(projectsByClient).sort().map(clientName => (
            <CollapsibleGroup
              key={`client-${clientName}`}
              id={`client-${clientName}`}
              title={clientName}
              icon="🏢"
              count={projectsByClient[clientName].length}
              isExpanded={expandedGroups[`client-${clientName}`]}
              onToggle={() => toggleGroup(`client-${clientName}`)}
            >
              {projectsByClient[clientName].map(project => (
                <div
                  key={project.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'grab',
                    userSelect: 'none'
                  }}
                  draggable={true}
                  onClick={(e) => {
                    // Only handle click if not clicking delete button
                    if (!e.target.closest('button')) {
                      handleEdit('project', project);
                    }
                  }}
                  onDragStart={(e) => {
                    // Ensure we're dragging from the main element
                    e.stopPropagation();
                    e.currentTarget.style.cursor = 'grabbing';
                    
                    e.dataTransfer.effectAllowed = 'copy';
                    const dragData = {
                      type: 'project',
                      projectId: project.id,
                      clientName: clientName
                    };
                    const dragDataString = JSON.stringify(dragData);
                    
                    // Set data with multiple types for better browser compatibility
                    e.dataTransfer.setData('application/json', dragDataString);
                    e.dataTransfer.setData('text/plain', dragDataString);
                    e.dataTransfer.setData('text', dragDataString);
                    
                    console.log('🚀 Drag started:', dragData);
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.cursor = 'grab';
                  }}
                >
                  <div 
                    style={{ 
                      flex: 1, 
                      cursor: 'pointer',
                      pointerEvents: 'none' // Prevent interfering with drag
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {clientName}
                    </div>
                  </div>
                  
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      pointerEvents: 'auto', // Re-enable for buttons
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDelete('project', project.id)}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </CollapsibleGroup>
          ))
        )}
      </div>
      
      {/* People Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Team Members
          <span style={{
            background: 'var(--accent-primary)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            minWidth: '24px',
            textAlign: 'center'
          }}>
            {people.length}
          </span>
        </div>
        
        {people.length === 0 ? (
          <div className="empty-cell">No team members</div>
        ) : (
          Object.keys(peopleByRole).sort().map(role => (
            <CollapsibleGroup
              key={`role-${role}`}
              id={`role-${role}`}
              title={role}
              icon="👥"
              count={peopleByRole[role].length}
              isExpanded={expandedGroups[`role-${role}`]}
              onToggle={() => toggleGroup(`role-${role}`)}
            >
              {peopleByRole[role].map(person => (
                <div
                  key={person.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div 
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => handleEdit('person', person)}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {person.role}
                    </div>
                  </div>
                  
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDelete('person', person.id)}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </CollapsibleGroup>
          ))
        )}
      </div>
      
      {/* Clients Section */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Clients
          <span style={{
            background: 'var(--accent-primary)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            minWidth: '24px',
            textAlign: 'center'
          }}>
            {clients.length}
          </span>
        </div>
        
        {clients.length === 0 ? (
          <div className="empty-cell">No clients</div>
        ) : (
          <CollapsibleGroup
            id="all-clients"
            title="All Clients"
            icon="🏢"
            count={clients.length}
            isExpanded={expandedGroups['all-clients']}
            onToggle={() => toggleGroup('all-clients')}
          >
            {clients.map(client => {
              const clientProjects = projects.filter(p => p.clientId === client.id);
              return (
                <div
                  key={client.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div 
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => handleEdit('client', client)}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDelete('client', client.id)}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </CollapsibleGroup>
        )}
      </div>
    </div>
  );
}
