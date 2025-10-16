import React from 'react';
import { Dish } from '../types';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { getImageWithFallback } from '../utils/imageUtils';

interface DishDetailsModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (dish: Dish) => void;
  onDelete?: (dish: Dish) => void;
  showActions?: boolean;
}

const DishDetailsModal: React.FC<DishDetailsModalProps> = ({
  dish,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  if (!dish) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Plato"
      size="lg"
    >
      <div className="space-y-6">
        {/* Imagen y información básica */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={getImageWithFallback('dishes', dish.image)}
                alt={dish.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEiIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAxMi44MjggMEwxNiAxNm0tMi0ybDEuNTg2LTEuNTg2YTIgMiAwIDAxMi44MjggMEwyMCAxNG0tNi02aC4wMU02IDIwaDEyYTIgMiAwIDAwMi0yVjZhMiAyIDAgMDAtMi0ySDZhMiAyIDAgMDAtMiAydjEyYTIgMiAwIDAwMiAyeiIgc3Ryb2tlPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                }}
              />
            </div>
          </div>

          {/* Información básica */}
          <div className="flex-grow space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-2xl font-bold text-neutral-900 font-display">
                  {dish.name}
                </h3>
                <Badge
                  variant={dish.active ? 'success' : 'secondary'}
                  size="sm"
                >
                  {dish.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              
              <div className="text-3xl font-bold text-primary-600 mb-3">
                {formatPrice(dish.price)}
              </div>

              {dish.description && (
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Descripción</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información del restaurante */}
        <div className="border-t border-neutral-100 pt-6">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Restaurante</h4>
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-neutral-900">{dish.restaurant?.name}</h5>
                <p className="text-sm text-neutral-600">
                  {dish.restaurant?.category?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadatos */}
        <div className="border-t border-neutral-100 pt-6">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Información del sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">ID:</span>
              <span className="ml-2 font-mono text-neutral-900">#{dish.id}</span>
            </div>
            <div>
              <span className="text-neutral-500">Estado:</span>
              <span className={`ml-2 font-medium ${dish.active ? 'text-success-600' : 'text-neutral-500'}`}>
                {dish.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Creado:</span>
              <span className="ml-2 text-neutral-900">{formatDate(dish.created_at)}</span>
            </div>
            <div>
              <span className="text-neutral-500">Actualizado:</span>
              <span className="ml-2 text-neutral-900">{formatDate(dish.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-100">
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(dish)}
                className="text-danger-600 border-danger-200 hover:bg-danger-50 hover:border-danger-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {dish.active ? 'Desactivar' : 'Eliminar'}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                onClick={() => onEdit(dish)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DishDetailsModal;