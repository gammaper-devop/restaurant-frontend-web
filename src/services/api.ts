import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  User, 
  Restaurant, 
  Category, 
  Dish, 
  Menu, 
  Country, 
  City, 
  Province, 
  District,
  RestaurantLocation,
  CreateRestaurantDTO,
  CreateRestaurantLocationDTO,
  UpdateOperatingHoursDTO,
  NearbyRestaurantQuery,
  NearbyRestaurantResult,
  LocationOperationalStatus,
  LocationTimeCheck
} from '../types';

// Enhanced API URL detection
let API_BASE_URL;

// Check environment variable first
if (import.meta.env.VITE_API_BASE_URL) {
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
} else if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  // Force production URL for Vercel deployments
  API_BASE_URL = 'https://restaurant-backend-6g8j.onrender.com/api';
} else {
  // Default to localhost for development
  API_BASE_URL = 'http://localhost:3000/api';
}

// Enhanced debug logging
console.log('🔧 API Configuration Debug:');
console.log('  Raw Environment:', import.meta.env.VITE_API_BASE_URL);
console.log('  Current Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
console.log('  Is Vercel?', typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false);
console.log('  Final API URL:', API_BASE_URL);
console.log('  All env vars:', import.meta.env);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for requests
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and debug logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/users/change-password', passwordData);
  },
};

// Users Service
export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleActive: async (id: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Restaurants Service
export const restaurantsService = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants');
    // Manejar respuesta estructurada del backend
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    // Manejar respuesta estructurada del backend
    return response.data?.data || response.data;
  },

  create: async (restaurantData: CreateRestaurantDTO): Promise<Restaurant> => {
    const response = await api.post('/restaurants', restaurantData);
    // Manejar respuesta estructurada del backend
    return response.data?.data || response.data;
  },

  update: async (id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    // Manejar respuesta estructurada del backend
    return response.data?.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },

  toggleActive: async (id: number): Promise<Restaurant> => {
    const response = await api.patch(`/restaurants/${id}/toggle-active`);
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },
};

// Categories Service
export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  toggleActive: async (id: number): Promise<Category> => {
    const response = await api.patch(`/categories/${id}/toggle-active`);
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Dishes Service
// Create dish DTO interface (alineado con el backend)
interface CreateDishDto {
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: {
    id: number;
  };
}

// Update dish DTO interface (alineado con el backend)
interface UpdateDishDto {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  restaurant?: {
    id: number;
  };
}

export const dishesService = {
  getAll: async (): Promise<Dish[]> => {
    const response = await api.get('/dishes');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<Dish> => {
    const response = await api.get(`/dishes/${id}`);
    return response.data?.data || response.data;
  },

  getByRestaurant: async (restaurantId: number): Promise<Dish[]> => {
    const response = await api.get(`/dishes/restaurant/${restaurantId}`);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  create: async (dishData: CreateDishDto): Promise<Dish> => {
    const response = await api.post('/dishes', dishData);
    return response.data?.data || response.data;
  },

  update: async (id: number, dishData: UpdateDishDto): Promise<Dish> => {
    const response = await api.put(`/dishes/${id}`, dishData);
    return response.data?.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },

  toggleActive: async (id: number): Promise<Dish> => {
    const response = await api.patch(`/dishes/${id}/toggle-active`);
    return response.data?.data || response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};

// Menus Service
export const menusService = {
  getAll: async (): Promise<Menu[]> => {
    const response = await api.get('/menus');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<Menu> => {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  getByRestaurant: async (restaurantId: number): Promise<Menu[]> => {
    const response = await api.get(`/menus/restaurant/${restaurantId}`);
    return response.data;
  },

  create: async (menuData: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Promise<Menu> => {
    const response = await api.post('/menus', menuData);
    return response.data;
  },

  update: async (id: number, menuData: Partial<Menu>): Promise<Menu> => {
    const response = await api.put(`/menus/${id}`, menuData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/menus/${id}`);
  },

  addDish: async (menuId: number, dishId: number): Promise<void> => {
    await api.post(`/menus/${menuId}/dishes/${dishId}`);
  },

  removeDish: async (menuId: number, dishId: number): Promise<void> => {
    await api.delete(`/menus/${menuId}/dishes/${dishId}`);
  },

  toggleActive: async (id: number): Promise<Menu> => {
    const response = await api.patch(`/menus/${id}/toggle-active`);
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/menus/${id}`);
  },
};

// Locations Service
export const locationsService = {
  // Countries
  getCountries: async (): Promise<Country[]> => {
    const response = await api.get('/locations/countries');
    return response.data;
  },

  createCountry: async (countryData: Omit<Country, 'id'>): Promise<Country> => {
    const response = await api.post('/locations/countries', countryData);
    return response.data;
  },

  // Cities
  getCities: async (): Promise<City[]> => {
    const response = await api.get('/locations/cities');
    return response.data;
  },

  getCitiesByCountry: async (countryId: number): Promise<City[]> => {
    const response = await api.get(`/locations/cities/country/${countryId}`);
    return response.data;
  },

  createCity: async (cityData: Omit<City, 'id'>): Promise<City> => {
    const response = await api.post('/locations/cities', cityData);
    return response.data;
  },

  // Provinces
  getProvinces: async (): Promise<Province[]> => {
    const response = await api.get('/locations/provinces');
    return response.data;
  },

  getProvinceById: async (id: number): Promise<Province> => {
    const response = await api.get(`/locations/provinces/${id}`);
    return response.data;
  },

  getProvincesByCity: async (cityId: number): Promise<Province[]> => {
    const response = await api.get(`/locations/provinces/city/${cityId}`);
    return response.data;
  },

  createProvince: async (provinceData: Omit<Province, 'id'>): Promise<Province> => {
    const response = await api.post('/locations/provinces', provinceData);
    return response.data;
  },

  updateProvince: async (id: number, provinceData: Partial<Province>): Promise<Province> => {
    const response = await api.put(`/locations/provinces/${id}`, provinceData);
    return response.data;
  },

  deleteProvince: async (id: number): Promise<void> => {
    await api.delete(`/locations/provinces/${id}`);
  },

  // Districts
  getDistricts: async (): Promise<District[]> => {
    const response = await api.get('/locations/districts');
    return response.data;
  },

  getDistrictById: async (id: number): Promise<District> => {
    const response = await api.get(`/locations/districts/${id}`);
    return response.data;
  },

  getDistrictsByProvince: async (provinceId: number): Promise<District[]> => {
    const response = await api.get(`/locations/districts/province/${provinceId}`);
    return response.data;
  },

  createDistrict: async (districtData: Omit<District, 'id'>): Promise<District> => {
    const response = await api.post('/locations/districts', districtData);
    return response.data;
  },

  updateDistrict: async (id: number, districtData: Partial<District>): Promise<District> => {
    const response = await api.put(`/locations/districts/${id}`, districtData);
    return response.data;
  },

  deleteDistrict: async (id: number): Promise<void> => {
    await api.delete(`/locations/districts/${id}`);
  },
};

// Restaurant Locations Service - Alineado con capacidades completas del backend
export const restaurantLocationsService = {
  // CRUD básico
  getAll: async (): Promise<RestaurantLocation[]> => {
    const response = await api.get('/restaurants/locations');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<RestaurantLocation> => {
    const response = await api.get(`/restaurants/locations/${id}`);
    return response.data?.data || response.data;
  },

  getByRestaurant: async (restaurantId: number): Promise<RestaurantLocation[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/locations`);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  create: async (locationData: CreateRestaurantLocationDTO): Promise<RestaurantLocation> => {
    const response = await api.post('/restaurants/locations', locationData);
    return response.data?.data || response.data;
  },

  update: async (id: number, locationData: Partial<CreateRestaurantLocationDTO>): Promise<RestaurantLocation> => {
    const response = await api.put(`/restaurants/locations/${id}`, locationData);
    return response.data?.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/locations/${id}`);
  },

  softDelete: async (id: number): Promise<RestaurantLocation> => {
    try {
      // Get the current location data BEFORE soft deleting (while it's still active)
      const currentLocation = await restaurantLocationsService.getById(id);
      
      // Use the existing DELETE endpoint - backend handles soft delete with EntityUtils.softDelete()
      await api.delete(`/restaurants/locations/${id}`);
      
      // Backend soft delete succeeded, return the location data with active: false
      // We use the data we got before deletion since getById won't find inactive entities
      return {
        ...currentLocation,
        active: false
      };
    } catch (error: any) {
      console.error('Soft delete failed:', error?.response?.data || error?.message);
      
      // Check if it's a "not found" error - might mean it's already inactive
      if (error?.response?.status === 404) {
        throw new Error('La ubicación no fue encontrada o ya está inactiva.');
      }
      
      throw new Error('No se pudo desactivar la ubicación. Por favor, inténtalo de nuevo.');
    }
  },

  // NUEVOS ENDPOINTS PARA OPERATING HOURS (¡anteriormente faltantes!)
  updateOperatingHours: async (id: number, operatingHoursData: UpdateOperatingHoursDTO): Promise<RestaurantLocation> => {
    const response = await api.patch(`/restaurants/locations/${id}/operating-hours`, operatingHoursData);
    return response.data?.data || response.data;
  },

  isCurrentlyOpen: async (id: number): Promise<LocationOperationalStatus> => {
    const response = await api.get(`/restaurants/locations/${id}/is-open`);
    return response.data?.data || response.data;
  },

  isOpenAt: async (id: number, datetime: string): Promise<LocationTimeCheck> => {
    const response = await api.get(`/restaurants/locations/${id}/is-open-at/${encodeURIComponent(datetime)}`);
    return response.data?.data || response.data;
  },

  getCurrentlyOpenLocations: async (): Promise<RestaurantLocation[]> => {
    const response = await api.get('/restaurants/locations/currently-open');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },
};

// Dashboard Service
export const dashboardService = {
  getStats: async (): Promise<{
    totalRestaurants: number;
    totalMenus: number;
    totalDishes: number;
    totalUsers: number;
    activeRestaurants: number;
  }> => {
    try {
      const [restaurants, menus, dishes, users] = await Promise.all([
        restaurantsService.getAll(),
        menusService.getAll(),
        dishesService.getAll(),
        usersService.getAll()
      ]);

      // Ensure all data are arrays
      const validRestaurants = Array.isArray(restaurants) ? restaurants : [];
      const validMenus = Array.isArray(menus) ? menus : [];
      const validDishes = Array.isArray(dishes) ? dishes : [];
      const validUsers = Array.isArray(users) ? users : [];

      return {
        totalRestaurants: validRestaurants.length,
        totalMenus: validMenus.length,
        totalDishes: validDishes.length,
        totalUsers: validUsers.length,
        activeRestaurants: validRestaurants.filter(r => r.active === true).length
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalRestaurants: 0,
        totalMenus: 0,
        totalDishes: 0,
        totalUsers: 0,
        activeRestaurants: 0
      };
    }
  },

  getRecentActivity: async (): Promise<{
    id: number;
    type: string;
    message: string;
    time: string;
    user: string;
  }[]> => {
    try {
      // In a real app, you'd have an activity log endpoint
      // For now, we'll return recent restaurants as activity
      const restaurants = await restaurantsService.getAll();
      const validRestaurants = Array.isArray(restaurants) ? restaurants : [];
      
      const recent = validRestaurants
        .filter(restaurant => restaurant.created_at) // Only include items with valid created_at
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map(restaurant => ({
          id: restaurant.id,
          type: 'restaurant_added',
          message: `Nuevo restaurante "${restaurant.name}" fue agregado`,
          time: new Date(restaurant.created_at).toLocaleString('es-ES'),
          user: 'Sistema'
        }));
      
      return recent;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
};

// NUEVO: Nearby Restaurants Service - Búsqueda por proximidad
export const nearbyRestaurantsService = {
  searchNearby: async (query: NearbyRestaurantQuery): Promise<NearbyRestaurantResult[]> => {
    const { lat, lng, radius = 10 } = query;
    const response = await api.get(`/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  searchNearbyWithFilters: async (
    query: NearbyRestaurantQuery, 
    filters?: { categoryId?: number; isOpen?: boolean }
  ): Promise<NearbyRestaurantResult[]> => {
    const { lat, lng, radius = 10 } = query;
    let url = `/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
    
    if (filters?.categoryId) {
      url += `&categoryId=${filters.categoryId}`;
    }
    
    const response = await api.get(url);
    let results = response.data?.data || response.data || [];
    
    // Filtrar por estado abierto/cerrado si es necesario (lado cliente)
    if (filters?.isOpen !== undefined && Array.isArray(results)) {
      results = results.filter((location: any) => 
        location.isCurrentlyOpen === filters.isOpen
      );
    }
    
    return results;
  },
};

export default api;
