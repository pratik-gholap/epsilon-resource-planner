import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * ProjectModal - Modal for adding or editing projects
 * Props:
 *   isOpen: boolean - whether modal is visible
 *   onClose: function - callback to close modal
 *   project: object - project to edit (null for new project)
 */
export default function ProjectModal({ isOpen, onClose, project = null }) {
  const { clients, addProject, updateProject } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    client_id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project
        setFormData({
          name: project.name || '',
          client_id: project.client_id || ''
        });
      } else {
        // Adding new project
        setFormData({
          name: '',
          client_id: clients.length > 0 ? clients[0].id : ''
        });
      }
      setErrors({});
    }
  }, [isOpen, project, clients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'client_id' ? parseInt(value, 10) : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name.trim(),
        client_id: formData.client_id
      };
      
      if (project) {
        // Update existing project
        await updateProject(project.id, projectData);
      } else {
        // Add new project
        await addProject(projectData);
      }
      
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save project' });
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
          <h2>{project ? 'Edit Project' : 'Add Project'}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}
            
            {clients.length === 0 && (
              <div className="warning-message">
                ⚠️ No clients available. Please add a client first.
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">
                Project Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter project name"
                autoFocus
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="client_id">
                Client <span className="required">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className={errors.client_id ? 'error' : ''}
                disabled={clients.length === 0}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <span className="field-error">{errors.client_id}</span>
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
              disabled={isSubmitting || clients.length === 0}
            >
              {isSubmitting ? 'Saving...' : (project ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
