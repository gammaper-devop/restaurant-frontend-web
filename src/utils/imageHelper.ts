import React from 'react';

// Helper para manejar URLs de imágenes
export const getImageUrl = (imagePath: string): string => {
  // Si la imagen ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Determinar la URL base según el entorno
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
      ? 'https://restaurant-backend-6g8j.onrender.com'
      : 'http://localhost:3000'
    );

  // Construir la URL completa para la imagen
  // Asumiendo que el backend servirá imágenes en /images o /api/images
  const baseUrl = API_BASE_URL.replace('/api', ''); // Remover /api si está presente
  
  // Si imagePath empieza con /, no agregar otra barra
  const separator = imagePath.startsWith('/') ? '' : '/';
  
  return `${baseUrl}${separator}${imagePath}`;
};

// Helper específico para imágenes de platos
export const getDishImageUrl = (filename: string): string => {
  if (!filename) {
    // Imagen por defecto si no hay filename
    return '/placeholder-dish.svg';
  }
  
  return getImageUrl(`/images/dishes/${filename}`);
};

// Helper para manejar errores de carga de imágenes
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const img = event.currentTarget;
  
  // Cambiar a imagen de placeholder si falla la carga
  if (!img.src.includes('placeholder')) {
    img.src = '/placeholder-dish.svg';
    img.alt = 'Image not available';
  }
};

// Hook para precargar imágenes
export const usePreloadImage = (src: string) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error };
};