import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateForInput } from '../../utils/dates';
import { splitAssignmentByMonth } from '../../utils/assignmentUtils';

/**
 * AssignmentModal - Modal for adding or editing assignments
 * Props:
 *   isOpen: boolean - whether modal is visible
 *   onClose: function - callback to close modal
 *   assignment: object - assignment to edit (null for new assignment)
 *   preselectedPersonId: number - optional person to preselect
 *   preselectedProjectId: number - optional project to preselect
 *   prefilledDates: object - optional {start_date, end_date} to prefill
 */
export default function AssignmentModal({
  isOpen,
  onClose,
  assignment = null,
  preselectedPersonId = null,
  preselectedProjectId = null,
  prefilledDates = null
}) {
  const { people, projects, clients, addAssignment, updateAssignment, assignments } = useApp();
  
  const [formData, setFormData] = useState({
    person_id: '',
    project_id: '',
    start_date: '',
    end_date: '',
    percentage: 50
  });
  
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or assignment changes
  useEffect(() => {
    if (isOpen) {
      console.log('🔷 Modal opened - isOpen:', isOpen);
      console.log('🔷 Assignment prop:', assignment);
      console.log('🔷 Preselected person:', preselectedPersonId);
      console.log('🔷 Preselected project:', preselectedProjectId);
      console.log('🔷 Prefilled dates:', prefilledDates);
      
      if (assignment) {
        // EDIT MODE: Editing existing assignment
        console.log('📝 EDIT MODE DETECTED');
        console.log('📝 Edit mode - Assignment data:', assignment);
        
        // Ensure dates are in YYYY-MM-DD format
        const startDate = assignment.startDate ? 
          (assignment.startDate.includes('T') ? assignment.startDate.split('T')[0] : assignment.startDate) : '';
        const endDate = assignment.endDate ? 
          (assignment.endDate.includes('T') ? assignment.endDate.split('T')[0] : assignment.endDate) : '';
        
        console.log('📅 Formatted dates:', { startDate, endDate });
        
        const editFormData = {
          person_id: assignment.personId || '',
          project_id: assignment.projectId || '',
          start_date: startDate,
          end_date: endDate,
          percentage: assignment.percentage || 50
        };
        
        console.log('📋 Setting form data:', editFormData);
        setFormData(editFormData);
        console.log('✅ Form data set for editing');
      } else {
        // CREATE MODE: Adding new assignment
        console.log('➕ CREATE MODE DETECTED');
        const today = formatDateForInput(new Date());
        const createFormData = {
          person_id: preselectedPersonId || (people.length > 0 ? people[0].id : ''),
          project_id: preselectedProjectId || (projects.length > 0 ? projects[0].id : ''),
          start_date: prefilledDates?.start_date || today,
          end_date: prefilledDates?.end_date || today,
          percentage: 100
        };
        
        console.log('📋 Setting form data:', createFormData);
        setFormData(createFormData);
      }
      setErrors({});
      setWarnings({});
    }
  }, [isOpen, assignment, preselectedPersonId, preselectedProjectId, prefilledDates, people, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`🔄 Field changed: ${name} = "${value}" (type: ${typeof value})`);
    
    let processedValue = value;
    
    if (name === 'percentage') {
      // Enforce max 100 for percentage
      let numValue = parseInt(value, 10) || 0;
      if (numValue > 100) numValue = 100;
      if (numValue < 0) numValue = 0;
      processedValue = numValue;
      console.log(`🔄 Percentage processed: "${value}" → ${processedValue}`);
    } else if (name === 'person_id' || name === 'project_id') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue
      };
      console.log(`🔄 New form data:`, newData);
      return newData;
    });
    
    // Clear error/warning for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (warnings[name]) {
      setWarnings(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const newWarnings = {};
    
    if (!formData.person_id) {
      newErrors.person_id = 'Person is required';
    }
    
    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    if (formData.percentage < 1 || formData.percentage > 100) {
      newErrors.percentage = 'Percentage must be between 1 and 100';
    }
    
    // Check for over-allocation
    if (formData.person_id && formData.start_date && formData.end_date && formData.percentage) {
      const overlappingAssignments = assignments.filter(a => {
        // Skip the current assignment if editing
        if (assignment && a.id === assignment.id) return false;
        
        // Check if same person (convert form person_id to int for comparison)
        if (a.personId !== parseInt(formData.person_id)) return false;
        
        // Check if dates overlap
        const aStart = new Date(a.startDate);
        const aEnd = new Date(a.endDate);
        const fStart = new Date(formData.start_date);
        const fEnd = new Date(formData.end_date);
        
        return !(fEnd < aStart || fStart > aEnd);
      });
      
      if (overlappingAssignments.length > 0) {
        const totalPercentage = overlappingAssignments.reduce(
          (sum, a) => sum + a.percentage, 
          formData.percentage
        );
        
        if (totalPercentage > 100) {
          newWarnings.percentage = `⚠️ This person will be over-allocated (${totalPercentage}%) during this period`;
        }
      }
    }
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 ==================== SUBMIT TRIGGERED ====================');
    console.log('🚀 Form data at submit:', formData);
    console.log('🚀 Assignment prop (edit mode?):', assignment);
    console.log('🚀 Is edit mode:', !!assignment);
    console.log('🚀 Percentage in form:', formData.percentage, 'type:', typeof formData.percentage);
    
    if (!validate()) {
      console.log('❌ Validation failed, errors:', errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert form data from snake_case to camelCase for API
      const assignmentData = {
        personId: parseInt(formData.person_id),
        projectId: parseInt(formData.project_id),
        startDate: formData.start_date,
        endDate: formData.end_date,
        percentage: parseInt(formData.percentage)
      };
      
      console.log('💾 Converted assignment data:', assignmentData);
      console.log('💾 Percentage conversion:', formData.percentage, '→', parseInt(formData.percentage));
      
      if (assignment) {
        // EDIT MODE: Update the existing assignment
        await updateAssignment(assignment.id, assignmentData);
      } else {
        // CREATE MODE: Split multi-month assignments into one entry per month
        // Example: Jan 15 - Mar 20 becomes 3 separate entries (Jan, Feb, Mar)
        console.log('➕ Create mode');
        const entries = splitAssignmentByMonth(assignmentData);

        // Create each entry separately
        for (const entry of entries) {
          await addAssignment(entry);
        }
      }
      
      console.log('✅ Assignment saved successfully');
      onClose();
    } catch (error) {
      console.error('❌ Save error:', error);
      setErrors({ submit: error.message || 'Failed to save assignment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get client name for selected project
  const getClientName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return '';
    const client = clients.find(c => c.id === project.client_id);
    return client ? client.name : '';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>{assignment ? 'Edit Assignment' : 'Add Assignment'}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}
            
            {people.length === 0 && (
              <div className="warning-message">
                ⚠️ No team members available. Please add people first.
              </div>
            )}
            
            {projects.length === 0 && (
              <div className="warning-message">
                ⚠️ No projects available. Please add projects first.
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="person_id">
                  Team Member <span className="required">*</span>
                </label>
                <select
                  id="person_id"
                  name="person_id"
                  value={formData.person_id}
                  onChange={handleChange}
                  className={errors.person_id ? 'error' : ''}
                  disabled={people.length === 0}
                >
                  <option value="">Select a person</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.role})
                    </option>
                  ))}
                </select>
                {errors.person_id && (
                  <span className="field-error">{errors.person_id}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="project_id">
                  Project <span className="required">*</span>
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  className={errors.project_id ? 'error' : ''}
                  disabled={projects.length === 0}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {getClientName(project.id)}
                    </option>
                  ))}
                </select>
                {errors.project_id && (
                  <span className="field-error">{errors.project_id}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={errors.start_date ? 'error' : ''}
                />
                {errors.start_date && (
                  <span className="field-error">{errors.start_date}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="end_date">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={errors.end_date ? 'error' : ''}
                  min={formData.start_date}
                />
                {errors.end_date && (
                  <span className="field-error">{errors.end_date}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="percentage">
                Allocation Percentage <span className="required">*</span>
              </label>
              <div className="percentage-input-simple">
                <input
                  type="number"
                  id="percentage"
                  name="percentage"
                  min="1"
                  max="100"
                  value={formData.percentage}
                  onChange={handleChange}
                  className={`percentage-number ${errors.percentage ? 'error' : ''}`}
                  placeholder="e.g., 80"
                />
                <span className="percentage-label">%</span>
              </div>
              {errors.percentage && (
                <span className="field-error">{errors.percentage}</span>
              )}
              {warnings.percentage && (
                <span className="field-warning">{warnings.percentage}</span>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="button button-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button button-primary"
              disabled={isSubmitting || people.length === 0 || projects.length === 0}
            >
              {isSubmitting ? 'Saving...' : (assignment ? 'Update' : 'Add Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
