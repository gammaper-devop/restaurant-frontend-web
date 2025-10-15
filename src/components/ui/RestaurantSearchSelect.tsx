import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '../../types';

interface RestaurantSearchSelectProps {
  restaurants: Restaurant[];
  selectedRestaurantId: number;
  onChange: (restaurantId: number) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const RestaurantSearchSelect: React.FC<RestaurantSearchSelectProps> = ({
  restaurants,
  selectedRestaurantId,
  onChange,
  error,
  disabled = false,
  placeholder = "Buscar restaurante...",
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inicializar restaurante seleccionado
  useEffect(() => {
    const restaurant = restaurants.find(r => r.id === selectedRestaurantId);
    setSelectedRestaurant(restaurant || null);
    setSearchTerm(restaurant?.name || '');
  }, [selectedRestaurantId, restaurants]);

  // Filtrar restaurantes basado en búsqueda
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants([]);
    }
  }, [searchTerm, restaurants]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      if (selectedRestaurantId !== 0) {
        onChange(0); // Reset selection if search is too short
        setSelectedRestaurant(null);
      }
    }
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSearchTerm(restaurant.name);
    setIsOpen(false);
    onChange(restaurant.id);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 3) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white ${
          error 
            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' 
            : 'border-neutral-200'
        } ${disabled ? 'bg-neutral-50 cursor-not-allowed' : ''}`}
      />
      
      {/* Dropdown */}
      {isOpen && filteredRestaurants.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-auto"
        >
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleRestaurantSelect(restaurant)}
              className="px-4 py-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0 transition-colors duration-150"
            >
              <div className="font-medium text-neutral-900">
                {restaurant.name}
              </div>
              <div className="text-sm text-neutral-600">
                {restaurant.category?.name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {isOpen && searchTerm.length >= 3 && filteredRestaurants.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg p-4"
        >
          <div className="text-center text-neutral-500">
            No se encontraron restaurantes con "{searchTerm}"
          </div>
        </div>
      )}
      
      {/* Helper text */}
      <div className="mt-1">
        {error ? (
          <p className="text-sm text-danger-600">{error}</p>
        ) : (
          <p className="text-xs text-neutral-500">
            {searchTerm.length < 3 && searchTerm.length > 0 
              ? `Escribe ${3 - searchTerm.length} caracteres más para buscar`
              : searchTerm.length === 0 
                ? 'Escribe al menos 3 caracteres para buscar restaurantes'
                : ''
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default RestaurantSearchSelect;