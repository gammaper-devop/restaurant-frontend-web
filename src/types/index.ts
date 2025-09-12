export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface Country {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  country: Country;
}

export interface Province {
  id: number;
  name: string;
  city: City;
}

export interface District {
  id: number;
  name: string;
  province: Province;
}

export interface RestaurantLocation {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  district: District;
  restaurant?: Restaurant;
}

export interface Restaurant {
  id: number;
  name: string;
  logo?: string;
  phone?: string;
  category: Category;
  locations?: RestaurantLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price?: number;
  restaurant: Restaurant;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  restaurant: Restaurant;
  dishes?: Dish[];
  createdAt: string;
  updatedAt: string;
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
