import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Toast, ConfirmDialog } from './ui';
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
  // Restaurant form state - alineado con nueva estructura
  const [formData, setFormData] = useState({
    name: '',
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
  
  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Initialize form when restaurant changes
  useEffect(() => {
    if (restaurant && isOpen) {
      console.log('Inicializando formulario con restaurant:', {
        id: restaurant.id,
        name: restaurant.name,
        active: restaurant.active,
        category: restaurant.category
      });
      
      setFormData({
        name: restaurant.name || '',
        logo: restaurant.logo || '',
        category_id: restaurant.category?.id?.toString() || '',
        active: restaurant.active ?? true,
      });
    }
  }, [restaurant, isOpen]);


  // Handle form input changes
  const handleInputChange = (name: string, value: string | boolean) => {
    console.log('Cambiando campo:', name, 'a valor:', value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle form submission - mostrar confirmación primero
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;

    // Preparar datos para actualizar
    const updateData: any = {
      name: formData.name.trim(),
      logo: formData.logo.trim() || undefined,
      active: formData.active, // ¡IMPORTANTE: Incluir campo active!
    };
    
    console.log('Datos a enviar al backend:', updateData);
    console.log('Estado actual del formulario:', formData);
    
    if (formData.category_id) {
      updateData.category = { id: parseInt(formData.category_id) };
    }
    
    // Mostrar diálogo de confirmación
    setPendingFormData(updateData);
    setShowConfirmDialog(true);
  };

  // Ejecutar actualización después de confirmación
  const handleConfirmUpdate = async () => {
    if (!restaurant || !pendingFormData) return;

    setLoading(true);
    setShowConfirmDialog(false);
    
    try {
      const updatedRestaurant = await restaurantsService.update(restaurant.id, pendingFormData);
      
      // Cerrar modal primero
      onClose();
      onSuccess();
      
      // Mostrar toast después de un breve delay
      setTimeout(() => {
        setSuccessMessage(`Restaurante "${updatedRestaurant?.name || formData.name}" actualizado correctamente`);
        setShowSuccessToast(true);
      }, 300);
      
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Error al actualizar el restaurante. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setPendingFormData(null);
    }
  };
  
  // Cancelar actualización
  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingFormData(null);
  };


  // Handle modal close
  const handleClose = () => {
    setFormData({
      name: '',
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

            {/* Description field removed - no existe en backend */}

            <Input
              label="Logo URL"
              type="url"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              placeholder="Ej: https://example.com/logo.png"
            />
            
            {/* Phone y Email fields removed - ahora están en RestaurantLocation */}

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


      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        title="Confirmar Actualización"
        message={`¿Estás seguro de que deseas actualizar la información del restaurante "${restaurant?.name}"?`}
        confirmText="Sí, Actualizar"
        cancelText="Cancelar"
        type="warning"
        loading={loading}
      />

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