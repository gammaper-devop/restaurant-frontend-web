import React, { useState, useEffect } from 'react';
import { Input } from './ui';
import { useCountries, useCitiesByCountry, useProvincesByCity, useDistrictsByProvince } from '../hooks';
import type { Country, City, Province, District } from '../types';

interface LocationData {
  address: string;
  latitude: string;
  longitude: string;
  districtId: string;
}

interface LocationSelectorProps {
  location: LocationData;
  onChange: (location: LocationData) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  errors?: Partial<LocationData>;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onChange,
  onRemove,
  showRemove = false,
  errors = {}
}) => {
  const { data: countries, loading: countriesLoading } = useCountries();
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');

  const { data: cities, loading: citiesLoading } = useCitiesByCountry(
    selectedCountryId ? parseInt(selectedCountryId) : null
  );
  const { data: provinces, loading: provincesLoading } = useProvincesByCity(
    selectedCityId ? parseInt(selectedCityId) : null
  );
  const { data: districts, loading: districtsLoading } = useDistrictsByProvince(
    selectedProvinceId ? parseInt(selectedProvinceId) : null
  );

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (!selectedCountryId) {
      setSelectedCityId('');
      setSelectedProvinceId('');
      onChange({ ...location, districtId: '' });
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (!selectedCityId) {
      setSelectedProvinceId('');
      onChange({ ...location, districtId: '' });
    }
  }, [selectedCityId]);

  useEffect(() => {
    if (!selectedProvinceId) {
      onChange({ ...location, districtId: '' });
    }
  }, [selectedProvinceId]);

  const handleInputChange = (field: keyof LocationData, value: string) => {
    onChange({ ...location, [field]: value });
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedCityId('');
    setSelectedProvinceId('');
    onChange({ ...location, districtId: '' });
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedProvinceId('');
    onChange({ ...location, districtId: '' });
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    onChange({ ...location, districtId: '' });
  };

  const handleDistrictChange = (districtId: string) => {
    onChange({ ...location, districtId });
  };

  return (
    <div className="space-y-6 p-6 bg-neutral-50/50 rounded-2xl border border-neutral-200/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-neutral-800 font-display">
          Restaurant Location
        </h4>
        {showRemove && (
          <button
            onClick={onRemove}
            className="p-2 text-danger-500 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all duration-200 hover:scale-105"
            title="Remove location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <Input
          label="Address"
          type="text"
          value={location.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter full address"
          variant="filled"
          error={errors.address}
          required
        />
      </div>

      {/* Coordinates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={location.latitude}
          onChange={(e) => handleInputChange('latitude', e.target.value)}
          placeholder="e.g. -12.0464 (Lima)"
          variant="filled"
          error={errors.latitude}
          required
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={location.longitude}
          onChange={(e) => handleInputChange('longitude', e.target.value)}
          placeholder="e.g. -77.0428 (Lima)"
          variant="filled"
          error={errors.longitude}
          required
        />
      </div>

      {/* Location Hierarchy */}
      <div className="space-y-4">
        <h5 className="text-sm font-semibold text-neutral-700 font-display">
          Location Details
        </h5>

        {/* Country Select */}
        <div className="space-y-2">
          <label htmlFor={`country-${Math.random()}`} className="block text-sm font-medium text-neutral-700">
            Country <span className="text-danger-500">*</span>
          </label>
          <select
            id={`country-${Math.random()}`}
            value={selectedCountryId}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:bg-neutral-50"
            disabled={countriesLoading}
          >
            <option value="">Select a country</option>
            {countries?.map((country: Country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <label htmlFor={`city-${Math.random()}`} className="block text-sm font-medium text-neutral-700">
            City <span className="text-danger-500">*</span>
          </label>
          <select
            id={`city-${Math.random()}`}
            value={selectedCityId}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={citiesLoading || !selectedCountryId}
          >
            <option value="">
              {selectedCountryId ? 'Select a city' : 'Select a country first'}
            </option>
            {cities?.map((city: City) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Province Select */}
        <div className="space-y-2">
          <label htmlFor={`province-${Math.random()}`} className="block text-sm font-medium text-neutral-700">
            Province <span className="text-danger-500">*</span>
          </label>
          <select
            id={`province-${Math.random()}`}
            value={selectedProvinceId}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={provincesLoading || !selectedCityId}
          >
            <option value="">
              {selectedCityId ? 'Select a province' : 'Select a city first'}
            </option>
            {provinces?.map((province: Province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div className="space-y-2">
          <label htmlFor={`district-${Math.random()}`} className="block text-sm font-medium text-neutral-700">
            District <span className="text-danger-500">*</span>
          </label>
          <select
            id={`district-${Math.random()}`}
            value={location.districtId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={districtsLoading || !selectedProvinceId}
          >
            <option value="">
              {selectedProvinceId ? 'Select a district' : 'Select a province first'}
            </option>
            {districts?.map((district: District) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.districtId && (
            <div className="flex items-center space-x-2 mt-2 animate-fade-in">
              <svg className="w-4 h-4 text-danger-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-danger-600 font-medium">{errors.districtId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
