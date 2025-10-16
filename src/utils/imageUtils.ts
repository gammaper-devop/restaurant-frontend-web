const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (type: 'dishes' | 'restaurants', filename: string | null | undefined): string => {
  if (!filename) {
    return getDefaultImage(type);
  }
  
  // Remove any path or URL prefix from filename, keep only the filename
  const cleanFilename = filename.split('/').pop() || filename;
  
  return `${API_BASE_URL}/images/${type}/${cleanFilename}`;
};

export const getDefaultImage = (type: 'dishes' | 'restaurants'): string => {
  const defaults = {
    dishes: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
  };
  
  return defaults[type];
};

// Helper function to get image URL with fallback to default
export const getImageWithFallback = (type: 'dishes' | 'restaurants', filename: string | null | undefined): string => {
  if (!filename) {
    return getDefaultImage(type);
  }
  
  return getImageUrl(type, filename);
};

// For debugging - log the current API base URL
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};