import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getClientColor, getAllocationOpacity, getAllocationBadgeClass } from '../../utils/colors';
import { formatDateRange, calculateDurationDays } from '../../utils/dates';
import { calculatePartialMonthPosition } from '../../utils/assignmentUtils';

/**
 * AssignmentCard - Visual card representing an assignment
 * Props:
 *   assignment: object - assignment data
 *   person: object - person this assignment belongs to
 *   month: object - current month context (startDate, endDate, label)
 *   projects: array - all projects
 *   clients: array - all clients
 *   onEdit: function - callback to edit assignment
 */
export default function AssignmentCard({ 
  assignment, 
  person, 
  month,
  projects,
  clients,
  onEdit
}) {
  const { deleteAssignment } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('above');
  const [isDeleting, setIsDeleting] = useState(false);

  // Get project and client info
  const project = projects.find(p => p.id === assignment.projectId);
  const client = project ? clients.find(c => c.id === project.clientId) : null;

  // Get client color
  const clientColor = client ? getClientColor(client.id) : '#6b7280';
  
  // Get allocation opacity based on percentage
  const opacity = getAllocationOpacity(assignment.percentage);
  
  // Get badge class for allocation level
  const badgeClass = getAllocationBadgeClass(assignment.percentage);

  // CRITICAL: Calculate partial month positioning
  // This shows which portion of the month the assignment covers
  const position = calculatePartialMonthPosition(
    assignment.startDate,
    assignment.endDate,
    month.startDate,
    month.endDate
  );

  // Format date range
  const dateRange = formatDateRange(assignment.startDate, assignment.endDate);
  
  // Calculate duration
  const duration = calculateDurationDays(assignment.startDate, assignment.endDate);

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete assignment for ${person.name} on ${project?.name || 'Unknown Project'}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAssignment(assignment.id);
    } catch (error) {
      alert('Failed to delete assignment: ' + error.message);
      setIsDeleting(false);
    }
  };

  // Handle card click to edit
  const handleClick = (e) => {
    // Don't trigger if clicking delete button
    if (e.target.closest('.card-delete')) return;
    
    if (onEdit) {
      onEdit(assignment);
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  // Handle drag start
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'assignment',
      assignmentId: assignment.id,
      personId: person.id
    }));
  };

  if (!project || !client) {
    return (
      <div className="assignment-card assignment-card-error">
        <div className="project-name">Unknown Project</div>
      </div>
    );
  }

  return (
    <div
      className={`assignment-card ${isDeleting ? 'deleting' : ''}`}
      style={{
        backgroundColor: clientColor,
        opacity: opacity,
        // CRITICAL: Partial month positioning
        marginLeft: `${position.marginLeft}%`,
        width: `${position.width}%`,
        position: 'relative',
        cursor: 'pointer'
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleClick}
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const viewportMid = window.innerHeight / 2;
        setTooltipPosition(rect.top > viewportMid ? 'above' : 'below');
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
      title="Click to edit • Drag to move"
    >
      {/* Card Content */}
      <div className="card-content">
        <div className="project-name">{project.name}</div>
        <div className={`allocation-badge ${badgeClass}`}>
          {assignment.percentage}%
        </div>
      </div>

      {/* Delete Button */}
      <button
        className="card-delete"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete assignment"
      >
        ×
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className={`assignment-tooltip ${tooltipPosition}`}>
          <div className="tooltip-header">
            <strong>{project.name}</strong>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Client:</span>
            <span>{client.name}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Person:</span>
            <span>{person.name}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Dates:</span>
            <span>{dateRange}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Duration:</span>
            <span>{duration} days</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Allocation:</span>
            <span>{assignment.percentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
