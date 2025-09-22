import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table, Modal, Input, Select, SearchableSelect, ConfirmDialog, Toast } from '../components/ui';
import { restaurantLocationsService, locationsService, restaurantsService } from '../services/api';
import type { RestaurantLocation, Restaurant, Country, City, Province, District } from '../types';

interface LocationFormData extends Omit<RestaurantLocation, 'id'> {
  id?: number;
  isNew?: boolean;
}

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
    restaurant_id: 0,
    address: '',
    phone: '',
    latitude: 0,
    longitude: 0,
    country_id: 0,
    city_id: 0,
    province_id: 0,
    district_id: 0,
    isNew: true,
  });

  // Geographic data
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<RestaurantLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success/Error messages
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
      const [restaurantsData, countriesData] = await Promise.all([
        restaurantsService.getAll(),
        locationsService.getCountries(),
      ]);

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
      setCountries(Array.isArray(countriesData) ? countriesData : []);
      
      console.log('Loaded restaurants with locations:', restaurantsWithCounts);
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
        console.log('Using cached locations from restaurant data');
        setLocations(restaurantWithLocations.locations);
        setLocationsLoading(false);
        return;
      }
      
      // If not found in cache, fetch from API
      console.log('Fetching locations from API for restaurant:', restaurantId);
      const locationsData = await restaurantLocationsService.getByRestaurant(restaurantId);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (err) {
      console.error('Error loading restaurant locations:', err);
      setError('Error loading locations. Please try again.');
    } finally {
      setLocationsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Load dependent geographic data
    if (name === 'country_id' && value) {
      loadCitiesByCountry(Number(value));
      setFormData(prev => ({ ...prev, city_id: 0, province_id: 0, district_id: 0 }));
    } else if (name === 'city_id' && value) {
      loadProvincesByCity(Number(value));
      setFormData(prev => ({ ...prev, province_id: 0, district_id: 0 }));
    } else if (name === 'province_id' && value) {
      loadDistrictsByProvince(Number(value));
      setFormData(prev => ({ ...prev, district_id: 0 }));
    }
  };

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id.toString() === restaurantId);
    setSelectedRestaurant(restaurant || null);
    setError(null); // Clear any previous errors
  };

  // Geographic data loading functions
  const loadCitiesByCountry = async (countryId: number) => {
    try {
      const citiesData = await locationsService.getCitiesByCountry(countryId);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadProvincesByCity = async (cityId: number) => {
    try {
      const provincesData = await locationsService.getProvincesByCity(cityId);
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadDistrictsByProvince = async (provinceId: number) => {
    try {
      const districtsData = await locationsService.getDistrictsByProvince(provinceId);
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  // Handle create new location
  const handleCreateLocation = () => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant first');
      return;
    }
    
    setFormData({
      restaurant_id: selectedRestaurant.id,
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      country_id: 0,
      city_id: 0,
      province_id: 0,
      district_id: 0,
      isNew: true,
    });
    setIsCreateModalOpen(true);
  };

  // Handle edit location
  const handleEditLocation = async (location: RestaurantLocation) => {
    setLocationToEdit(location);
    setFormData({
      id: location.id,
      restaurant_id: location.restaurant_id,
      address: location.address,
      phone: location.phone || '',
      latitude: location.latitude,
      longitude: location.longitude,
      country_id: location.country_id,
      city_id: location.city_id,
      province_id: location.province_id,
      district_id: location.district_id,
      isNew: false,
    });

    // Load dependent geographic data for editing
    if (location.country_id) {
      await loadCitiesByCountry(location.country_id);
      if (location.city_id) {
        await loadProvincesByCity(location.city_id);
        if (location.province_id) {
          await loadDistrictsByProvince(location.province_id);
        }
      }
    }

    setIsEditModalOpen(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.restaurant_id || !formData.address || !formData.country_id || 
        !formData.city_id || !formData.province_id || !formData.district_id) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setFormLoading(true);
    try {
      const locationData = {
        restaurant_id: formData.restaurant_id,
        address: formData.address,
        phone: formData.phone,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        country_id: formData.country_id,
        city_id: formData.city_id,
        province_id: formData.province_id,
        district_id: formData.district_id,
      };

      if (formData.isNew) {
        // Create new location
        await restaurantLocationsService.create(locationData);
        setSuccessMessage('Ubicación creada exitosamente');
        setIsCreateModalOpen(false);
      } else {
        // Update existing location
        await restaurantLocationsService.update(formData.id!, locationData);
        setSuccessMessage('Ubicación actualizada exitosamente');
        setIsEditModalOpen(false);
        setLocationToEdit(null);
      }

      setShowSuccessToast(true);
      if (selectedRestaurant) {
        await loadRestaurantLocations(selectedRestaurant.id); // Refresh locations
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error al guardar la ubicación. Por favor, inténtalo de nuevo.');
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
      await restaurantLocationsService.delete(locationToDelete.id);
      setSuccessMessage(`Ubicación eliminada exitosamente`);
      setShowSuccessToast(true);
      setDeleteConfirmOpen(false);
      setLocationToDelete(null);
      if (selectedRestaurant) {
        await loadRestaurantLocations(selectedRestaurant.id); // Refresh locations
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error al eliminar la ubicación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle close modals
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      restaurant_id: 0,
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      country_id: 0,
      city_id: 0,
      province_id: 0,
      district_id: 0,
      isNew: true,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setLocationToEdit(null);
  };

  // Since we're showing locations for a specific restaurant, we don't need filtering

  // Table columns - removed restaurant column since we're showing locations for one restaurant
  const columns = [
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
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
      key: 'coordinates',
      label: 'Coordinates',
      render: (value: any, row: RestaurantLocation) => (
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
            title="Delete location"
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
                subtitle: `${restaurant.locationCount} location${restaurant.locationCount !== 1 ? 's' : ''}${restaurant.phone ? ` • ${restaurant.phone}` : ''}`,
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
                    {selectedRestaurant.phone && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{selectedRestaurant.phone}</span>
                      </span>
                    )}
                    {selectedRestaurant.email && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <span>{selectedRestaurant.email}</span>
                      </span>
                    )}
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
                <h3 className="text-lg font-semibold text-neutral-900">
                  Locations for {selectedRestaurant.name}
                </h3>
                {locationsLoading && (
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span className="text-sm">Loading locations...</span>
                  </div>
                )}
              </div>
            </div>
            <Table
              columns={columns}
              data={locations}
              variant="clean"
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
          size="lg"
        >
          <LocationForm
            formData={formData}
            restaurants={restaurants}
            countries={countries}
            cities={cities}
            provinces={provinces}
            districts={districts}
            onInputChange={handleInputChange}
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
          size="lg"
        >
          <LocationForm
            formData={formData}
            restaurants={restaurants}
            countries={countries}
            cities={cities}
            provinces={provinces}
            districts={districts}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseEditModal}
            loading={formLoading}
            isEdit
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setLocationToDelete(null);
          }}
          onConfirm={handleConfirmedDelete}
          title="Delete Location"
          message={`Are you sure you want to delete this location "${locationToDelete?.address}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
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
  countries: Country[];
  cities: City[];
  provinces: Province[];
  districts: District[];
  onInputChange: (name: string, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  formData,
  restaurants,
  countries,
  cities,
  provinces,
  districts,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Country"
          value={formData.country_id}
          onChange={(e) => onInputChange('country_id', parseInt(e.target.value))}
          required
        >
          <option value={0}>Select country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </Select>

        <Select
          label="City"
          value={formData.city_id}
          onChange={(e) => onInputChange('city_id', parseInt(e.target.value))}
          required
          disabled={!formData.country_id}
        >
          <option value={0}>Select city</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Province"
          value={formData.province_id}
          onChange={(e) => onInputChange('province_id', parseInt(e.target.value))}
          required
          disabled={!formData.city_id}
        >
          <option value={0}>Select province</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </Select>

        <Select
          label="District"
          value={formData.district_id}
          onChange={(e) => onInputChange('district_id', parseInt(e.target.value))}
          required
          disabled={!formData.province_id}
        >
          <option value={0}>Select district</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </Select>
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