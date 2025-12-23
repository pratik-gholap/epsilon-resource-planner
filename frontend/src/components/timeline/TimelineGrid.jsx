import { useApp } from '../../context/AppContext';
import TimelineCell from './TimelineCell';
import { getPeriodDates } from '../../utils/dates';

/**
 * TimelineGrid - Main grid component displaying people and their assignments
 * Props:
 *   startIndex: number - start index for pagination
 *   endIndex: number - end index for pagination
 */
export default function TimelineGrid({ startIndex, endIndex, onAddAssignment, onEditAssignment }) {
  const { people, assignments, projects, clients, currentPeriodOffset, deletePerson } = useApp();

  // Get paginated people
  const paginatedPeople = people.slice(startIndex, endIndex);

  // Generate 6 months starting from currentPeriodOffset
  const months = [];
  for (let i = 0; i < 6; i++) {
    const monthOffset = currentPeriodOffset + i;
    const { startDate, endDate, label } = getPeriodDates(monthOffset);
    // Convert label to uppercase format: "JAN 2026"
    const [month, year] = label.split(' ');
    const upperLabel = `${month.toUpperCase()} ${year}`;
    months.push({ offset: monthOffset, startDate, endDate, label: upperLabel });
  }

  // Get assignments for a person in a specific month
  const getAssignmentsForCell = (personId, month) => {
    return assignments.filter(assignment => {
      if (assignment.personId !== personId) return false;
      
      // Check if assignment overlaps with this month
      const assignmentStart = new Date(assignment.startDate);
      const assignmentEnd = new Date(assignment.endDate);
      const monthStart = month.startDate;
      const monthEnd = month.endDate;
      
      // Assignment overlaps if it starts before month ends AND ends after month starts
      return assignmentStart <= monthEnd && assignmentEnd >= monthStart;
    });
  };

  // Calculate total allocation for a person in a month
  const getTotalAllocation = (personId, month) => {
    const cellAssignments = getAssignmentsForCell(personId, month);
    return cellAssignments.reduce((sum, a) => sum + a.percentage, 0);
  };

  const handleDeletePerson = async (person) => {
    if (!confirm(`Delete ${person.name}? This will also delete all their assignments.`)) {
      return;
    }
    
    try {
      await deletePerson(person.id);
    } catch (error) {
      alert('Failed to delete person: ' + error.message);
    }
  };

  return (
    <div className="timeline-grid">
      {/* Header Row */}
      <div className="grid-header">
        <div className="person-column-header">PERSON</div>
        {months.map(month => (
          <div key={month.offset} className="month-column-header">
            {month.label}
          </div>
        ))}
      </div>

      {/* Person Rows */}
      {paginatedPeople.length === 0 ? (
        <div className="empty-state">
          <p>No team members found. Add people to get started!</p>
        </div>
      ) : (
        paginatedPeople.map(person => (
          <div key={person.id} className="grid-row">
            {/* Person Info Column */}
            <div className="person-column">
              <div className="person-name">{person.name}</div>
            </div>

            {/* Month Cells */}
            {months.map(month => {
              const cellAssignments = getAssignmentsForCell(person.id, month);
              const totalAllocation = getTotalAllocation(person.id, month);
              
              return (
                <TimelineCell
                  key={`${person.id}-${month.offset}`}
                  person={person}
                  month={month}
                  assignments={cellAssignments}
                  totalAllocation={totalAllocation}
                  projects={projects}
                  clients={clients}
                  onAddAssignment={onAddAssignment}
                  onEditAssignment={onEditAssignment}
                />
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
