import React, { useState, useEffect, useMemo } from 'react';
import { OperatingHoursUtils } from '../utils';
import type { OperatingHours, DayOfWeek } from '../types';
import { DAY_LABELS } from '../types';

interface OpenStatusIndicatorProps {
  operatingHours: OperatingHours;
  locationName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'card' | 'inline' | 'minimal';
  showNextChange?: boolean;
  showDetails?: boolean;
  refreshInterval?: number; // en ms, por defecto 60000 (1 minuto)
  onClick?: () => void;
  className?: string;
}

const OpenStatusIndicator: React.FC<OpenStatusIndicatorProps> = ({
  operatingHours,
  locationName,
  size = 'md',
  variant = 'badge',
  showNextChange = true,
  showDetails = false,
  refreshInterval = 60000, // 1 minuto por defecto
  onClick,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo actual cada intervalo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  // Calcular estado actual
  const status = useMemo(() => {
    const isOpen = OperatingHoursUtils.isCurrentlyOpen(operatingHours);
    const statusText = OperatingHoursUtils.getCurrentStatusText(operatingHours);
    const nextChangeText = showNextChange 
      ? OperatingHoursUtils.getNextStatusChangeText(operatingHours)
      : '';
    
    const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentTime.getDay()] as DayOfWeek;
    const todaySchedule = operatingHours[todayKey];
    
    return {
      isOpen,
      statusText,
      nextChangeText,
      todayKey,
      todaySchedule
    };
  }, [operatingHours, currentTime, showNextChange]);

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      padding: 'px-2 py-1',
      icon: 'w-3 h-3',
      spacing: 'space-x-1'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      spacing: 'space-x-2'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      padding: 'px-4 py-2',
      icon: 'w-5 h-5',
      spacing: 'space-x-2'
    },
    xl: {
      dot: 'w-5 h-5',
      text: 'text-lg',
      padding: 'px-6 py-3',
      icon: 'w-6 h-6',
      spacing: 'space-x-3'
    }
  };

  const config = sizeConfig[size];

  // Colores según estado
  const colorConfig = status.isOpen ? {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    border: 'border-green-200'
  } : {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    border: 'border-red-200'
  };

  // Renderizar icono de estado
  const StatusIcon = () => {
    if (status.isOpen) {
      return (
        <svg className={`${config.icon} ${colorConfig.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className={`${config.icon} ${colorConfig.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Renderizar punto animado
  const AnimatedDot = () => (
    <div className={`${config.dot} rounded-full ${colorConfig.dot} ${
      status.isOpen ? 'animate-pulse' : ''
    }`} />
  );

  // Componente base según variant
  const baseClasses = onClick ? 'cursor-pointer transition-all hover:shadow-md' : '';

  switch (variant) {
    case 'minimal':
      return (
        <div 
          className={`inline-flex items-center ${config.spacing} ${baseClasses} ${className}`}
          onClick={onClick}
        >
          <AnimatedDot />
          <span className={`font-medium ${config.text} ${colorConfig.text}`}>
            {status.statusText}
          </span>
        </div>
      );

    case 'inline':
      return (
        <div 
          className={`inline-flex items-center ${config.spacing} ${baseClasses} ${className}`}
          onClick={onClick}
        >
          <StatusIcon />
          <span className={`font-medium ${config.text} ${colorConfig.text}`}>
            {status.statusText}
          </span>
          {showNextChange && status.nextChangeText && (
            <>
              <span className={`${config.text} text-neutral-400`}>•</span>
              <span className={`${config.text} text-neutral-600`}>
                {status.nextChangeText}
              </span>
            </>
          )}
        </div>
      );

    case 'badge':
      return (
        <div 
          className={`inline-flex items-center ${config.spacing} ${config.padding} rounded-full ${
            colorConfig.bg
          } ${colorConfig.border} border ${baseClasses} ${className}`}
          onClick={onClick}
        >
          <AnimatedDot />
          <span className={`font-medium ${config.text} ${colorConfig.text}`}>
            {status.statusText}
          </span>
          {showNextChange && status.nextChangeText && size !== 'sm' && (
            <>
              <span className={`${config.text} ${colorConfig.text} opacity-50`}>•</span>
              <span className={`${config.text} ${colorConfig.text} opacity-75`}>
                {status.nextChangeText}
              </span>
            </>
          )}
        </div>
      );

    case 'card':
      return (
        <div 
          className={`bg-white rounded-xl border border-neutral-200 p-4 ${baseClasses} ${className}`}
          onClick={onClick}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center ${config.spacing}`}>
              <AnimatedDot />
              <h4 className={`font-semibold ${config.text} ${colorConfig.text}`}>
                {status.statusText}
              </h4>
            </div>
            <StatusIcon />
          </div>

          {locationName && (
            <p className={`${config.text} text-neutral-600 mb-2`}>
              {locationName}
            </p>
          )}

          {showDetails && (
            <div className="space-y-2">
              <div className={`flex items-center justify-between ${config.text} text-neutral-600`}>
                <span>Hoy ({DAY_LABELS[status.todayKey]}):</span>
                <span className="font-medium">
                  {status.todaySchedule.closed 
                    ? 'Cerrado' 
                    : `${OperatingHoursUtils.formatTime(status.todaySchedule.open)} - ${OperatingHoursUtils.formatTime(status.todaySchedule.close)}`
                  }
                </span>
              </div>
              
              {showNextChange && status.nextChangeText && (
                <div className={`${config.text} text-neutral-500 italic`}>
                  {status.nextChangeText}
                </div>
              )}
            </div>
          )}

          {/* Barra de progreso del día (opcional) */}
          {status.isOpen && !status.todaySchedule.closed && size !== 'sm' && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1 text-xs text-neutral-500">
                <span>Progreso del día</span>
                <span>{currentTime.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{
                    width: `${OperatingHoursUtils.getDayProgressPercentage(
                      status.todaySchedule, 
                      currentTime
                    )}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div 
          className={`inline-flex items-center ${config.spacing} ${config.padding} rounded-full ${
            colorConfig.bg
          } ${colorConfig.border} border ${baseClasses} ${className}`}
          onClick={onClick}
        >
          <AnimatedDot />
          <span className={`font-medium ${config.text} ${colorConfig.text}`}>
            {status.statusText}
          </span>
        </div>
      );
  }
};

// Hook personalizado para uso en otros componentes
export const useOpenStatus = (operatingHours: OperatingHours, refreshInterval: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  return useMemo(() => {
    const isOpen = OperatingHoursUtils.isCurrentlyOpen(operatingHours);
    const statusText = OperatingHoursUtils.getCurrentStatusText(operatingHours);
    const nextChangeText = OperatingHoursUtils.getNextStatusChangeText(operatingHours);
    
    const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentTime.getDay()] as DayOfWeek;
    const todaySchedule = operatingHours[todayKey];
    
    return {
      isOpen,
      statusText,
      nextChangeText,
      todayKey,
      todaySchedule,
      currentTime
    };
  }, [operatingHours, currentTime]);
};

// Componente de monitoreo en tiempo real para múltiples ubicaciones
interface MultiLocationStatusProps {
  locations: Array<{
    id: number;
    name: string;
    operatingHours: OperatingHours;
  }>;
  onLocationClick?: (locationId: number) => void;
  refreshInterval?: number;
}

export const MultiLocationStatusMonitor: React.FC<MultiLocationStatusProps> = ({
  locations,
  onLocationClick,
  refreshInterval = 60000
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  const locationStatuses = useMemo(() => {
    return locations.map(location => {
      const isOpen = OperatingHoursUtils.isCurrentlyOpen(location.operatingHours);
      const statusText = OperatingHoursUtils.getCurrentStatusText(location.operatingHours);
      
      return {
        ...location,
        isOpen,
        statusText
      };
    });
  }, [locations, currentTime]);

  const openCount = locationStatuses.filter(l => l.isOpen).length;
  const totalCount = locationStatuses.length;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">
          Estado de Ubicaciones
        </h3>
        <div className="text-sm text-neutral-600">
          {openCount} de {totalCount} abiertas
        </div>
      </div>

      <div className="space-y-3">
        {locationStatuses.map(location => (
          <div
            key={location.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              location.isOpen 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            } ${onLocationClick ? 'cursor-pointer hover:shadow-sm transition-all' : ''}`}
            onClick={() => onLocationClick?.(location.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                location.isOpen 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`} />
              <span className="font-medium text-neutral-900">
                {location.name}
              </span>
            </div>
            <span className={`text-sm font-medium ${
              location.isOpen ? 'text-green-700' : 'text-red-700'
            }`}>
              {location.statusText}
            </span>
          </div>
        ))}
      </div>

      {/* Resumen estadístico */}
      <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-green-500 rounded-full" />
              <span className="text-neutral-600">Abiertas: {openCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500 rounded-full" />
              <span className="text-neutral-600">Cerradas: {totalCount - openCount}</span>
            </div>
          </div>
          <span className="text-neutral-500 text-xs">
            Actualizado: {currentTime.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OpenStatusIndicator;