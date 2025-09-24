import { 
  OperatingHours, 
  DaySchedule, 
  DayOfWeek, 
  OperatingHoursValidationResult,
  DEFAULT_OPERATING_HOURS 
} from '../types';

/**
 * Utilidades para manejo de horarios de operación
 * Implementa lógica de negocio para validación, cálculos y transformaciones
 * de horarios operacionales alineada con el backend
 */
export class OperatingHoursUtils {
  private static readonly TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  private static readonly DAYS: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  /**
   * Valida el formato de una cadena de tiempo (HH:MM)
   */
  static isValidTimeFormat(time: string): boolean {
    return this.TIME_PATTERN.test(time);
  }

  /**
   * Valida un horario de un día específico
   */
  static validateDaySchedule(daySchedule: DaySchedule, dayName: string): string[] {
    const errors: string[] = [];

    if (daySchedule.closed) {
      // Si está cerrado, no necesitamos validar horarios de apertura/cierre
      return errors;
    }

    if (!this.isValidTimeFormat(daySchedule.open)) {
      errors.push(`${dayName}: Formato de hora de apertura inválido. Use HH:MM (formato 24h)`);
    }

    if (!this.isValidTimeFormat(daySchedule.close)) {
      errors.push(`${dayName}: Formato de hora de cierre inválido. Use HH:MM (formato 24h)`);
    }

    if (this.isValidTimeFormat(daySchedule.open) && this.isValidTimeFormat(daySchedule.close)) {
      const openMinutes = this.timeToMinutes(daySchedule.open);
      const closeMinutes = this.timeToMinutes(daySchedule.close);

      // Permitir hora de cierre antes que apertura (cruzar medianoche)
      // Pero ambos tiempos deben ser diferentes
      if (openMinutes === closeMinutes) {
        errors.push(`${dayName}: Las horas de apertura y cierre no pueden ser iguales`);
      }
    }

    return errors;
  }

  /**
   * Valida horarios de operación completos
   */
  static validateOperatingHours(operatingHours: OperatingHours): OperatingHoursValidationResult {
    const errors: string[] = [];

    // Verificar que todos los días requeridos estén presentes
    for (const day of this.DAYS) {
      if (!operatingHours[day]) {
        errors.push(`Falta horario para ${day}`);
        continue;
      }

      const dayErrors = this.validateDaySchedule(operatingHours[day], day);
      errors.push(...dayErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verifica si una ubicación está actualmente abierta basado en horarios de operación
   */
  static isCurrentlyOpen(operatingHours: OperatingHours): boolean {
    const now = new Date();
    return this.isOpenAt(operatingHours, now);
  }

  /**
   * Verifica si una ubicación está abierta en una fecha/hora específica
   */
  static isOpenAt(operatingHours: OperatingHours, dateTime: Date): boolean {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateTime.getDay()] as DayOfWeek;
    
    const daySchedule = operatingHours[dayOfWeek];
    
    if (daySchedule.closed) {
      return false;
    }

    const currentMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
    const openMinutes = this.timeToMinutes(daySchedule.open);
    const closeMinutes = this.timeToMinutes(daySchedule.close);

    // Manejar horarios normales (ej: 09:00 - 22:00)
    if (openMinutes < closeMinutes) {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }

    // Manejar horarios que cruzan medianoche (ej: 22:00 - 02:00)
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }

  /**
   * Obtiene la próxima hora de apertura para una ubicación
   */
  static getNextOpeningTime(operatingHours: OperatingHours, fromDateTime?: Date): Date | null {
    const startDate = fromDateTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Verificar hasta 7 días desde ahora
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = dayNames[checkDate.getDay()] as DayOfWeek;
      const daySchedule = operatingHours[dayOfWeek];
      
      if (!daySchedule.closed) {
        const openingTime = new Date(checkDate);
        const [hoursStr, minutesStr] = daySchedule.open.split(':');
        const hours = parseInt(hoursStr || '0', 10);
        const minutes = parseInt(minutesStr || '0', 10);
        openingTime.setHours(hours, minutes, 0, 0);
        
        // Si es hoy, asegurarse que la hora de apertura sea en el futuro
        if (i === 0 && openingTime <= startDate) {
          continue;
        }
        
        return openingTime;
      }
    }
    
    return null; // Cerrado los próximos 7 días
  }


  /**
   * Convierte minutos desde medianoche a cadena de tiempo (HH:MM)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Crea horarios de operación predeterminados
   */
  static getDefaultOperatingHours(): OperatingHours {
    return JSON.parse(JSON.stringify(DEFAULT_OPERATING_HOURS));
  }

  /**
   * Sanitiza y normaliza entrada de horarios de operación
   */
  static sanitizeOperatingHours(input: Partial<OperatingHours>): OperatingHours {
    const result = this.getDefaultOperatingHours();
    
    for (const day of this.DAYS) {
      if (input[day]) {
        const dayInput = input[day]!;
        result[day] = {
          open: dayInput.open || result[day].open,
          close: dayInput.close || result[day].close,
          closed: Boolean(dayInput.closed)
        };
      }
    }
    
    return result;
  }

  /**
   * Formatea horarios para mostrar en UI
   */
  static formatDayScheduleForDisplay(daySchedule: DaySchedule): string {
    if (daySchedule.closed) {
      return 'Cerrado';
    }

    return `${daySchedule.open} - ${daySchedule.close}`;
  }

  /**
   * Obtiene el estado actual como string legible
   */
  static getCurrentStatusText(operatingHours: OperatingHours): string {
    const isOpen = this.isCurrentlyOpen(operatingHours);
    
    if (isOpen) {
      return 'Abierto ahora';
    }

    const nextOpening = this.getNextOpeningTime(operatingHours);
    if (nextOpening) {
      const now = new Date();
      const diffHours = Math.ceil((nextOpening.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `Abre en ${diffHours} horas`;
      } else {
        return `Abre el ${nextOpening.toLocaleDateString('es-ES')}`;
      }
    }

    return 'Cerrado permanentemente';
  }

  /**
   * Convierte horarios de operación a formato para enviar al backend
   */
  static toBackendFormat(operatingHours: OperatingHours): OperatingHours {
    // El backend ya espera el formato correcto, pero podemos hacer validación adicional
    const validated = this.validateOperatingHours(operatingHours);
    if (!validated.isValid) {
      throw new Error(`Horarios inválidos: ${validated.errors.join(', ')}`);
    }
    
    return operatingHours;
  }

  /**
   * Convierte respuesta del backend a formato del frontend
   */
  static fromBackendFormat(backendHours: any): OperatingHours {
    // El backend devuelve el formato correcto, pero validamos por seguridad
    if (!backendHours || typeof backendHours !== 'object') {
      return this.getDefaultOperatingHours();
    }

    return this.sanitizeOperatingHours(backendHours);
  }

  /**
   * Obtiene el texto del próximo cambio de estado (apertura/cierre)
   */
  static getNextStatusChangeText(operatingHours: OperatingHours): string {
    const now = new Date();
    const isOpen = this.isCurrentlyOpen(operatingHours);
    
    if (isOpen) {
      // Si está abierto, buscar la próxima hora de cierre
      const nextClose = this.getNextClosingTime(operatingHours, now);
      if (nextClose) {
        const diffMinutes = Math.round((nextClose.getTime() - now.getTime()) / (1000 * 60));
        if (diffMinutes < 60) {
          return `Cierra en ${diffMinutes} min`;
        } else {
          const hours = Math.round(diffMinutes / 60);
          return `Cierra en ${hours}h`;
        }
      }
      return '';
    } else {
      // Si está cerrado, buscar la próxima hora de apertura
      const nextOpen = this.getNextOpeningTime(operatingHours, now);
      if (nextOpen) {
        const diffMinutes = Math.round((nextOpen.getTime() - now.getTime()) / (1000 * 60));
        if (diffMinutes < 60) {
          return `Abre en ${diffMinutes} min`;
        } else if (diffMinutes < 24 * 60) {
          const hours = Math.round(diffMinutes / 60);
          return `Abre en ${hours}h`;
        } else {
          const days = Math.round(diffMinutes / (24 * 60));
          return `Abre en ${days}d`;
        }
      }
      return 'Cerrado indefinidamente';
    }
  }

  /**
   * Obtiene la próxima hora de cierre
   */
  static getNextClosingTime(operatingHours: OperatingHours, fromDateTime?: Date): Date | null {
    const startDate = fromDateTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayOfWeek = dayNames[startDate.getDay()] as DayOfWeek;
    const todaySchedule = operatingHours[currentDayOfWeek];
    
    // Verificar si hoy está abierto y aún no ha cerrado
    if (!todaySchedule.closed) {
      const currentMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const openMinutes = this.timeToMinutes(todaySchedule.open);
      const closeMinutes = this.timeToMinutes(todaySchedule.close);
      
      if (openMinutes < closeMinutes) {
        // Horario normal (no cruza medianoche)
        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
          const closeTime = new Date(startDate);
          const [hoursStr, minutesStr] = todaySchedule.close.split(':');
          const hours = parseInt(hoursStr || '0', 10);
          const minutes = parseInt(minutesStr || '0', 10);
          closeTime.setHours(hours, minutes, 0, 0);
          return closeTime;
        }
      } else {
        // Horario que cruza medianoche
        if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
          const closeTime = new Date(startDate);
          const [hoursStr, minutesStr] = todaySchedule.close.split(':');
          const hours = parseInt(hoursStr || '0', 10);
          const minutes = parseInt(minutesStr || '0', 10);
          
          if (currentMinutes >= openMinutes) {
            // Estamos después de la apertura, cierra mañana
            closeTime.setDate(closeTime.getDate() + 1);
          }
          
          closeTime.setHours(hours, minutes, 0, 0);
          return closeTime;
        }
      }
    }
    
    // Buscar en los próximos días
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = dayNames[checkDate.getDay()] as DayOfWeek;
      const daySchedule = operatingHours[dayOfWeek];
      
      if (!daySchedule.closed) {
        const closeTime = new Date(checkDate);
        const [hoursStr, minutesStr] = daySchedule.close.split(':');
        const hours = parseInt(hoursStr || '0', 10);
        const minutes = parseInt(minutesStr || '0', 10);
        
        const openMinutes = this.timeToMinutes(daySchedule.open);
        const closeMinutes = this.timeToMinutes(daySchedule.close);
        
        if (openMinutes >= closeMinutes) {
          // Cruza medianoche, cierre es al día siguiente
          closeTime.setDate(closeTime.getDate() + 1);
        }
        
        closeTime.setHours(hours, minutes, 0, 0);
        return closeTime;
      }
    }
    
    return null;
  }

  /**
   * Formatea una hora en formato HH:MM a formato legible
   */
  static formatTime(time: string): string {
    if (!time || !this.isValidTimeFormat(time)) {
      return time;
    }
    
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    
    // Formato 24 horas
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  }

  /**
   * Obtiene el día actual como DayOfWeek
   */
  static getCurrentDayKey(): DayOfWeek {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[new Date().getDay()] as DayOfWeek;
  }

  /**
   * Calcula el porcentaje de progreso del día para una ubicación abierta
   */
  static getDayProgressPercentage(daySchedule: DaySchedule, currentTime: Date): number {
    if (daySchedule.closed) {
      return 0;
    }

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const openMinutes = this.timeToMinutes(daySchedule.open);
    const closeMinutes = this.timeToMinutes(daySchedule.close);

    if (openMinutes < closeMinutes) {
      // Horario normal
      if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
        return 0; // Fuera del horario
      }
      const totalMinutes = closeMinutes - openMinutes;
      const elapsedMinutes = currentMinutes - openMinutes;
      return Math.max(0, Math.min(100, (elapsedMinutes / totalMinutes) * 100));
    } else {
      // Horario que cruza medianoche
      if (currentMinutes >= openMinutes) {
        // Estamos en la primera parte (después de apertura)
        const totalMinutes = (24 * 60 - openMinutes) + closeMinutes;
        const elapsedMinutes = currentMinutes - openMinutes;
        return Math.min(100, (elapsedMinutes / totalMinutes) * 100);
      } else if (currentMinutes <= closeMinutes) {
        // Estamos en la segunda parte (antes de cierre)
        const totalMinutes = (24 * 60 - openMinutes) + closeMinutes;
        const elapsedMinutes = (24 * 60 - openMinutes) + currentMinutes;
        return Math.min(100, (elapsedMinutes / totalMinutes) * 100);
      }
      return 0; // Fuera del horario
    }
  }

  /**
   * Calcula y formatea la duración total de operación para un día
   */
  static calculateDurationText(openTime: string, closeTime: string): string {
    const openMinutes = this.timeToMinutes(openTime);
    const closeMinutes = this.timeToMinutes(closeTime);
    
    let durationMinutes: number;
    
    if (openMinutes < closeMinutes) {
      // Horario normal
      durationMinutes = closeMinutes - openMinutes;
    } else {
      // Horario que cruza medianoche
      durationMinutes = (24 * 60 - openMinutes) + closeMinutes;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  /**
   * Exporta el método timeToMinutes como público para uso en componentes
   */
  static timeToMinutes(time: string): number {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr || '0', 10);
    const minutes = parseInt(minutesStr || '0', 10);
    return hours * 60 + minutes;
  }
}
