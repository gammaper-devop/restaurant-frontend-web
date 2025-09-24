import { useState, useEffect, useCallback, useMemo } from 'react';
import { restaurantLocationsService } from '../services/api';
import { OperatingHoursUtils } from '../utils';
import type { 
  OperatingHours, 
  RestaurantLocation,
  UpdateOperatingHoursDTO
} from '../types';

/**
 * Hook para gestionar horarios de operación de una ubicación específica
 */
export const useOperatingHours = (locationId: number | null) => {
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Fetch operating hours from the location
  const fetchOperatingHours = useCallback(async () => {
    if (!locationId) return;

    try {
      setLoading(true);
      setError(null);
      
      const location = await restaurantLocationsService.getById(locationId);
      setOperatingHours(location.operatingHours || OperatingHoursUtils.getDefaultOperatingHours());
      setLastFetch(Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch operating hours';
      setError(message);
      // Set default hours on error
      setOperatingHours(OperatingHoursUtils.getDefaultOperatingHours());
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  // Update operating hours
  const updateOperatingHours = useCallback(async (newHours: OperatingHours) => {
    if (!locationId) {
      throw new Error('Location ID is required to update operating hours');
    }

    try {
      setLoading(true);
      setError(null);

      const updateData: UpdateOperatingHoursDTO = {
        operatingHours: newHours
      };

      const updatedLocation = await restaurantLocationsService.updateOperatingHours(locationId, updateData);
      setOperatingHours(updatedLocation.operatingHours);
      setLastFetch(Date.now());
      
      return updatedLocation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update operating hours';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  // Initialize hours for new locations (without fetching from API)
  const initializeHours = useCallback((hours?: OperatingHours) => {
    setOperatingHours(hours || OperatingHoursUtils.getDefaultOperatingHours());
    setError(null);
  }, []);

  // Reset hours to defaults
  const resetToDefaults = useCallback(() => {
    setOperatingHours(OperatingHoursUtils.getDefaultOperatingHours());
    setError(null);
  }, []);

  // Set hours locally (for form editing)
  const setLocalHours = useCallback((hours: OperatingHours) => {
    setOperatingHours(hours);
  }, []);

  // Fetch data when locationId changes
  useEffect(() => {
    if (locationId) {
      fetchOperatingHours();
    } else {
      // Reset state when no location is selected
      setOperatingHours(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchOperatingHours]);

  // Calculate current operational status
  const operationalStatus = useMemo(() => {
    if (!operatingHours) {
      return {
        isOpen: false,
        statusText: 'Horarios no disponibles',
        nextChangeText: '',
        todayKey: OperatingHoursUtils.getCurrentDayKey()
      };
    }

    return {
      isOpen: OperatingHoursUtils.isCurrentlyOpen(operatingHours),
      statusText: OperatingHoursUtils.getCurrentStatusText(operatingHours),
      nextChangeText: OperatingHoursUtils.getNextStatusChangeText(operatingHours),
      todayKey: OperatingHoursUtils.getCurrentDayKey()
    };
  }, [operatingHours]);

  return {
    operatingHours,
    loading,
    error,
    lastFetch,
    operationalStatus,
    
    // Actions
    updateOperatingHours,
    fetchOperatingHours,
    initializeHours,
    resetToDefaults,
    setLocalHours,
    
    // Computed values
    isCurrentlyOpen: operationalStatus.isOpen,
    currentStatusText: operationalStatus.statusText,
    nextStatusChange: operationalStatus.nextChangeText
  };
};

/**
 * Hook para múltiples ubicaciones con estado operacional
 */
export const useMultiLocationOperatingHours = (locations: RestaurantLocation[]) => {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Force refresh every minute to keep status current
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const locationStatuses = useMemo(() => {
    return locations.map(location => {
      const hours = location.operatingHours || OperatingHoursUtils.getDefaultOperatingHours();
      
      return {
        ...location,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(hours),
        statusText: OperatingHoursUtils.getCurrentStatusText(hours),
        nextChangeText: OperatingHoursUtils.getNextStatusChangeText(hours)
      };
    });
  }, [locations, lastUpdate]); // lastUpdate forces recalculation

  const summaryStats = useMemo(() => {
    const openCount = locationStatuses.filter(l => l.isCurrentlyOpen).length;
    const totalCount = locationStatuses.length;
    
    return {
      openCount,
      totalCount,
      closedCount: totalCount - openCount,
      openPercentage: totalCount > 0 ? Math.round((openCount / totalCount) * 100) : 0
    };
  }, [locationStatuses]);

  return {
    locationStatuses,
    summaryStats,
    lastUpdate
  };
};

export default useOperatingHours;