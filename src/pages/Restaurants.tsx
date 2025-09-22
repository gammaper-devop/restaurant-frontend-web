import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table, Modal, StatusBadge, ConfirmDialog, Toast } from '../components/ui';
import RestaurantForm from '../components/RestaurantForm';
import RestaurantDetailsModal from '../components/RestaurantDetailsModal';
import EditRestaurantModal from '../components/EditRestaurantModal';
import { useRestaurants, useCategories, useRestaurantMutations } from '../hooks';
import { restaurantsService } from '../services/api';
import type { Restaurant } from '../types';

const Restaurants: React.FC = () => {
  const { data: restaurants, loading, error, refetch } = useRestaurants();
  const { data: categoriesData } = useCategories();
  const { remove, loading: mutationLoading } = useRestaurantMutations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [restaurantToEdit, setRestaurantToEdit] = useState<Restaurant | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deletedRestaurantName, setDeletedRestaurantName] = useState('');

  // Ensure restaurants and categories are arrays before proceeding
  const validRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const validCategories = Array.isArray(categoriesData) ? categoriesData : [];

  // Filter to show only active restaurants
  const activeRestaurants = validRestaurants.filter(restaurant => restaurant.active);

  // Handle delete confirmation
  const handleDeleteClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteConfirmOpen(true);
  };

  // Handle confirmed deletion (cascade soft delete via backend)
  const handleConfirmedDelete = async () => {
    if (!restaurantToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Starting cascade soft delete for restaurant:', restaurantToDelete.id);
      
      // Store restaurant name for success message
      const restaurantName = restaurantToDelete.name;
      
      // The backend now handles all cascade soft delete logic
      // This will soft delete: restaurant, dishes, menus, and locations
      await restaurantsService.softDelete(restaurantToDelete.id);
      console.log('Cascade soft delete completed for restaurant:', restaurantName);
      
      // Close modal and reset states
      setDeleteConfirmOpen(false);
      setRestaurantToDelete(null);
      
      // Show success toast
      setDeletedRestaurantName(restaurantName);
      setShowSuccessToast(true);
      
      // Refresh the table
      await refetch();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      alert('Error al eliminar el restaurante. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setRestaurantToDelete(null);
  };

  // Handle close success toast
  const handleCloseToast = () => {
    setShowSuccessToast(false);
    setDeletedRestaurantName('');
  };

  // Handle view restaurant details
  const handleViewDetails = (restaurant: Restaurant) => {
    console.log('Opening details modal for restaurant:', restaurant);
    setSelectedRestaurant(restaurant);
    setIsDetailsModalOpen(true);
  };

  // Handle edit restaurant
  const handleEditRestaurant = (restaurant: Restaurant) => {
    console.log('Opening edit modal for restaurant:', restaurant);
    setRestaurantToEdit(restaurant);
    setIsEditModalOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setRestaurantToEdit(null);
    refetch(); // Refresh the restaurants list
  };

  // Handle edit modal close
  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setRestaurantToEdit(null);
  };

  // Show loading state
  if (loading) {
    return (
      <Layout 
        title="Restaurants" 
        subtitle="Manage your restaurant network and locations"
      >
        <div className="space-y-8">
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading restaurants...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout 
        title="Restaurants" 
        subtitle="Manage your restaurant network and locations"
      >
        <div className="text-center py-8">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-danger-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-danger-900 mb-2">Error Loading Restaurants</h3>
            <p className="text-danger-700 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Restaurant Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500">{row.phone || 'No phone'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: any) => {
        const categoryName = value?.name || 'Unknown';
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
            {categoryName}
          </span>
        );
      },
    },
    {
      key: 'locations',
      label: 'Locations',
      render: (value: any, row: any) => {
        const locations = Array.isArray(value) ? value : [];
        const locationCount = locations.length;

        if (locationCount === 0) {
          return (
            <span className="text-neutral-500 italic">No locations</span>
          );
        }

        // Show first location address and count if multiple
        const firstLocation = locations[0];
        const address = firstLocation?.address || 'Unknown address';

        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-neutral-700 truncate max-w-48" title={address}>
                {address}
              </span>
            </div>
            {locationCount > 1 && (
              <span className="text-xs text-neutral-500">
                +{locationCount - 1} more location{locationCount > 2 ? 's' : ''}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
            disabled={mutationLoading || isDeleting}
            title="Ver detalles"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRestaurant(row)}
            disabled={mutationLoading || isDeleting}
            title="Editar"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            disabled={mutationLoading || isDeleting}
            title="Eliminar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <Layout 
      title="Restaurants" 
      subtitle="Manage your restaurant network and locations"
    >
      <div className="space-y-8">
        {/* Actions Bar */}
        <Card variant="elevated" className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-neutral-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="bg-transparent border-0 outline-none text-sm placeholder-neutral-500"
                />
              </div>
              <select className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Categories</option>
                {validCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Restaurant
              </Button>
            </div>
          </div>
        </Card>

        {/* Restaurants Table */}
        <Table
          columns={columns}
          data={activeRestaurants}
          variant="striped"
          emptyMessage="No hay restaurantes activos. Crea tu primer restaurante para comenzar."
        />

        {/* Create Restaurant Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Restaurant"
          size="lg"
        >
          <RestaurantForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refetch(); // Refresh the restaurants list
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Restaurant Details Modal */}
        <RestaurantDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedRestaurant(null);
          }}
          restaurant={selectedRestaurant}
        />

        {/* Edit Restaurant Modal */}
        <EditRestaurantModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          restaurant={restaurantToEdit}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmedDelete}
          title="Eliminar Restaurante"
          message={`¿Estás seguro de que deseas eliminar "${restaurantToDelete?.name}"? Esta acción desactivará el restaurante y TODAS sus entidades relacionadas (platos, menús y ubicaciones).`}
          confirmText="Sí, Eliminar"
          cancelText="No, Cancelar"
          type="danger"
          loading={isDeleting}
        />

        {/* Success Toast */}
        <Toast
          message={`Se eliminó correctamente el restaurante "${deletedRestaurantName}"`}
          type="success"
          duration={7000}
          isVisible={showSuccessToast}
          onClose={handleCloseToast}
        />
      </div>
    </Layout>
  );
};

export default Restaurants;
