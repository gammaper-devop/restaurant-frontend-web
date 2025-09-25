import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table, Modal, Input, Select, SearchableSelect, ConfirmDialog, Toast } from '../components/ui';
import { restaurantLocationsService, restaurantsService, locationsService } from '../services/api';
import { OperatingHoursManager, OpenStatusIndicator } from '../components/operating-hours';
import { OperatingHoursUtils } from '../utils';
import { useCountries, useCitiesByCountry, useProvincesByCity, useDistrictsByProvince } from '../hooks';
import type { RestaurantLocation, Restaurant, District, Country, City, Province, OperatingHours } from '../types';

// Formulario alineado con nueva estructura del backend
interface LocationFormData {
  id?: number;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  // Jerarquía geográfica completa
  countryId: number;
  cityId: number;
  provinceId: number;
  districtId: number;
  restaurantId: number;
  operatingHours?: OperatingHours;
  isNew?: boolean;
}

// Helper function to create fallback geographic hierarchy
const createFallbackGeographicHierarchy = (location: RestaurantLocation): any | null => {
  // Strategy 1: Try to use district info if available
  if (location?.district && location.district.id && location.district.id > 0) {
    const fallback = {
      id: location.district.id,
      name: location.district.name || `Distrito ${location.district.id}`,
      province: {
        id: location.district.province?.id || 0,
        name: location.district.province?.name || 'Provincia Desconocida',
        city: {
          id: location.district.province?.city?.id || 0,
          name: location.district.province?.city?.name || 'Ciudad Desconocida',
          country: {
            id: location.district.province?.city?.country?.id || 0,
            name: location.district.province?.city?.country?.name || 'País Desconocido'
          }
        }
      }
    };
    
    return fallback;
  }
  
  // Strategy 2: Check if there's a districtId field directly (some APIs might structure it differently)
  if (location && (location as any).districtId) {
    const fallback = {
      id: (location as any).districtId,
      name: `Distrito ${(location as any).districtId}`,
      province: {
        id: (location as any).provinceId || 0,
        name: 'Provincia Desconocida',
        city: {
          id: (location as any).cityId || 0,
          name: 'Ciudad Desconocida',
          country: {
            id: (location as any).countryId || 0,
            name: 'País Desconocido'
          }
        }
      }
    };
    
    return fallback;
  }
  
  return null;
};

const RestaurantLocations: React.FC = () => {
  // State for restaurants and selected restaurant
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsWithLocationCount, setRestaurantsWithLocationCount] = useState<Array<Restaurant & { locationCount: number }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  
  // Loading states
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<RestaurantLocation | null>(null);

  // Form state
  const [formData, setFormData] = useState<LocationFormData>({
    restaurantId: 0,
    address: '',
    phone: '',
    latitude: 0,
    longitude: 0,
    countryId: 0,
    cityId: 0,
    provinceId: 0,
    districtId: 0,
    operatingHours: OperatingHoursUtils.getDefaultOperatingHours(),
    isNew: true,
  });


  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<RestaurantLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success/Error messages
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filter state
  const [showInactiveLocations, setShowInactiveLocations] = useState(false);

  // Load restaurants on component mount
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Load locations when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      loadRestaurantLocations(selectedRestaurant.id);
    } else {
      setLocations([]);
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const restaurantsData = await restaurantsService.getAll();

      const activeRestaurants = Array.isArray(restaurantsData) 
        ? restaurantsData.filter(r => r.active) 
        : [];
      
      setRestaurants(activeRestaurants);
      
      // Use the locations that already come in the restaurant response
      const restaurantsWithCounts = activeRestaurants.map((restaurant) => {
        // The locations are already included in the restaurant object
        const locationCount = Array.isArray(restaurant.locations) ? restaurant.locations.length : 0;
        return { ...restaurant, locationCount };
      });
      
      setRestaurantsWithLocationCount(restaurantsWithCounts);
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Error loading restaurants. Please try again.');
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const loadRestaurantLocations = async (restaurantId: number) => {
    setLocationsLoading(true);
    try {
      // First, check if we already have the locations from the restaurant data
      const restaurantWithLocations = restaurants.find(r => r.id === restaurantId);
      if (restaurantWithLocations?.locations && restaurantWithLocations.locations.length > 0) {
        setLocations(restaurantWithLocations.locations);
        setLocationsLoading(false);
        return;
      }
      
      // If not found in cache, fetch from API
      const locationsData = await restaurantLocationsService.getByRestaurant(restaurantId);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (err) {
      console.error('Error loading restaurant locations:', err);
      setError('Error loading locations. Please try again.');
    } finally {
      setLocationsLoading(false);
    }
  };

  // Function to force refresh from server (bypassing cache)
  const forceRefreshRestaurantLocations = async (restaurantId: number) => {
    setLocationsLoading(true);
    try {
      const locationsData = await restaurantLocationsService.getByRestaurant(restaurantId);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (err) {
      console.error('Error force refreshing restaurant locations:', err);
      setError('Error loading locations. Please try again.');
    } finally {
      setLocationsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string | number | OperatingHours) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Load dependent geographic data
    // La nueva estructura usa solo district - simplificamos la lógica geográfica
    // El backend maneja la jerarquía geográfica a través de la relación District
  };

  // Handle operating hours change
  const handleOperatingHoursChange = (hours: OperatingHours) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: hours,
    }));
  };

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id.toString() === restaurantId);
    setSelectedRestaurant(restaurant || null);
    setError(null); // Clear any previous errors
  };


  // Handle create new location
  const handleCreateLocation = () => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant first');
      return;
    }
    
    setFormData({
      restaurantId: selectedRestaurant.id,
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      countryId: 0,
      cityId: 0,
      provinceId: 0,
      districtId: 0,
      operatingHours: OperatingHoursUtils.getDefaultOperatingHours(),
      isNew: true,
    });
    setIsCreateModalOpen(true);
  };

  // Handle edit location
  const handleEditLocation = async (location: RestaurantLocation) => {
    try {
      setLocationToEdit(location);
      
      // Check if we have minimum required data (district, province, city)
      if (!location.district?.province?.city) {
        alert('Error: Esta ubicación no tiene datos geográficos mínimos (distrito/provincia/ciudad). Contacte al administrador.');
        return;
      }
      
      // Check if we have restaurant data
      if (!location.restaurant && !selectedRestaurant) {
        alert('Error: No se puede determinar el restaurante para esta ubicación. Seleccione un restaurante e inténtelo de nuevo.');
        return;
      }
      
      // Use restaurant from location or fallback to selectedRestaurant
      const restaurantId = location.restaurant?.id || selectedRestaurant?.id;
      if (!restaurantId) {
        alert('Error: No se puede determinar el ID del restaurante.');
        return;
      }
      
      setFormData({
        id: location.id,
        restaurantId: restaurantId,
        address: location.address,
        phone: location.phone || '',
        latitude: location.latitude,
        longitude: location.longitude,
        // Use available geographic data (country defaults to 0 if missing)
        countryId: location.district.province.city.country?.id || 0,
        cityId: location.district.province.city.id,
        provinceId: location.district.province.id,
        districtId: location.district.id,
        operatingHours: location.operatingHours || OperatingHoursUtils.getDefaultOperatingHours(),
        isNew: false,
      });
      
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error setting up location edit:', error);
      alert('Error al cargar la información de la ubicación. Por favor, inténtalo de nuevo.');
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation - Check if this is a basic edit mode (incomplete geographic data)
    const isBasicEditMode = !formData.isNew && 
      (formData.countryId === 0 || formData.cityId === 0 || formData.provinceId === 0 || formData.districtId === 0);
    
    if (!formData.restaurantId) {
      alert('Por favor, selecciona un restaurante');
      return;
    }
    if (!formData.address?.trim()) {
      alert('Por favor, ingresa una dirección válida');
      return;
    }
    
    // Only validate geographic hierarchy for new locations or complete existing ones
    if (!isBasicEditMode) {
      if (!formData.countryId) {
        alert('Por favor, selecciona un país');
        return;
      }
      if (!formData.cityId) {
        alert('Por favor, selecciona una ciudad');
        return;
      }
      if (!formData.provinceId) {
        alert('Por favor, selecciona una provincia');
        return;
      }
      if (!formData.districtId) {
        alert('Por favor, selecciona un distrito');
        return;
      }
    }
    
    if (formData.latitude === undefined || formData.longitude === undefined || formData.latitude === 0 || formData.longitude === 0) {
      alert('Por favor, ingresa coordenadas de ubicación válidas (latitud y longitud)');
      return;
    }
    if (!formData.operatingHours) {
      alert('Por favor, configura los horarios de operación');
      return;
    }

    setFormLoading(true);
    try {

      // Prepare location data based on edit mode
      let locationData: any;
      
      if (isBasicEditMode) {
        // For basic edit mode, only send basic fields (don't change district)
        locationData = {
          address: formData.address.trim(),
          phone: formData.phone?.trim() || null,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          operatingHours: formData.operatingHours,
        };
      } else {
        // Full location data for new locations or complete updates
        locationData = {
          restaurant: formData.restaurantId,
          address: formData.address.trim(),
          phone: formData.phone?.trim() || null,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          district: formData.districtId,
          operatingHours: formData.operatingHours,
        };
      }

      if (formData.isNew) {
        // Create new location - always requires full data
        const result = await restaurantLocationsService.create(locationData);
        
        // Force refresh locations after creation (bypass cache)
        if (selectedRestaurant) {
          await forceRefreshRestaurantLocations(selectedRestaurant.id);
        }
        
        setSuccessMessage('Ubicación creada exitosamente');
        setIsCreateModalOpen(false);
      } else {
        // Update existing location - may be basic or full update
        const result = await restaurantLocationsService.update(formData.id!, locationData);
        
        // Update local state with the fresh data from backend
        setLocations(prevLocations => 
          prevLocations.map(loc => 
            loc.id === formData.id ? result : loc
          )
        );
        
        // Force refresh from server to get latest data (bypass cache)
        if (selectedRestaurant) {
          await forceRefreshRestaurantLocations(selectedRestaurant.id);
        }
        
        if (isBasicEditMode) {
          setSuccessMessage('Ubicación actualizada exitosamente (edición básica)');
        } else {
          setSuccessMessage('Ubicación actualizada exitosamente');
        }
        
        setIsEditModalOpen(false);
        setLocationToEdit(null);
      }

      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Error saving location:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert(`Error al guardar la ubicación: ${errorMessage}. Por favor, inténtalo de nuevo.`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete location
  const handleDeleteLocation = (location: RestaurantLocation) => {
    setLocationToDelete(location);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmedDelete = async () => {
    if (!locationToDelete) return;

    setIsDeleting(true);
    try {
      // Use soft delete instead of permanent delete
      const updatedLocation = await restaurantLocationsService.softDelete(locationToDelete.id);
      
      // Update local state immediately with the result
      setLocations(prevLocations => 
        prevLocations.map(loc => 
          loc.id === locationToDelete.id 
            ? { ...loc, active: false }  // Mark as inactive locally
            : loc
        )
      );
      
      setSuccessMessage(`Ubicación "${locationToDelete.address}" desactivada exitosamente`);
      setShowSuccessToast(true);
      setDeleteConfirmOpen(false);
      setLocationToDelete(null);
      
      // Force refresh in the background to sync with server
      if (selectedRestaurant) {
        try {
          await forceRefreshRestaurantLocations(selectedRestaurant.id);
        } catch (refreshError) {
          console.warn('Failed to refresh locations from server, but local state updated:', refreshError);
        }
      }
    } catch (error: any) {
      console.error('Error soft deleting location:', error);
      
      // Check if it was a server error but the local fallback worked
      if (error?.message?.includes('soft delete failed on server')) {
        // The API returned a local fallback, update local state
        setLocations(prevLocations => 
          prevLocations.map(loc => 
            loc.id === locationToDelete.id 
              ? { ...loc, active: false }  // Mark as inactive locally
              : loc
          )
        );
        
        setSuccessMessage(`Ubicación "${locationToDelete.address}" desactivada localmente (problema con servidor)`);
        setShowSuccessToast(true);
        setDeleteConfirmOpen(false);
        setLocationToDelete(null);
      } else {
        // Real error, show error message
        const errorMessage = error?.message || 'Error desconocido';
        alert(`Error al desactivar la ubicación: ${errorMessage}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle close modals
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      restaurantId: 0,
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      countryId: 0,
      cityId: 0,
      provinceId: 0,
      districtId: 0,
      operatingHours: OperatingHoursUtils.getDefaultOperatingHours(),
      isNew: true,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setLocationToEdit(null);
  };

  // Filter locations based on active/inactive status
  const filteredLocations = locations.filter(location => {
    if (showInactiveLocations) {
      return true; // Show all locations (active and inactive)
    } else {
      return location.active !== false; // Show only active locations (active === true or undefined)
    }
  });

  // Table columns - removed restaurant column since we're showing locations for one restaurant

  const columns = [
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (value: string, row: RestaurantLocation) => (
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
            row.active === false 
              ? 'from-neutral-400 to-neutral-500' 
              : 'from-secondary-500 to-secondary-600'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className={`font-medium ${
                row.active === false 
                  ? 'text-neutral-500 line-through' 
                  : 'text-neutral-900'
              }`}>{value}</p>
              {row.active === false && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactiva
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <>
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{value}</span>
            </>
          ) : (
            <span className="text-neutral-400 text-sm">No phone</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: RestaurantLocation) => (
        <div className="space-y-2">
          <OpenStatusIndicator
            operatingHours={row.operatingHours || OperatingHoursUtils.getDefaultOperatingHours()}
            variant="minimal"
            size="sm"
            showNextChange={false}
          />
        </div>
      ),
    },
    {
      key: 'coordinates',
      label: 'Coordinates',
      render: (_: any, row: RestaurantLocation) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-neutral-600">Lat:</span>
            <span className="text-neutral-900">{row.latitude}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium text-neutral-600">Lng:</span>
            <span className="text-neutral-900">{row.longitude}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: RestaurantLocation) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditLocation(row)}
            title="Edit location"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteLocation(row)}
            title="Desactivar ubicación"
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

  // Show loading state for restaurants
  if (restaurantsLoading) {
    return (
      <Layout 
        title="Restaurant Locations" 
        subtitle="Manage locations for specific restaurants"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading restaurants...</span>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout 
        title="Restaurant Locations" 
        subtitle="Manage restaurant locations and addresses"
      >
        <Card className="p-8 text-center">
          <div className="text-danger-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Data</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button variant="primary" onClick={loadRestaurants}>
            Retry
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Restaurant Locations" 
      subtitle="Manage locations for specific restaurants"
    >
      <div className="space-y-8">
        {/* Restaurant Selector */}
        <Card variant="elevated" className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Select Restaurant</h3>
            <SearchableSelect
              value={selectedRestaurant?.id.toString() || ''}
              onChange={(value) => handleRestaurantSelect(value)}
              placeholder="Search restaurants by name..."
              minSearchLength={3}
              maxDisplayItems={15}
              loading={restaurantsLoading}
              className="max-w-lg"
              options={restaurantsWithLocationCount.map((restaurant) => ({
                value: restaurant.id.toString(),
                label: restaurant.name,
                subtitle: `${restaurant.locationCount} location${restaurant.locationCount !== 1 ? 's' : ''}`,
                icon: (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {restaurant.name.charAt(0)}
                  </div>
                ),
              }))}
            />
            <div className="text-sm text-neutral-600">
              <p>💡 <strong>Tip:</strong> Type at least 3 characters to search through {restaurantsWithLocationCount.length} restaurants</p>
            </div>
          </div>
        </Card>

        {/* Selected Restaurant Info & Actions */}
        {selectedRestaurant && (
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {selectedRestaurant.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{selectedRestaurant.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    {/* Phone y email ahora están en RestaurantLocation, no en Restaurant */}
                    <span className="text-neutral-500 text-sm">
                      Contacto disponible en ubicaciones individuales
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateLocation}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Location
              </Button>
            </div>
          </Card>
        )}

        {/* Locations Table */}
        {selectedRestaurant && (
          <Card variant="elevated" className="overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Locations for {selectedRestaurant.name}
                  </h3>
                  <div className="text-sm text-neutral-600">
                    ({filteredLocations.length} of {locations.length} locations)
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Filtro para mostrar ubicaciones inactivas */}
                  <label className="flex items-center space-x-2 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={showInactiveLocations}
                      onChange={(e) => setShowInactiveLocations(e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span>Show inactive locations</span>
                  </label>
                  {locationsLoading && (
                    <div className="flex items-center space-x-2 text-neutral-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-sm">Loading locations...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Table
              columns={columns}
              data={filteredLocations}
              variant="striped"
              emptyMessage={`No locations found for ${selectedRestaurant.name}. Add the first location to get started.`}
            />
          </Card>
        )}

        {/* No Restaurant Selected State */}
        {!selectedRestaurant && !restaurantsLoading && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Select a Restaurant</h3>
              <p className="text-neutral-600 mb-6">
                Choose a restaurant from the dropdown above to view and manage its locations.
              </p>
            </div>
          </Card>
        )}

        {/* Create Location Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          title="Add New Location"
          size="xl"
        >
          <LocationForm
            formData={formData}
            restaurants={restaurants}
            onInputChange={handleInputChange}
            onOperatingHoursChange={handleOperatingHoursChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseCreateModal}
            loading={formLoading}
          />
        </Modal>

        {/* Edit Location Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Location: ${locationToEdit?.address || ''}`}
          size="xl"
        >
          <LocationForm
            formData={formData}
            restaurants={restaurants}
            onInputChange={handleInputChange}
            onOperatingHoursChange={handleOperatingHoursChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseEditModal}
            loading={formLoading}
            isEdit
            isBasicEditMode={!formData.isNew && 
              (formData.countryId === 0 || formData.cityId === 0 || formData.provinceId === 0 || formData.districtId === 0)}
          />
        </Modal>

        {/* Soft Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setLocationToDelete(null);
          }}
          onConfirm={handleConfirmedDelete}
          title="Desactivar Ubicación"
          message={`¿Estás seguro de que deseas eliminar la ubicación "${locationToDelete?.address}"?.`}
          confirmText="Sí, Desactivar"
          cancelText="Cancelar"
          type="warning"
          loading={isDeleting}
        />

        {/* Success Toast */}
        <Toast
          message={successMessage}
          type="success"
          duration={5000}
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        />
      </div>
    </Layout>
  );
};

// Location Form Component
interface LocationFormProps {
  formData: LocationFormData;
  restaurants: Restaurant[];
  onInputChange: (name: string, value: string | number) => void;
  onOperatingHoursChange: (hours: OperatingHours) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
  isBasicEditMode?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  formData,
  onInputChange,
  onOperatingHoursChange,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
  isBasicEditMode = false,
}) => {
  // Hooks para jerarquía geográfica
  const { data: countries, loading: countriesLoading } = useCountries();
  const { data: cities, loading: citiesLoading } = useCitiesByCountry(
    formData.countryId || null
  );
  const { data: provinces, loading: provincesLoading } = useProvincesByCity(
    formData.cityId || null
  );
  const { data: districts, loading: districtsLoading } = useDistrictsByProvince(
    formData.provinceId || null
  );

  // Handlers para selección jerárquica
  const handleCountryChange = (countryId: number) => {
    onInputChange('countryId', countryId);
    onInputChange('cityId', 0);
    onInputChange('provinceId', 0);
    onInputChange('districtId', 0);
  };

  const handleCityChange = (cityId: number) => {
    onInputChange('cityId', cityId);
    onInputChange('provinceId', 0);
    onInputChange('districtId', 0);
  };

  const handleProvinceChange = (provinceId: number) => {
    onInputChange('provinceId', provinceId);
    onInputChange('districtId', 0);
  };

  const handleDistrictChange = (districtId: number) => {
    onInputChange('districtId', districtId);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Edit Mode Warning */}
      {isBasicEditMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="font-medium text-amber-800">Modo de Edición Básica</h4>
          </div>
          <p className="text-sm text-amber-700">
            Esta ubicación tiene datos geográficos incompletos. Solo puedes editar la dirección, teléfono, coordenadas y horarios de operación. 
            Para cambiar la ubicación geográfica (país, ciudad, provincia, distrito), necesitarás eliminar y recrear esta ubicación.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          placeholder="+51 999 888 777"
        />
      </div>

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => onInputChange('address', e.target.value)}
        required
        placeholder="Complete address"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={(e) => onInputChange('latitude', parseFloat(e.target.value) || 0)}
          required
          placeholder="e.g. -12.0464 (Lima)"
        />

        <Input
          label="Longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={(e) => onInputChange('longitude', parseFloat(e.target.value) || 0)}
          required
          placeholder="e.g. -77.0428 (Lima)"
        />
      </div>

      {/* Selección geográfica jerárquica */}
      <div className={`space-y-4 ${isBasicEditMode ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-neutral-900">Ubicación Geográfica</h4>
          {isBasicEditMode && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Solo lectura
            </span>
          )}
        </div>
        
        {/* Country Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="País"
            value={formData.countryId || 0}
            onChange={(e) => handleCountryChange(parseInt(e.target.value))}
            required
            disabled={countriesLoading || isBasicEditMode}
          >
            <option value={0}>Seleccionar país</option>
            {countries?.map((country: Country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>

          {/* City Select */}
          <Select
            label="Ciudad"
            value={formData.cityId || 0}
            onChange={(e) => handleCityChange(parseInt(e.target.value))}
            required
            disabled={citiesLoading || !formData.countryId || isBasicEditMode}
          >
            <option value={0}>
              {formData.countryId ? 'Seleccionar ciudad' : 'Seleccionar país primero'}
            </option>
            {cities?.map((city: City) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Province Select */}
          <Select
            label="Provincia"
            value={formData.provinceId || 0}
            onChange={(e) => handleProvinceChange(parseInt(e.target.value))}
            required
            disabled={provincesLoading || !formData.cityId || isBasicEditMode}
          >
            <option value={0}>
              {formData.cityId ? 'Seleccionar provincia' : 'Seleccionar ciudad primero'}
            </option>
            {provinces?.map((province: Province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </Select>

          {/* District Select */}
          <Select
            label="Distrito"
            value={formData.districtId || 0}
            onChange={(e) => handleDistrictChange(parseInt(e.target.value))}
            required
            disabled={districtsLoading || !formData.provinceId || isBasicEditMode}
          >
            <option value={0}>
              {formData.provinceId ? 'Seleccionar distrito' : 'Seleccionar provincia primero'}
            </option>
            {districts?.map((district: District) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </Select>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> La selección es jerárquica. Primero selecciona el país, luego la ciudad, provincia y finalmente el distrito.
          </p>
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="border-t border-neutral-200 pt-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-neutral-900 mb-2">
            Horarios de Operación
          </h4>
          <p className="text-sm text-neutral-600">
            Configure los horarios de funcionamiento para esta ubicación
          </p>
        </div>
        
        {formData.operatingHours && (
          <div className="mb-4">
            <OpenStatusIndicator
              operatingHours={formData.operatingHours}
              locationName="Vista Previa"
              variant="badge"
              size="md"
              showNextChange={true}
            />
          </div>
        )}
        
        <OperatingHoursManager
          operatingHours={formData.operatingHours}
          onChange={onOperatingHoursChange}
          locationName={formData.address || 'Nueva Ubicación'}
          showPreview={false}
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {isEdit ? 'Update' : 'Create'} Location
        </Button>
      </div>
    </form>
  );
};

export default RestaurantLocations;