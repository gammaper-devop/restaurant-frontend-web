// Tipos compartidos para formularios de dishes

export interface DishFormData {
  name: string;
  description?: string;
  price: number; // Siempre number para el envío al backend
  image?: string;
  restaurant: {
    id: number;
  };
}

export interface DishFormInput {
  name: string;
  description?: string;
  price: number | string; // string | number para manejo interno del input
  image?: string;
  restaurant: {
    id: number;
  };
}