import React, { useState, useEffect } from 'react';
import { Dish, Restaurant } from '../types';
import { DishFormData, DishFormInput } from '../types/dishFormTypes';
import { restaurantsService } from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';
import RestaurantSearchSelect from './ui/RestaurantSearchSelect';
import { getImageWithFallback } from '../utils/imageUtils';
import '../styles/custom-inputs.css';

interface DishFormProps {
  dish?: Dish | null;
  onSubmit: (dishData: DishFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Los tipos ahora están importados desde dishFormTypes.ts

const DishForm: React.FC<DishFormProps> = ({
  dish,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<DishFormInput>({
    name: '',
    description: '',
    price: '', // Iniciar con string vacío
    image: '',
    restaurant: {
      id: 0,
    },
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description || '',
        price: dish.price, // Mantener como número cuando viene de dish existente
        image: dish.image || '',
        restaurant: {
          id: dish.restaurant?.id || 0,
        },
      });
    }
  }, [dish]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantsService.getAll();
      // Filtrar solo restaurantes activos
      setRestaurants(data.filter(r => r.active));
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones alineadas con el backend
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre debe tener menos de 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción debe tener menos de 500 caracteres';
    }

    const priceNum = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    if (!formData.price || formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0.00';
    } else if (priceNum > 999999.99) {
      newErrors.price = 'El precio debe ser menor a 999,999.99';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.toString())) {
      newErrors.price = 'El precio debe tener máximo 2 decimales';
    }

    if (formData.restaurant.id === 0) {
      newErrors.restaurant = 'Selecciona un restaurante';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos según DTOs del backend
      const priceValue = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
      
      // Validación adicional antes del submit
      if (isNaN(priceValue) || priceValue <= 0) {
        console.error('Invalid price value:', priceValue);
        return;
      }
      
      // Asegurar que el precio tenga máximo 2 decimales
      const roundedPrice = Math.round(priceValue * 100) / 100;
      
      const submitData: DishFormData = {
        name: formData.name.trim(),
        price: roundedPrice,
        restaurant: {
          id: formData.restaurant.id,
        },
      };

      // Solo incluir campos opcionales si tienen valor
      if (formData.description && formData.description.trim()) {
        submitData.description = formData.description.trim();
      }

      if (formData.image && formData.image.trim()) {
        submitData.image = formData.image.trim();
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof DishFormInput | 'restaurantId', value: string | number | boolean) => {
    if (field === 'restaurantId') {
      setFormData(prev => ({
        ...prev,
        restaurant: { id: Number(value) }
      }));
    } else if (field === 'restaurant') {
      // No hacer nada, se maneja con restaurantId
      return;
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpiar error cuando el usuario corrige el campo
    const errorField = field === 'restaurantId' ? 'restaurant' : field;
    if (errors[errorField]) {
      setErrors(prev => ({
        ...prev,
        [errorField]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del plato */}
      <div>
        <Input
          label="Nombre del plato"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Ej: Pizza Margherita"
          required
          maxLength={100}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2">
          Descripción <span className="text-neutral-500 font-normal">(opcional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          maxLength={500}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none ${
            errors.description 
              ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' 
              : 'border-neutral-200'
          }`}
          placeholder="Describe el plato..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-sm text-danger-600">{errors.description}</p>
          ) : (
            <span></span>
          )}
          <span className="text-xs text-neutral-400">
            {formData.description?.length || 0}/500
          </span>
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2">
          Precio <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.price}
          onChange={(e) => {
            const value = e.target.value;
            // Permitir números decimales con hasta 2 decimales
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
              handleChange('price', value);
            }
          }}
          className={`no-spinner w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white ${
            errors.price 
              ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' 
              : 'border-neutral-200'
          }`}
          placeholder="Ej: 25.50"
          required
        />
        {errors.price && (
          <p className="mt-1 text-sm text-danger-600">{errors.price}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Solo números decimales con máximo 2 decimales
        </p>
      </div>

      {/* URL de imagen */}
      <div>
        <Input
          label="URL de imagen"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Opcional: URL pública de la imagen del plato
        </p>
      </div>

      {/* Restaurante */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2">
          Restaurante <span className="text-danger-500">*</span>
        </label>
        {loadingRestaurants ? (
          <div className="flex items-center space-x-2 p-3 border border-neutral-200 rounded-xl bg-neutral-50">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="text-sm text-neutral-600">Cargando restaurantes...</span>
          </div>
        ) : (
          <RestaurantSearchSelect
            restaurants={restaurants}
            selectedRestaurantId={formData.restaurant.id}
            onChange={(restaurantId) => handleChange('restaurantId', restaurantId)}
            error={errors.restaurant}
            disabled={loadingRestaurants}
            placeholder="Escribe al menos 3 letras del restaurante..."
          />
        )}
        {restaurants.length === 0 && !loadingRestaurants && (
          <p className="mt-1 text-sm text-warning-600">
            No hay restaurantes activos disponibles
          </p>
        )}
      </div>

      {/* Vista previa de imagen */}
      {formData.image && formData.image.trim() && (
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Vista previa de imagen
          </label>
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
            <img
              src={getImageWithFallback('dishes', formData.image)}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA8.MjZMMTIgMloiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';
              }}
            />
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loadingRestaurants || restaurants.length === 0}
        >
          {dish ? 'Actualizar' : 'Crear'} Plato
        </Button>
      </div>
    </form>
  );
};

export default DishForm;