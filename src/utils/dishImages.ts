// Importar imágenes desde assets
import arrozConMariscos from '../assets/arroz-con-mariscos.jpg';

// Exportar para uso en componentes
export const dishImages = {
  'arroz-con-mariscos': arrozConMariscos,
  // Agregar más imágenes aquí
};

// Función helper para obtener imagen por nombre
export const getDishImage = (imageName: string): string => {
  return dishImages[imageName as keyof typeof dishImages] || '';
};