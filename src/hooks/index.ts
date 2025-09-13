import { useState, useEffect, useCallback } from 'react';
import { 
  restaurantsService,
  categoriesService,
  dishesService,
  menusService,
  usersService,
  locationsService,
  restaurantLocationsService,
  dashboardService,
} from '../services/api';
import type {
  Restaurant,
  Category,
  Dish,
  Menu,
} from '../types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// Generic hook for single entity fetching
function useApiEntity<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

// Generic hook for list entity fetching
function useApiList<T>(
  fetchFn: () => Promise<T[]>,
  dependencies: any[] = []
): ApiListState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiListState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

// Restaurants hooks
export const useRestaurants = () => {
  return useApiList(restaurantsService.getAll);
};

export const useRestaurant = (id: number) => {
  return useApiEntity(() => restaurantsService.getById(id), [id]);
};

// Categories hooks
export const useCategories = () => {
  return useApiList(categoriesService.getAll);
};

export const useCategory = (id: number) => {
  return useApiEntity(() => categoriesService.getById(id), [id]);
};

// Dishes hooks
export const useDishes = () => {
  return useApiList(dishesService.getAll);
};

export const useDishesByRestaurant = (restaurantId: number) => {
  return useApiList(() => dishesService.getByRestaurant(restaurantId), [restaurantId]);
};

export const useDish = (id: number) => {
  return useApiEntity(() => dishesService.getById(id), [id]);
};

// Menus hooks
export const useMenus = () => {
  return useApiList(menusService.getAll);
};

export const useMenusByRestaurant = (restaurantId: number) => {
  return useApiList(() => menusService.getByRestaurant(restaurantId), [restaurantId]);
};

export const useMenu = (id: number) => {
  return useApiEntity(() => menusService.getById(id), [id]);
};

// Users hooks
export const useUsers = () => {
  return useApiList(usersService.getAll);
};

export const useUser = (id: number) => {
  return useApiEntity(() => usersService.getById(id), [id]);
};

// Location hooks
export const useCountries = () => {
  return useApiList(locationsService.getCountries);
};

export const useCities = () => {
  return useApiList(locationsService.getCities);
};

export const useCitiesByCountry = (countryId: number | null) => {
  return useApiList(
    () => countryId ? locationsService.getCitiesByCountry(countryId) : Promise.resolve([]),
    [countryId]
  );
};

export const useProvinces = () => {
  return useApiList(locationsService.getProvinces);
};

export const useProvincesByCity = (cityId: number | null) => {
  return useApiList(
    () => cityId ? locationsService.getProvincesByCity(cityId) : Promise.resolve([]),
    [cityId]
  );
};

export const useDistricts = () => {
  return useApiList(locationsService.getDistricts);
};

export const useDistrictsByProvince = (provinceId: number | null) => {
  return useApiList(
    () => provinceId ? locationsService.getDistrictsByProvince(provinceId) : Promise.resolve([]),
    [provinceId]
  );
};

// Restaurant locations hooks
export const useRestaurantLocations = () => {
  return useApiList(restaurantLocationsService.getAll);
};

export const useRestaurantLocationsByRestaurant = (restaurantId: number) => {
  return useApiList(() => restaurantLocationsService.getByRestaurant(restaurantId), [restaurantId]);
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useApiEntity(dashboardService.getStats);
};

export const useDashboardActivity = () => {
  return useApiList(dashboardService.getRecentActivity);
};

// Mutation hooks for CRUD operations
export const useRestaurantMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await restaurantsService.create(data);
      return result;
    } catch (err: any) {
      let message = 'Failed to create restaurant';

      // Provide more specific error messages based on HTTP status
      if (err.response) {
        switch (err.response.status) {
          case 400:
            message = 'Invalid restaurant data. Please check all fields.';
            break;
          case 401:
            message = 'Authentication required. Please log in again.';
            break;
          case 403:
            message = 'You do not have permission to create restaurants.';
            break;
          case 409:
            message = 'A restaurant with this name already exists.';
            break;
          case 422:
            message = 'Validation failed. Please check your input data.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = err.response.data?.message || 'Failed to create restaurant';
        }
      } else if (err.request) {
        message = 'Network error. Please check your connection.';
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Restaurant>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await restaurantsService.update(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update restaurant';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantsService.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete restaurant';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

export const useCategoryMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoriesService.create(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Category>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoriesService.update(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await categoriesService.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

export const useDishMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dishesService.create(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dish';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Dish>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dishesService.update(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dish';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await dishesService.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dish';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

export const useMenuMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await menusService.create(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create menu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Menu>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await menusService.update(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update menu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await menusService.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete menu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDish = useCallback(async (menuId: number, dishId: number) => {
    try {
      setLoading(true);
      setError(null);
      await menusService.addDish(menuId, dishId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add dish to menu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDish = useCallback(async (menuId: number, dishId: number) => {
    try {
      setLoading(true);
      setError(null);
      await menusService.removeDish(menuId, dishId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove dish from menu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, addDish, removeDish, loading, error };
};
