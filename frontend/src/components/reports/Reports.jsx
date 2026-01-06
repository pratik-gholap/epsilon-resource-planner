import { useState, useMemo } from 'react';
import { parseDateString, getPeriodDates } from '../../utils/dates';
import { getClientColor } from '../../utils/colors';
import * as XLSX from 'xlsx';

/**
 * Reports Component - Comprehensive reporting view
 * Props:
 *   people: array - all team members
 *   clients: array - all clients
 *   projects: array - all projects
 *   assignments: array - all assignments
 *   onBack: function - callback to return to timeline
 */
export default function Reports({ people, clients, projects, assignments, onBack }) {
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);
  const [viewType, setViewType] = useState('team'); // 'team', 'project'
  const [projectSortKey, setProjectSortKey] = useState('project');
  const [projectSortDir, setProjectSortDir] = useState('asc');
  const [projectFilter, setProjectFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [groupByClient, setGroupByClient] = useState(false);
  const [activeTooltipRow, setActiveTooltipRow] = useState(null);
  const [activeTooltipPosition, setActiveTooltipPosition] = useState('below');

  // Generate 6 months for report
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const period = getPeriodDates(currentPeriodOffset + i);
      result.push(period);
    }
    return result;
  }, [currentPeriodOffset]);

  // Calculate team allocation by month
  const teamAllocation = useMemo(() => {
    return people.map(person => {
      const personData = { person };
      months.forEach((month, idx) => {
        const monthAssignments = assignments.filter(a => {
          if (a.personId !== person.id) return false;
          const assignStart = parseDateString(a.startDate);
          const assignEnd = parseDateString(a.endDate);
          return assignStart <= month.endDate && assignEnd >= month.startDate;
        });
        const total = monthAssignments.reduce((sum, a) => sum + a.percentage, 0);
        personData[`month${idx}`] = total;
      });
      return personData;
    });
  }, [people, months, assignments]);

  // Calculate project distribution
  const projectDistribution = useMemo(() => {
    return projects.map(project => {
      const projectAssignments = assignments.filter(a => a.projectId === project.id);
      const uniquePeopleIds = [...new Set(projectAssignments.map(a => a.personId))];
      const peopleNames = uniquePeopleIds
        .map(personId => people.find(p => p.id === personId)?.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      const totalAllocation = projectAssignments.reduce((sum, a) => sum + a.percentage, 0);
      const client = clients.find(c => c.id === project.clientId);
      
      return {
        project,
        client,
        peopleCount: uniquePeopleIds.length,
        peopleNames,
        totalAllocation,
        avgAllocation: uniquePeopleIds.length > 0 ? totalAllocation / uniquePeopleIds.length : 0
      };
    });
  }, [projects, assignments, clients, people]);

  const filteredProjectRows = useMemo(() => {
    return projectDistribution.filter(row => {
      const matchesProject = projectFilter === 'all' || row.project.id === Number(projectFilter);
      const matchesClient = clientFilter === 'all' || row.client?.id === Number(clientFilter);
      return matchesProject && matchesClient;
    });
  }, [projectDistribution, projectFilter, clientFilter]);

  const sortedProjectRows = useMemo(() => {
    const sorted = [...filteredProjectRows];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (projectSortKey === 'project') {
        comparison = a.project.name.localeCompare(b.project.name);
      } else if (projectSortKey === 'client') {
        comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
      } else if (projectSortKey === 'people') {
        comparison = a.peopleCount - b.peopleCount;
      } else if (projectSortKey === 'avg') {
        comparison = a.avgAllocation - b.avgAllocation;
      }
      return projectSortDir === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredProjectRows, projectSortKey, projectSortDir]);

  const groupedProjectRows = useMemo(() => {
    const groups = new Map();
    sortedProjectRows.forEach(row => {
      const key = row.client?.name || 'Unknown Client';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sortedProjectRows]);

  const handleTooltipEnter = (event, rowId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportMid = window.innerHeight / 2;
    setActiveTooltipPosition(rect.top > viewportMid ? 'above' : 'below');
    setActiveTooltipRow(rowId);
  };

  // Export to XLSX
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Team Allocation Sheet
    const teamData = [
      ['Person', 'Role', ...months.map(m => m.label)],
      ...teamAllocation.map(row => [
        row.person.name,
        row.person.role,
        ...months.map((_, idx) => `${row[`month${idx}`]}%`)
      ])
    ];
    const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
    XLSX.utils.book_append_sheet(wb, teamSheet, 'Team Allocation');

    // Project Distribution Sheet
    const projectData = [
      ['Project', 'Client', 'People', 'Avg Allocation'],
      ...projectDistribution.map(row => [
        row.project.name,
        row.client?.name || 'Unknown',
        row.peopleCount,
        `${Math.round(row.avgAllocation)}%`
      ])
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, projectSheet, 'Project Distribution');

    // Write file
    XLSX.writeFile(wb, 'resource-allocation-report.xlsx');
  };

  const getAllocationColor = (percentage) => {
    if (percentage > 100) return '#ef4444'; // Red - over-allocated
    if (percentage > 70) return '#f59e0b'; // Orange - high
    if (percentage > 30) return '#3b82f6'; // Blue - medium
    return '#10b981'; // Green - low
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border)'
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '1.75rem',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            Reports & Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {months[0].label} - {months[5].label}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Period Navigation */}
          <button 
            className="btn-icon" 
            onClick={() => setCurrentPeriodOffset(currentPeriodOffset - 6)}
            title="Previous 6 Months"
          >
            <span>←</span>
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setCurrentPeriodOffset(0)}
            title="Current Period"
          >
            <span>📅</span>
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setCurrentPeriodOffset(currentPeriodOffset + 6)}
            title="Next 6 Months"
          >
            <span>→</span>
          </button>
          
          <div style={{ width: '1px', height: '32px', background: 'var(--border)', margin: '0 0.5rem' }} />
          
          {/* Export */}
          <button className="btn" onClick={handleExport}>
            📥 Export XLSX
          </button>
          
          {/* Back */}
          <button className="btn" onClick={onBack}>
            ← Back to Timeline
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        <button
          className={`btn ${viewType === 'team' ? 'btn-active' : ''}`}
          onClick={() => setViewType('team')}
          style={{ padding: '0.5rem 1rem' }}
        >
          👥 Team Allocation
        </button>
        <button
          className={`btn ${viewType === 'project' ? 'btn-active' : ''}`}
          onClick={() => setViewType('project')}
          style={{ padding: '0.5rem 1rem' }}
        >
          📊 Project Distribution
        </button>
      </div>

      {/* Team Allocation View */}
      {viewType === 'team' && (
        <div className="report-grid-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                {months.map(month => (
                  <th key={month.label}>{month.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamAllocation.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.person.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.person.role}</td>
                  {months.map((_, mIdx) => {
                    const allocation = row[`month${mIdx}`];
                    return (
                      <td
                        key={mIdx}
                        style={{
                          color: getAllocationColor(allocation),
                          fontWeight: allocation > 100 ? 700 : 600,
                          textAlign: 'center'
                        }}
                      >
                        {allocation}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Distribution View */}
      {viewType === 'project' && (
        <div style={{ overflowX: 'auto' }}>
          <div className="report-controls">
            <label className="report-control">
              Sort by
              <select value={projectSortKey} onChange={event => setProjectSortKey(event.target.value)}>
                <option value="project">Project</option>
                <option value="client">Client</option>
                <option value="people">People</option>
                <option value="avg">Avg Allocation</option>
              </select>
            </label>
            <label className="report-control">
              Order
              <select value={projectSortDir} onChange={event => setProjectSortDir(event.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
            <label className="report-control">
              Filter project
              <select value={projectFilter} onChange={event => setProjectFilter(event.target.value)}>
                <option value="all">All</option>
                {projects
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="report-control">
              Filter client
              <select value={clientFilter} onChange={event => setClientFilter(event.target.value)}>
                <option value="all">All</option>
                {clients
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="report-control report-toggle">
              <input
                type="checkbox"
                checked={groupByClient}
                onChange={event => setGroupByClient(event.target.checked)}
              />
              Group by client
            </label>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>People</th>
                <th>Avg per Person</th>
              </tr>
            </thead>
            {groupByClient ? (
              groupedProjectRows.map(([clientName, rows]) => (
                <tbody key={clientName}>
                  <tr className="report-group-row">
                    <td colSpan={4}>{clientName}</td>
                  </tr>
                  {rows.map(row => (
                    <tr key={row.project.id}>
                      <td style={{ fontWeight: 600 }}>{row.project.name}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getClientColor(row.client?.id),
                            marginRight: '0.5rem'
                          }}
                        />
                        {row.client?.name || 'Unknown'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="report-tooltip-wrapper"
                          onMouseEnter={(event) => handleTooltipEnter(event, row.project.id)}
                          onMouseLeave={() => setActiveTooltipRow(null)}
                        >
                          {row.peopleCount}
                          {activeTooltipRow === row.project.id && (
                            <span className={`report-tooltip ${activeTooltipPosition}`}>
                              {row.peopleNames.length
                                ? row.peopleNames.join(', ')
                                : 'No assignments'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {Math.round(row.avgAllocation)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))
            ) : (
              <tbody>
                {sortedProjectRows.map(row => (
                    <tr key={row.project.id}>
                      <td style={{ fontWeight: 600 }}>{row.project.name}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getClientColor(row.client?.id),
                            marginRight: '0.5rem'
                          }}
                        />
                        {row.client?.name || 'Unknown'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="report-tooltip-wrapper"
                          onMouseEnter={(event) => handleTooltipEnter(event, row.project.id)}
                          onMouseLeave={() => setActiveTooltipRow(null)}
                        >
                          {row.peopleCount}
                          {activeTooltipRow === row.project.id && (
                            <span className={`report-tooltip ${activeTooltipPosition}`}>
                              {row.peopleNames.length ? row.peopleNames.join(', ') : 'No assignments'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {Math.round(row.avgAllocation)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
      )}

    </div>
  );
}
