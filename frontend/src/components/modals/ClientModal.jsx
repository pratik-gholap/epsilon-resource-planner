import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * ClientModal - Modal for adding or editing clients
 * Props:
 *   isOpen: boolean - whether modal is visible
 *   onClose: function - callback to close modal
 *   client: object - client to edit (null for new client)
 */
export default function ClientModal({ isOpen, onClose, client = null }) {
  const { addClient, updateClient } = useApp();
  
  const [formData, setFormData] = useState({
    name: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Editing existing client
        setFormData({
          name: client.name || ''
        });
      } else {
        // Adding new client
        setFormData({
          name: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, client]);

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
      newErrors.name = 'Client name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const clientData = {
        name: formData.name.trim()
      };
      
      if (client) {
        // Update existing client
        await updateClient(client.id, clientData);
      } else {
        // Add new client
        await addClient(clientData);
      }
      
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save client' });
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
          <h2>{client ? 'Edit Client' : 'Add Client'}</h2>
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
                Client Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter client name"
                autoFocus
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
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
              {isSubmitting ? 'Saving...' : (client ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
