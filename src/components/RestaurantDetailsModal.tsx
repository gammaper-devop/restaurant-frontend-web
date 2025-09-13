import React from 'react';
import { Modal, Card, Button } from './ui';
import type { Restaurant } from '../types';

interface RestaurantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
}

const RestaurantDetailsModal: React.FC<RestaurantDetailsModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  if (!restaurant) {
    console.log('RestaurantDetailsModal: No restaurant provided');
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const formatCoordinates = (lat: string | number, lng: string | number) => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    return `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restaurant Details"
      size="xl"
    >
      <div className="space-y-8">
        {/* Restaurant Header */}
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {restaurant.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 font-display">
              {restaurant.name}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                {restaurant.category?.name || 'No category'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                Array.isArray(restaurant.locations) && restaurant.locations.length > 0
                  ? 'bg-success-100 text-success-800'
                  : 'bg-neutral-100 text-neutral-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  Array.isArray(restaurant.locations) && restaurant.locations.length > 0
                    ? 'bg-success-500'
                    : 'bg-neutral-400'
                }`} />
                {Array.isArray(restaurant.locations) && restaurant.locations.length > 0 ? 'Active' : 'Inactive'}
              </span>
            </div>
            {restaurant.phone && (
              <p className="text-neutral-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {restaurant.phone}
              </p>
            )}
          </div>
        </div>

        {/* Restaurant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-display">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-600">Name</label>
                <p className="text-neutral-900 font-medium">{restaurant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Category</label>
                <p className="text-neutral-900">{restaurant.category?.name || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Phone</label>
                <p className="text-neutral-900">{restaurant.phone || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Logo</label>
                {restaurant.logo ? (
                  <a
                    href={restaurant.logo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    View Logo
                  </a>
                ) : (
                  <p className="text-neutral-500">No logo</p>
                )}
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-display">
              Statistics
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-600">Total Locations</label>
                <p className="text-2xl font-bold text-primary-600">
                  {Array.isArray(restaurant.locations) ? restaurant.locations.length : 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Created</label>
                <p className="text-neutral-900">{formatDate(restaurant.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Last Updated</label>
                <p className="text-neutral-900">{formatDate(restaurant.updatedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Status</label>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                  Array.isArray(restaurant.locations) && restaurant.locations.length > 0
                    ? 'bg-success-100 text-success-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {Array.isArray(restaurant.locations) && restaurant.locations.length > 0 ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Locations Section */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 font-display">
              Restaurant Locations
            </h3>
            <span className="text-sm text-neutral-500">
              {Array.isArray(restaurant.locations) ? restaurant.locations.length : 0} location{(Array.isArray(restaurant.locations) && restaurant.locations.length !== 1) ? 's' : ''}
            </span>
          </div>

          {Array.isArray(restaurant.locations) && restaurant.locations.length > 0 ? (
            <div className="space-y-4">
              {restaurant.locations.map((location, index) => (
                <div
                  key={location.id}
                  className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          Location {index + 1}
                        </h4>
                        <p className="text-neutral-700 mt-1">{location.address}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            Coordinates
                          </label>
                          <p className="text-sm text-neutral-900 font-mono">
                            {formatCoordinates(location.latitude, location.longitude)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            District
                          </label>
                          <p className="text-sm text-neutral-900">
                            {location.district?.name || 'Unknown'}
                            {location.district?.province?.name && `, ${location.district.province.name}`}
                            {location.district?.province?.city?.name && `, ${location.district.province.city.name}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 pt-2 border-t border-neutral-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                            window.open(mapsUrl, '_blank');
                          }}
                          className="text-secondary-600 hover:text-secondary-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View on Map
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${location.latitude}, ${location.longitude}`);
                          }}
                          className="text-neutral-600 hover:text-neutral-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Coordinates
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Locations</h3>
              <p className="text-neutral-600">This restaurant doesn't have any registered locations yet.</p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RestaurantDetailsModal;
