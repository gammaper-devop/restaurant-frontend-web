import React, { useState } from 'react';
import { Button, Input } from './ui';
import LocationSelector from './LocationSelector';
import { useCategories, useRestaurantMutations } from '../hooks';
import { restaurantLocationsService } from '../services/api';
import type { Category } from '../types';

interface RestaurantFormData {
  name: string;
  phone: string;
  logo: string;
  categoryId: string;
  active: boolean;
}

interface LocationFormData {
  address: string;
  latitude: string;
  longitude: string;
  districtId: string;
}

interface RestaurantFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({ onSuccess, onCancel }) => {
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { create, loading: createLoading, error: createError } = useRestaurantMutations();

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    phone: '',
    logo: '',
    categoryId: '',
    active: true,
  });

  const [errors, setErrors] = useState<Partial<RestaurantFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RestaurantFormData, boolean>>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Locations state
  const [locations, setLocations] = useState<LocationFormData[]>([
    { address: '', latitude: '', longitude: '', districtId: '' }
  ]);
  const [locationErrors, setLocationErrors] = useState<Partial<LocationFormData>[]>([{}]);

  // Location management functions
  const addLocation = () => {
    setLocations(prev => [...prev, { address: '', latitude: '', longitude: '', districtId: '' }]);
    setLocationErrors(prev => [...prev, {}]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(prev => prev.filter((_, i) => i !== index));
      setLocationErrors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, locationData: LocationFormData) => {
    setLocations(prev => prev.map((loc, i) => i === index ? locationData : loc));
  };

  // Validate location
  const validateLocation = (location: LocationFormData): Partial<LocationFormData> => {
    const errors: Partial<LocationFormData> = {};

    if (!location.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!location.latitude.trim()) {
      errors.latitude = 'Latitude is required';
    } else {
      const lat = parseFloat(location.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Please enter a valid latitude (-90 to 90)';
      }
    }

    if (!location.longitude.trim()) {
      errors.longitude = 'Longitude is required';
    } else {
      const lng = parseFloat(location.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Please enter a valid longitude (-180 to 180)';
      }
    }

    if (!location.districtId) {
      errors.districtId = 'Please select a district';
    }

    return errors;
  };

  // Validate all locations
  const validateAllLocations = (): boolean => {
    const newErrors = locations.map(validateLocation);
    setLocationErrors(newErrors);
    return newErrors.every(error => Object.keys(error).length === 0);
  };

  // Validation rules
  const validateField = (name: keyof RestaurantFormData, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Restaurant name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Name must be less than 100 characters';
        return '';

      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        return '';

      case 'logo':
        if (value && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
          return 'Please enter a valid image URL (jpg, png, gif, webp)';
        }
        return '';

      case 'categoryId':
        if (!value) return 'Please select a category';
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RestaurantFormData> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof RestaurantFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (name: keyof RestaurantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: keyof RestaurantFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof RestaurantFormData] = true;
      return acc;
    }, {} as Partial<Record<keyof RestaurantFormData, boolean>>);
    setTouched(allTouched);

    // Validate form and locations
    const isFormValid = validateForm();
    const areLocationsValid = validateAllLocations();

    if (!isFormValid || !areLocationsValid) {
      return;
    }

    try {
      // Step 1: Create the restaurant
      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        logo: formData.logo.trim() || undefined,
        category: { id: parseInt(formData.categoryId) } as any, // Temporary fix for type mismatch
        active: formData.active,
      };

      const createdRestaurant = await create(submitData);
      console.log('Created restaurant:', createdRestaurant);
      console.log('Restaurant ID:', createdRestaurant?.id);
      console.log('Restaurant data structure:', createdRestaurant?.data);

      // Step 2: Create restaurant locations
      const locationPromises = locations.map((location, index) => {
        // Handle different response structures from backend
        let restaurantId: number | undefined;

        if (typeof createdRestaurant === 'object' && createdRestaurant !== null) {
          // Check if it's the direct restaurant object
          if ('id' in createdRestaurant && typeof createdRestaurant.id === 'number') {
            restaurantId = createdRestaurant.id;
          }
          // Check if it's wrapped in a data property (API response format)
          else if ('data' in createdRestaurant && createdRestaurant.data && typeof createdRestaurant.data === 'object' && 'id' in createdRestaurant.data) {
            restaurantId = (createdRestaurant.data as any).id;
          }
        }

        if (!restaurantId) {
          console.error('Restaurant creation response:', createdRestaurant);
          throw new Error('Restaurant ID not found after creation');
        }

        const locationData = {
          address: location.address.trim(),
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          district: parseInt(location.districtId),
          restaurant: restaurantId,
        } as any; // TypeScript workaround for backend API mismatch

        console.log(`Creating location ${index + 1} with payload:`, locationData);
        return restaurantLocationsService.create(locationData);
      });

      await Promise.all(locationPromises);

      // Show success message
      const locationText = locations.length === 1 ? 'location' : 'locations';
      setSuccessMessage(
        `Restaurant "${formData.name.trim()}" with ${locations.length} ${locationText} has been created successfully!`
      );
      setShowSuccess(true);

      // Hide success message after 3 seconds and close modal
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 3000);

    } catch (error: any) {
      console.error('Error creating restaurant or locations:', error);

      // The error is already handled by the hook and displayed via createError
      // But we can add additional specific error handling if needed

      // For example, you could add:
      // if (error.response?.status === 409) {
      //   // Handle duplicate restaurant name
      // } else if (error.response?.status === 403) {
      //   // Handle permission denied
      // } else if (error.response?.status === 422) {
      //   // Handle validation errors from server
      // }
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Input
            label="Restaurant Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : ''}
            placeholder="Enter restaurant name"
            required
            variant="filled"
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            error={touched.phone ? errors.phone : ''}
            placeholder="Enter phone number (optional)"
            variant="filled"
          />
        </div>

        {/* Logo Field */}
        <div className="space-y-2">
          <Input
            label="Logo URL"
            type="url"
            value={formData.logo}
            onChange={(e) => handleInputChange('logo', e.target.value)}
            onBlur={() => handleBlur('logo')}
            error={touched.logo ? errors.logo : ''}
            placeholder="Enter logo image URL (optional)"
            variant="filled"
          />
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked as any)}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="active" className="block text-sm font-semibold text-neutral-800 font-display">
              Estado Activo
            </label>
          </div>
          <p className="text-xs text-neutral-500 ml-7">
            Los restaurantes activos serán visibles y operativos en el sistema
          </p>
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-semibold text-neutral-800 font-display">
            Category <span className="text-danger-500">*</span>
          </label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            onBlur={() => handleBlur('categoryId')}
            className={`w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:bg-neutral-100/50 ${
              touched.categoryId && errors.categoryId
                ? 'border-danger-400 focus:ring-danger-500/20 focus:border-danger-500'
                : 'hover:border-primary-300'
            } ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={categoriesLoading}
          >
            <option value="">Select a category</option>
            {categories?.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {touched.categoryId && errors.categoryId && (
            <div className="flex items-center space-x-2 mt-2 animate-fade-in">
              <svg className="w-4 h-4 text-danger-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-danger-600 font-medium">{errors.categoryId}</p>
            </div>
          )}
        </div>

        {/* Restaurant Locations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Restaurant Locations <span className="text-danger-500">*</span>
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLocation}
              disabled={createLoading}
              className="px-4 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Location
            </Button>
          </div>

          <div className="space-y-6">
            {locations.map((location, index) => (
              <LocationSelector
                key={index}
                location={location}
                onChange={(updatedLocation) => updateLocation(index, updatedLocation)}
                onRemove={() => removeLocation(index)}
                showRemove={locations.length > 1}
                errors={locationErrors[index] || {}}
              />
            ))}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && successMessage && (
          <div className="bg-success-50/80 backdrop-blur-sm border border-success-200/50 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-success-800">{successMessage}</p>
                <p className="text-xs text-success-600 mt-1">The modal will close automatically in a few seconds...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {createError && !showSuccess && (
          <div className="bg-danger-50/80 backdrop-blur-sm border border-danger-200/50 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-danger-800">{createError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={createLoading}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createLoading}
            disabled={categoriesLoading}
            className="px-8 py-2.5 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            Create Restaurant
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;
