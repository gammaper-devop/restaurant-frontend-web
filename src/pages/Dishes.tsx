import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DishForm from '../components/DishForm';
import DishDetailsModal from '../components/DishDetailsModal';
import { Dish, Restaurant } from '../types';
import { DishFormData } from '../types/dishFormTypes';
import { dishesService, restaurantsService } from '../services/api';
import { getImageWithFallback } from '../utils/imageUtils';

// El tipo DishFormData ahora se importa desde dishFormTypes.ts

const Dishes: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<number>(0);
  const [showInactive, setShowInactive] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Sorting
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dishesData, restaurantsData] = await Promise.all([
        dishesService.getAll(),
        restaurantsService.getAll()
      ]);
      
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setDishes([]);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y búsqueda
  const filteredDishes = dishes.filter(dish => {
    // Filtro por búsqueda
    const matchesSearch = !searchTerm || 
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por restaurante
    const matchesRestaurant = selectedRestaurant === 0 || dish.restaurant?.id === selectedRestaurant;
    
    // Filtro por estado activo
    const matchesActive = showInactive || dish.active;
    
    // Filtro por rango de precios
    const minPriceNum = parseFloat(minPrice) || 0;
    const maxPriceNum = parseFloat(maxPrice) || Infinity;
    const matchesPrice = dish.price >= minPriceNum && dish.price <= maxPriceNum;
    
    return matchesSearch && matchesRestaurant && matchesActive && matchesPrice;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'restaurant':
        aValue = a.restaurant?.name.toLowerCase() || '';
        bValue = b.restaurant?.name.toLowerCase() || '';
        break;
      case 'active':
        aValue = a.active ? 1 : 0;
        bValue = b.active ? 1 : 0;
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const handleCreate = async (dishData: DishFormData) => {
    try {
      setFormLoading(true);
      await dishesService.create(dishData);
      setIsCreateModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error creating dish:', error);
      // El error se maneja en el interceptor de axios
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (dishData: DishFormData) => {
    if (!selectedDish) return;
    
    try {
      setFormLoading(true);
      await dishesService.update(selectedDish.id, dishData);
      setIsEditModalOpen(false);
      setSelectedDish(null);
      await loadData();
    } catch (error) {
      console.error('Error updating dish:', error);
      // El error se maneja en el interceptor de axios
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDish) return;
    
    try {
      await dishesService.softDelete(selectedDish.id);
      setIsDeleteDialogOpen(false);
      setSelectedDish(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting dish:', error);
      // El error se maneja en el interceptor de axios
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const columns = [
    {
      key: 'image',
      label: '',
      className: 'w-16',
      render: (_value: string, dish: Dish) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
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
      )
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value: string, dish: Dish) => (
        <div className={`${!dish.active ? 'opacity-60' : ''}`}>
          <div className="font-semibold text-neutral-900">
            {!dish.active && <span className="line-through">{value}</span>}
            {dish.active && value}
          </div>
          {dish.description && (
            <div className="text-sm text-neutral-600 truncate max-w-xs" title={dish.description}>
              {dish.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      sortable: true,
      render: (value: number, dish: Dish) => (
        <span className={`font-semibold ${!dish.active ? 'opacity-60' : 'text-primary-600'}`}>
          {formatPrice(value)}
        </span>
      )
    },
    {
      key: 'restaurant',
      label: 'Restaurante',
      sortable: true,
      render: (_value: unknown, dish: Dish) => (
        <div className={!dish.active ? 'opacity-60' : ''}>
          <div className="font-medium text-neutral-900">{dish.restaurant?.name}</div>
          <div className="text-sm text-neutral-600">{dish.restaurant?.category?.name}</div>
        </div>
      )
    },
    {
      key: 'active',
      label: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <Badge
          variant={value ? 'success' : 'secondary'}
          size="sm"
        >
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'w-32',
      render: (_value: unknown, dish: Dish) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDish(dish);
              setIsDetailsModalOpen(true);
            }}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDish(dish);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDish(dish);
              setIsDeleteDialogOpen(true);
            }}
            className="text-danger-600 hover:text-danger-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      )
    }
  ];

  const activeDishesCount = dishes.filter(dish => dish.active).length;

  return (
    <Layout title="Platos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 font-display">Gestión de Platos</h1>
            <p className="text-neutral-600 mt-2">Administra los platos de tus restaurantes</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 md:mt-0"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Plato
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
            <div className="text-2xl font-bold text-neutral-900">{dishes.length}</div>
            <div className="text-sm text-neutral-600">Total de Platos</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
            <div className="text-2xl font-bold text-success-600">{activeDishesCount}</div>
            <div className="text-sm text-neutral-600">Platos Activos</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
            <div className="text-2xl font-bold text-neutral-500">{dishes.length - activeDishesCount}</div>
            <div className="text-sm text-neutral-600">Platos Inactivos</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
            <div className="text-2xl font-bold text-primary-600">{filteredDishes.length}</div>
            <div className="text-sm text-neutral-600">Resultados Filtrados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-soft">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filtros y Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Buscar por nombre, descripción o restaurante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Restaurante */}
            <div>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
              >
                <option value={0}>Todos los restaurantes</option>
                {restaurants.filter(r => r.active).map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Rango de precios */}
            <div>
              <Input
                type="number"
                placeholder="Precio mín."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Input
                type="number"
                placeholder="Precio máx."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="text-sm font-medium text-neutral-700">
                Mostrar platos inactivos
              </span>
            </label>
            
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setSelectedRestaurant(0);
                setMinPrice('');
                setMaxPrice('');
                setShowInactive(false);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredDishes}
          loading={loading}
          emptyMessage="No se encontraron platos"
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Plato"
        size="lg"
      >
        <DishForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDish(null);
        }}
        title="Editar Plato"
        size="lg"
      >
        <DishForm
          dish={selectedDish}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedDish(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDish(null);
        }}
        onEdit={(dish) => {
          setIsDetailsModalOpen(false);
          setSelectedDish(dish);
          setIsEditModalOpen(true);
        }}
        onDelete={(dish) => {
          setIsDetailsModalOpen(false);
          setSelectedDish(dish);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDish(null);
        }}
        onConfirm={handleDelete}
        title={selectedDish?.active ? 'Desactivar Plato' : 'Eliminar Plato'}
        message={
          selectedDish?.active
            ? `¿Estás seguro de que deseas desactivar el plato "${selectedDish?.name}"? El plato dejará de estar disponible en el menú.`
            : `¿Estás seguro de que deseas eliminar permanentemente el plato "${selectedDish?.name}"? Esta acción no se puede deshacer.`
        }
        confirmText={selectedDish?.active ? 'Desactivar' : 'Eliminar'}
        type="danger"
      />
    </Layout>
  );
};

export default Dishes;
