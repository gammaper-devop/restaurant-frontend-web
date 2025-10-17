import React, { useState } from 'react';
import { getDishImageUrl, handleImageError } from '../../utils';

interface DishImageProps {
  filename?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
}

const DishImage: React.FC<DishImageProps> = ({
  filename,
  alt = 'Plato de comida',
  className = '',
  width,
  height,
  fallbackSrc = '/placeholder-dish.svg'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoading(false);
    handleImageError(event);
  };

  // Determine la URL de la imagen
  const imageUrl = hasError || !filename ? fallbackSrc : getDishImageUrl(filename);

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-neutral-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`${isLoading ? 'invisible' : 'visible'} transition-all duration-300 rounded-lg object-cover w-full h-full`}
      />

      {/* Error state indicator */}
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          No disponible
        </div>
      )}
    </div>
  );
};

export default DishImage;