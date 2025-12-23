import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * PersonModal - Modal for adding or editing team members
 * Props:
 *   isOpen: boolean - whether modal is visible
 *   onClose: function - callback to close modal
 *   person: object - person to edit (null for new person)
 */
export default function PersonModal({ isOpen, onClose, person = null }) {
  const { addPerson, updatePerson } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    role: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or person changes
  useEffect(() => {
    if (isOpen) {
      if (person) {
        // Editing existing person
        setFormData({
          name: person.name || '',
          role: person.role || ''
        });
      } else {
        // Adding new person
        setFormData({
          name: '',
          role: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const personData = {
        name: formData.name.trim(),
        role: formData.role.trim()
      };
      
      if (person) {
        // Update existing person
        await updatePerson(person.id, personData);
      } else {
        // Add new person
        await addPerson(personData);
      }
      
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save person' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{person ? 'Edit Team Member' : 'Add Team Member'}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter name"
                autoFocus
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={errors.role ? 'error' : ''}
                placeholder="e.g., Developer, Designer, Manager"
              />
              {errors.role && (
                <span className="field-error">{errors.role}</span>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (person ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
