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
  ErrorLog
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
    return response.data;
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
};

// Restaurants Service
export const restaurantsService = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  getById: async (id: number): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  create: async (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant> => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  },

  update: async (id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },
};

// Categories Service
export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
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
};

// Dishes Service
export const dishesService = {
  getAll: async (): Promise<Dish[]> => {
    const response = await api.get('/dishes');
    return response.data;
  },

  getById: async (id: number): Promise<Dish> => {
    const response = await api.get(`/dishes/${id}`);
    return response.data;
  },

  getByRestaurant: async (restaurantId: number): Promise<Dish[]> => {
    const response = await api.get(`/dishes/restaurant/${restaurantId}`);
    return response.data;
  },

  create: async (dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> => {
    const response = await api.post('/dishes', dishData);
    return response.data;
  },

  update: async (id: number, dishData: Partial<Dish>): Promise<Dish> => {
    const response = await api.put(`/dishes/${id}`, dishData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};

// Menus Service
export const menusService = {
  getAll: async (): Promise<Menu[]> => {
    const response = await api.get('/menus');
    return response.data;
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

// Restaurant Locations Service
export const restaurantLocationsService = {
  getAll: async (): Promise<RestaurantLocation[]> => {
    const response = await api.get('/restaurant-locations');
    return response.data;
  },

  getById: async (id: number): Promise<RestaurantLocation> => {
    const response = await api.get(`/restaurant-locations/${id}`);
    return response.data;
  },

  getByRestaurant: async (restaurantId: number): Promise<RestaurantLocation[]> => {
    const response = await api.get(`/restaurant-locations/restaurant/${restaurantId}`);
    return response.data;
  },

  create: async (locationData: Omit<RestaurantLocation, 'id'>): Promise<RestaurantLocation> => {
    const response = await api.post('/restaurant-locations', locationData);
    return response.data;
  },

  update: async (id: number, locationData: Partial<RestaurantLocation>): Promise<RestaurantLocation> => {
    const response = await api.put(`/restaurant-locations/${id}`, locationData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/restaurant-locations/${id}`);
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
    const [restaurants, menus, dishes, users] = await Promise.all([
      restaurantsService.getAll(),
      menusService.getAll(),
      dishesService.getAll(),
      usersService.getAll()
    ]);

    return {
      totalRestaurants: restaurants.length,
      totalMenus: menus.length,
      totalDishes: dishes.length,
      totalUsers: users.length,
      activeRestaurants: restaurants.filter(r => r.locations && r.locations.length > 0).length
    };
  },

  getRecentActivity: async (): Promise<{
    id: number;
    type: string;
    message: string;
    time: string;
    user: string;
  }[]> => {
    // In a real app, you'd have an activity log endpoint
    // For now, we'll return recent restaurants as activity
    const restaurants = await restaurantsService.getAll();
    const recent = restaurants
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(restaurant => ({
        id: restaurant.id,
        type: 'restaurant_added',
        message: `New restaurant "${restaurant.name}" was added`,
        time: new Date(restaurant.createdAt).toLocaleString(),
        user: 'System'
      }));
    
    return recent;
  }
};

export default api;
