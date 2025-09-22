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

export interface RestaurantLocation {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  country_id: number;
  city_id: number;
  province_id: number;
  district_id: number;
  district: District;
  restaurant_id: number;
  restaurant?: Restaurant;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  category: Category;
  locations?: RestaurantLocation[];
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  path: string;
  method: string;
}
