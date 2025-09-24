import React, { useState, useEffect } from 'react';
import { Button, Input, Toast } from './ui';
import { OperatingHoursUtils } from '../utils';
import type { 
  OperatingHours, 
  DaySchedule, 
  DayOfWeek
} from '../types';
import { DAY_LABELS } from '../types';

interface OperatingHoursManagerProps {
  operatingHours?: OperatingHours;
  onChange: (hours: OperatingHours) => void;
  locationName?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

const OperatingHoursManager: React.FC<OperatingHoursManagerProps> = ({
  operatingHours,
  onChange,
  locationName = 'Ubicación',
  disabled = false,
  showPreview = true
}) => {
  const [currentHours, setCurrentHours] = useState<OperatingHours>(
    operatingHours || OperatingHoursUtils.getDefaultOperatingHours()
  );
  const [errors, setErrors] = useState<Record<DayOfWeek, string[]>>({} as any);
  const [isPreviewMode, setIsPreviewMode] = useState(showPreview);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Actualizar cuando cambian las props
  useEffect(() => {
    if (operatingHours) {
      setCurrentHours(operatingHours);
    }
  }, [operatingHours]);

  // Validar horarios en tiempo real
  useEffect(() => {
    const newErrors: Record<DayOfWeek, string[]> = {} as any;
    
    Object.keys(currentHours).forEach(day => {
      const dayKey = day as DayOfWeek;
      const daySchedule = currentHours[dayKey];
      const dayErrors = OperatingHoursUtils.validateDaySchedule(daySchedule, DAY_LABELS[dayKey]);
      if (dayErrors.length > 0) {
        newErrors[dayKey] = dayErrors;
      }
    });
    
    setErrors(newErrors);
  }, [currentHours]);

  const handleDayChange = (day: DayOfWeek, field: keyof DaySchedule, value: string | boolean) => {
    const newHours = { ...currentHours };
    
    if (field === 'closed') {
      newHours[day] = {
        ...newHours[day],
        closed: value as boolean,
        // Si se marca como cerrado, usar horarios por defecto para evitar errores
        open: value ? '00:00' : newHours[day].open,
        close: value ? '00:00' : newHours[day].close
      };
    } else {
      newHours[day] = {
        ...newHours[day],
        [field]: value
      };
    }
    
    setCurrentHours(newHours);
    onChange(newHours);
  };

  const handleApplyToAll = (day: DayOfWeek) => {
    const templateSchedule = currentHours[day];
    const newHours = { ...currentHours };
    
    Object.keys(newHours).forEach(d => {
      const dayKey = d as DayOfWeek;
      if (dayKey !== day) {
        newHours[dayKey] = { ...templateSchedule };
      }
    });
    
    setCurrentHours(newHours);
    onChange(newHours);
    setShowSuccessToast(true);
  };

  const handleReset = () => {
    const defaultHours = OperatingHoursUtils.getDefaultOperatingHours();
    setCurrentHours(defaultHours);
    onChange(defaultHours);
  };

  const getCurrentStatus = () => {
    return OperatingHoursUtils.getCurrentStatusText(currentHours);
  };

  const isCurrentlyOpen = () => {
    return OperatingHoursUtils.isCurrentlyOpen(currentHours);
  };

  const hasErrors = Object.keys(errors).length > 0;

  if (isPreviewMode) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isCurrentlyOpen() ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <h3 className="text-lg font-semibold text-neutral-900">
              Horarios - {locationName}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCurrentlyOpen() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getCurrentStatus()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(false)}
              disabled={disabled}
            >
              Editar Horarios
            </Button>
          </div>
        </div>

        {/* Vista compacta de horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(currentHours).map(day => {
            const dayKey = day as DayOfWeek;
            const schedule = currentHours[dayKey];
            const isToday = new Date().getDay() === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayKey);
            
            return (
              <div
                key={day}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isToday ? 'bg-primary-50 border border-primary-200' : 'bg-neutral-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isToday && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                  <span className={`font-medium ${
                    isToday ? 'text-primary-900' : 'text-neutral-700'
                  }`}>
                    {DAY_LABELS[dayKey]}
                  </span>
                </div>
                <span className={`text-sm ${
                  schedule.closed 
                    ? 'text-red-600 font-medium' 
                    : isToday 
                      ? 'text-primary-800 font-medium'
                      : 'text-neutral-600'
                }`}>
                  {OperatingHoursUtils.formatDayScheduleForDisplay(schedule)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Gestión de Horarios
            </h3>
            <p className="text-sm text-neutral-600">
              {locationName} • Estado actual: <span className={`font-medium ${
                isCurrentlyOpen() ? 'text-green-600' : 'text-red-600'
              }`}>
                {getCurrentStatus()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Restaurar horarios por defecto"
          >
            Resetear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(true)}
          >
            Vista Previa
          </Button>
        </div>
      </div>

      {/* Advertencia de errores */}
      {hasErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-red-800">Errores en horarios</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([day, dayErrors]) => 
              dayErrors.map(error => (
                <li key={`${day}-${error}`}>• {error}</li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Editor de horarios por día */}
      <div className="space-y-4">
        {Object.keys(currentHours).map(day => {
          const dayKey = day as DayOfWeek;
          const schedule = currentHours[dayKey];
          const dayErrors = errors[dayKey] || [];
          const isToday = new Date().getDay() === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayKey);
          
          return (
            <div
              key={day}
              className={`p-4 rounded-xl border-2 transition-all ${
                isToday 
                  ? 'border-primary-200 bg-primary-50/50' 
                  : 'border-neutral-200 bg-neutral-50/50'
              } ${dayErrors.length > 0 ? 'border-red-300 bg-red-50/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {isToday && <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />}
                  <h4 className={`font-semibold ${
                    isToday ? 'text-primary-900' : 'text-neutral-900'
                  }`}>
                    {DAY_LABELS[dayKey]}
                  </h4>
                  {isToday && (
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplyToAll(dayKey)}
                    title={`Aplicar horario de ${DAY_LABELS[dayKey]} a todos los días`}
                    className="text-xs"
                  >
                    Aplicar a todos
                  </Button>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.closed}
                      onChange={(e) => handleDayChange(dayKey, 'closed', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      disabled={disabled}
                    />
                    <span className="text-sm font-medium text-red-700">Cerrado</span>
                  </label>
                </div>
              </div>

              {!schedule.closed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Hora de Apertura"
                    type="time"
                    value={schedule.open}
                    onChange={(e) => handleDayChange(dayKey, 'open', e.target.value)}
                    disabled={disabled}
                    variant="filled"
                  />
                  <Input
                    label="Hora de Cierre"
                    type="time"
                    value={schedule.close}
                    onChange={(e) => handleDayChange(dayKey, 'close', e.target.value)}
                    disabled={disabled}
                    variant="filled"
                  />
                </div>
              )}

              {schedule.closed && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">Cerrado todo el día</p>
                </div>
              )}

              {dayErrors.length > 0 && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <ul className="text-sm text-red-700 space-y-1">
                    {dayErrors.map(error => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información útil */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Consejos:</p>
            <ul className="space-y-1">
              <li>• Los horarios que cruzan medianoche son válidos (ej: 22:00 - 02:00)</li>
              <li>• Usa "Aplicar a todos" para horarios uniformes</li>
              <li>• El estado "Abierto/Cerrado" se calcula en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>

      <Toast
        message="Horarios aplicados a todos los días exitosamente"
        type="success"
        duration={3000}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};

export default OperatingHoursManager;