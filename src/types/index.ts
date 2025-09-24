export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  country: Country;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Province {
  id: number;
  name: string;
  city: City;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface District {
  id: number;
  name: string;
  province: Province;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Representa el horario para un solo día
 */
export interface DaySchedule {
  /** Hora de apertura en formato 24h (HH:MM) */
  open: string;
  /** Hora de cierre en formato 24h (HH:MM) */
  close: string;
  /** Si el local está cerrado todo el día */
  closed: boolean;
}

/**
 * Días de la semana como claves para OperatingHours
 */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Representa los horarios de operación semanales completos para una ubicación de restaurante
 */
export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

/**
 * Resultado de validación para horarios de operación
 */
export interface OperatingHoursValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Ubicación de un restaurante con su información geográfica completa
 */
export interface RestaurantLocation {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  district: District;
  restaurant: Restaurant;
  // Campo importante para horarios de operación (¡anteriormente faltante!)
  operatingHours: OperatingHours;
  // Campos calculados para estado operacional
  isCurrentlyOpen?: boolean;
  nextOpeningTime?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Restaurante con información completa
 */
export interface Restaurant {
  id: number;
  name: string;
  logo?: string;
  category: Category;
  locations?: RestaurantLocation[];
  dishes?: Dish[];
  menus?: Menu[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: Restaurant;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  file?: string;
  restaurant: Restaurant;
  dishes?: Dish[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ErrorLog {
  id: string;
  message: string;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'validation' | 'database' | 'external_api' | 'business_logic' | 'system' | 'network' | 'unknown';
  statusCode?: string;
  endpoint?: string;
  method?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  requestBody?: any;
  requestHeaders?: any;
  errorContext?: any;
  errorCode?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  timestamp: string;
  serviceName?: string;
  serviceVersion?: string;
  environmentInfo?: any;
}

// ============================================================================
// API TYPES - Tipado fuerte para respuestas del backend
// ============================================================================

/**
 * Respuesta estándar de la API del backend con metadatos completos
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode?: number;
  error?: string;
}

/**
 * Estado genérico para hooks de API
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Estado genérico para listas de API
 */
export interface ApiListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// FORM DATA TYPES - Para formularios del frontend
// ============================================================================

/**
 * Datos de formulario para crear/editar restaurante
 * (Sin campos de backend que no existen)
 */
export interface RestaurantFormData {
  name: string;
  logo?: string;
  categoryId: number;
  active: boolean;
}

/**
 * Datos de formulario para crear/editar ubicación de restaurante
 * (Alineado con estructura real del backend)
 */
export interface RestaurantLocationFormData {
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  districtId: number;
  restaurantId: number;
  operatingHours?: OperatingHours;
}

// ============================================================================
// DTO TYPES - Para comunicación con API
// ============================================================================

/**
 * DTO para crear restaurante (estructura que espera el backend)
 */
export interface CreateRestaurantDTO {
  name: string;
  logo?: string;
  category: number; // Backend espera ID numérico
}

/**
 * DTO para crear ubicación de restaurante
 */
export interface CreateRestaurantLocationDTO {
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  district: number; // Backend espera ID numérico
  restaurant: number; // Backend espera ID numérico
  operatingHours?: OperatingHours;
}

/**
 * DTO para actualizar solo horarios de operación
 */
export interface UpdateOperatingHoursDTO {
  operatingHours: OperatingHours;
}

// ============================================================================
// UTILITY TYPES - Para diferentes estados y operaciones
// ============================================================================

/**
 * Tipo para consultas de búsqueda por proximidad
 */
export interface NearbyRestaurantQuery {
  lat: number;
  lng: number;
  radius?: number; // en kilómetros
}

/**
 * Respuesta de búsqueda por proximidad
 */
export interface NearbyRestaurantResult extends RestaurantLocation {
  distance: number; // distancia en kilómetros
}

/**
 * Estado operacional de una ubicación
 */
export interface LocationOperationalStatus {
  locationId: number;
  isCurrentlyOpen: boolean;
  currentTime: string;
  nextOpeningTime?: string;
}

/**
 * Verificación de horario específico
 */
export interface LocationTimeCheck {
  locationId: number;
  checkDateTime: string;
  isOpen: boolean;
}

/**
 * Constantes para horarios predeterminados
 */
export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '22:00', closed: false },
  saturday: { open: '10:00', close: '22:00', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false }
};

/**
 * Mapeo de días de la semana para UI
 */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};
