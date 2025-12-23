import { formatDateForInput } from '../../utils/dates';
import { getHeatMapClass } from '../../utils/colors';
import AssignmentCard from './AssignmentCard';

/**
 * TimelineCell - Individual cell in the timeline grid
 * Props:
 *   person: object - person this cell belongs to
 *   month: object - month data (startDate, endDate, label, offset)
 *   assignments: array - assignments that overlap with this month
 *   totalAllocation: number - total percentage allocation
 *   projects: array - all projects
 *   clients: array - all clients
 *   onAddAssignment: function - handler to add assignment
 *   onEditAssignment: function - handler to edit assignment
 */
export default function TimelineCell({ 
  person, 
  month, 
  assignments, 
  totalAllocation,
  projects,
  clients,
  onAddAssignment,
  onEditAssignment
}) {
  // Get heat map class based on allocation level
  const heatMapClass = getHeatMapClass(totalAllocation);

  // Handle click on empty cell to add assignment
  const handleEmptyCellClick = () => {
    if (assignments.length === 0) {
      const startDate = formatDateForInput(month.startDate);
      const endDate = formatDateForInput(month.endDate);
      onAddAssignment(person.id, startDate, endDate);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-target');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-target');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');
    
    try {
      // Try to get data with multiple MIME types for better compatibility
      let data = e.dataTransfer.getData('application/json');
      if (!data) {
        data = e.dataTransfer.getData('text/plain');
      }
      if (!data) {
        data = e.dataTransfer.getData('text');
      }
      
      console.log('📥 Drop - Raw data:', data);
      
      if (!data) {
        console.error('❌ No data received from drop');
        return;
      }
      
      const dropData = JSON.parse(data);
      console.log('✅ Drop - Parsed data:', dropData);
      
      if (dropData.type === 'project') {
        // Dropped a project from sidebar
        const startDate = formatDateForInput(month.startDate);
        const endDate = formatDateForInput(month.endDate);
        console.log('🎯 Calling onAddAssignment with:', {
          personId: person.id,
          startDate,
          endDate,
          projectId: dropData.projectId
        });
        onAddAssignment(person.id, startDate, endDate, dropData.projectId);
      } else if (dropData.type === 'assignment') {
        // Dragged an assignment between cells
        // TODO: Implement assignment move
        console.log('Move assignment', dropData.assignmentId, 'to', person.id, month.label);
      }
    } catch (error) {
      console.error('❌ Drop error:', error);
      console.error('Error details:', error.message);
    }
  };

  return (
    <div 
      className={`timeline-cell ${heatMapClass}`}
      data-person-id={person.id}
      data-month-offset={month.offset}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {assignments.length === 0 ? (
        <div 
          className="empty-cell"
          onClick={handleEmptyCellClick}
          style={{ cursor: 'pointer' }}
          title="Click to add assignment"
        >
          —
        </div>
      ) : (
        <div className="cell-assignments">
          {assignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              person={person}
              month={month}
              projects={projects}
              clients={clients}
              onEdit={onEditAssignment}
            />
          ))}
          
          {/* Show total allocation if multiple assignments */}
          {assignments.length > 1 && (
            <div className={`allocation-badge ${totalAllocation > 100 ? 'over-allocated' : ''}`}>
              {totalAllocation}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
