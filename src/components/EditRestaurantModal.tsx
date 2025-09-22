import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Toast } from './ui';
import { useCategories } from '../hooks';
import { restaurantsService } from '../services/api';
import type { Restaurant } from '../types';

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onSuccess: () => void;
}


const EditRestaurantModal: React.FC<EditRestaurantModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onSuccess,
}) => {
  // Restaurant form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    logo: '',
    category_id: '',
    active: true,
  });

  // Loading and UI states
  const [loading, setLoading] = useState(false);
  const { data: categories } = useCategories();
  
  // Success toast
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form when restaurant changes
  useEffect(() => {
    if (restaurant && isOpen) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        logo: restaurant.logo || '',
        category_id: restaurant.category?.id?.toString() || '',
        active: restaurant.active ?? true,
      });
    }
  }, [restaurant, isOpen]);


  // Handle form input changes
  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;

    setLoading(true);
    try {
      // Update restaurant basic info
      const updatedRestaurant = await restaurantsService.update(restaurant.id, {
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        logo: formData.logo,
        category_id: parseInt(formData.category_id),
        active: formData.active,
      });

      setSuccessMessage(`Restaurante "${updatedRestaurant.name}" actualizado correctamente`);
      setShowSuccessToast(true);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Error al actualizar el restaurante. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  // Handle modal close
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      logo: '',
      category_id: '',
      active: true,
    });
    onClose();
  };

  // Handle close success toast
  const handleCloseSuccessToast = () => {
    setShowSuccessToast(false);
    setSuccessMessage('');
  };

  const validCategories = Array.isArray(categories) ? categories : [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Editar Restaurante: ${restaurant?.name || ''}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Restaurante"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Ej: La Trattoria"
              />
              
              <Select
                label="Categoría"
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {validCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu restaurante..."
                rows={3}
                className="w-full px-4 py-3 border border-neutral-300 focus:border-primary-500 bg-neutral-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>

            <Input
              label="Logo URL"
              type="url"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              placeholder="Ej: https://example.com/logo.png"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ej: +51 999 888 777"
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ej: contacto@restaurante.com"
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center space-x-3">
              <input
                id="active"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="active" className="block text-sm font-medium text-neutral-700">
                Restaurante Activo
              </label>
            </div>
          </div>


          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Actualizar Restaurante
            </Button>
          </div>
        </form>
      </Modal>


      {/* Success Toast */}
      <Toast
        message={successMessage}
        type="success"
        duration={5000}
        isVisible={showSuccessToast}
        onClose={handleCloseSuccessToast}
      />
    </>
  );
};

export default EditRestaurantModal;