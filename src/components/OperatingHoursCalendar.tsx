import React, { useState, useMemo } from 'react';
import { OperatingHoursUtils } from '../utils';
import type { OperatingHours, DayOfWeek, DaySchedule } from '../types';
import { DAY_LABELS } from '../types';

interface OperatingHoursCalendarProps {
  operatingHours: OperatingHours;
  locationName?: string;
  highlightCurrent?: boolean;
  showLegend?: boolean;
  compact?: boolean;
  onDayClick?: (day: DayOfWeek, schedule: DaySchedule) => void;
}

const OperatingHoursCalendar: React.FC<OperatingHoursCalendarProps> = ({
  operatingHours,
  locationName,
  highlightCurrent = true,
  showLegend = true,
  compact = false,
  onDayClick
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  // Obtener información de estado actual
  const currentStatus = useMemo(() => {
    const isOpen = OperatingHoursUtils.isCurrentlyOpen(operatingHours);
    const statusText = OperatingHoursUtils.getCurrentStatusText(operatingHours);
    const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] as DayOfWeek;
    
    return { isOpen, statusText, todayKey };
  }, [operatingHours]);

  // Configuración visual por día
  const getDayVisualConfig = (day: DayOfWeek, schedule: DaySchedule) => {
    const isToday = day === currentStatus.todayKey;
    const isClosed = schedule.closed;
    
    let bgColor = 'bg-neutral-50';
    let borderColor = 'border-neutral-200';
    let textColor = 'text-neutral-700';
    let statusColor = 'text-neutral-500';

    if (isToday && highlightCurrent) {
      if (currentStatus.isOpen && !isClosed) {
        bgColor = 'bg-green-50';
        borderColor = 'border-green-200';
        textColor = 'text-green-900';
        statusColor = 'text-green-700';
      } else {
        bgColor = 'bg-orange-50';
        borderColor = 'border-orange-200';
        textColor = 'text-orange-900';
        statusColor = 'text-orange-700';
      }
    } else if (isClosed) {
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-700';
      statusColor = 'text-red-600';
    }

    return { bgColor, borderColor, textColor, statusColor, isToday };
  };

  // Formatear horario para mostrar en el calendario
  const formatScheduleForCalendar = (schedule: DaySchedule): string => {
    if (schedule.closed) return 'Cerrado';
    
    const openTime = OperatingHoursUtils.formatTime(schedule.open);
    const closeTime = OperatingHoursUtils.formatTime(schedule.close);
    
    return `${openTime} - ${closeTime}`;
  };

  // Crear barras visuales de horarios
  const createHourBars = (schedule: DaySchedule) => {
    if (schedule.closed) {
      return (
        <div className="w-full h-2 bg-red-200 rounded-full flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-400 rounded-full" />
        </div>
      );
    }

    const openMinutes = OperatingHoursUtils.timeToMinutes(schedule.open);
    const closeMinutes = OperatingHoursUtils.timeToMinutes(schedule.close);
    
    // Si cruza medianoche, ajustar
    const actualCloseMinutes = closeMinutes < openMinutes ? closeMinutes + 24 * 60 : closeMinutes;
    
    const startPercent = (openMinutes / (24 * 60)) * 100;
    const durationPercent = ((actualCloseMinutes - openMinutes) / (24 * 60)) * 100;

    return (
      <div className="w-full h-2 bg-neutral-200 rounded-full relative overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
          style={{
            left: `${startPercent}%`,
            width: `${Math.min(durationPercent, 100 - startPercent)}%`
          }}
        />
        {/* Si cruza medianoche, añadir segunda barra */}
        {closeMinutes < openMinutes && (
          <div 
            className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
            style={{
              left: '0%',
              width: `${(closeMinutes / (24 * 60)) * 100}%`
            }}
          />
        )}
      </div>
    );
  };

  const handleDayClick = (day: DayOfWeek, schedule: DaySchedule) => {
    setSelectedDay(selectedDay === day ? null : day);
    onDayClick?.(day, schedule);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-neutral-900">Horarios semanales</h4>
          {highlightCurrent && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentStatus.isOpen 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {currentStatus.statusText}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {Object.keys(operatingHours).map(day => {
            const dayKey = day as DayOfWeek;
            const schedule = operatingHours[dayKey];
            const config = getDayVisualConfig(dayKey, schedule);
            
            return (
              <div
                key={day}
                className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer hover:shadow-sm ${
                  config.bgColor
                } ${config.borderColor} border`}
                onClick={() => handleDayClick(dayKey, schedule)}
              >
                <div className="flex items-center space-x-2">
                  {config.isToday && <div className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {DAY_LABELS[dayKey]}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${config.statusColor}`}>
                    {formatScheduleForCalendar(schedule)}
                  </span>
                  <div className="w-12">
                    {createHourBars(schedule)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Calendario de Horarios
              </h3>
              {locationName && (
                <p className="text-sm text-neutral-600">{locationName}</p>
              )}
            </div>
          </div>

          {highlightCurrent && (
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                currentStatus.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  currentStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">{currentStatus.statusText}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendario principal */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {Object.keys(operatingHours).map(day => {
            const dayKey = day as DayOfWeek;
            const schedule = operatingHours[dayKey];
            const config = getDayVisualConfig(dayKey, schedule);
            const isSelected = selectedDay === dayKey;
            
            return (
              <div
                key={day}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'transform scale-105' : 'hover:transform hover:scale-102'
                }`}
                onClick={() => handleDayClick(dayKey, schedule)}
              >
                <div className={`p-4 rounded-xl border-2 ${
                  isSelected 
                    ? 'border-blue-300 shadow-lg' 
                    : `${config.borderColor} group-hover:border-blue-200`
                } ${config.bgColor} transition-all duration-200`}>
                  
                  {/* Header del día */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {config.isToday && (
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      )}
                      <h4 className={`font-semibold ${config.textColor}`}>
                        {DAY_LABELS[dayKey]}
                      </h4>
                    </div>
                    {config.isToday && (
                      <span className="text-xs px-2 py-1 bg-current/10 rounded-full font-medium">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Información de horario */}
                  <div className="space-y-3">
                    <div className={`text-sm ${config.statusColor} font-medium text-center`}>
                      {formatScheduleForCalendar(schedule)}
                    </div>
                    
                    {/* Barra visual de horarios */}
                    <div className="space-y-1">
                      {createHourBars(schedule)}
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>24:00</span>
                      </div>
                    </div>

                    {/* Estado especial para día actual */}
                    {config.isToday && highlightCurrent && (
                      <div className={`text-center p-2 rounded-lg ${
                        currentStatus.isOpen && !schedule.closed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        <div className="text-xs font-medium">
                          {currentStatus.isOpen && !schedule.closed ? '🟢 Abierto ahora' : '🟡 Cerrado ahora'}
                        </div>
                        {!schedule.closed && (
                          <div className="text-xs mt-1 opacity-75">
                            {OperatingHoursUtils.getNextStatusChangeText(operatingHours)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="px-6 pb-6">
          <div className="bg-neutral-50 rounded-lg p-4">
            <h5 className="font-medium text-neutral-900 mb-3">Leyenda</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                <span className="text-neutral-600">Horario de operación</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-red-200 rounded-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-red-400 rounded-full" />
                  </div>
                </div>
                <span className="text-neutral-600">Día cerrado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-neutral-600">Día actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-300 rounded" />
                <span className="text-neutral-600">Día seleccionado</span>
              </div>
            </div>
            
            {/* Tips adicionales */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Tip:</p>
                  <p>Las barras verdes muestran las horas de operación en una escala de 24 horas. Los horarios que cruzan medianoche se muestran en dos segmentos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle para día seleccionado */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-neutral-900">
                {DAY_LABELS[selectedDay]}
              </h4>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-2">
                  {formatScheduleForCalendar(operatingHours[selectedDay])}
                </div>
                {selectedDay === currentStatus.todayKey && highlightCurrent && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${
                    currentStatus.isOpen && !operatingHours[selectedDay].closed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      currentStatus.isOpen && !operatingHours[selectedDay].closed 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{currentStatus.statusText}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="mb-2">
                  {createHourBars(operatingHours[selectedDay])}
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Medianoche</span>
                  <span>Mediodía</span>
                  <span>Medianoche</span>
                </div>
              </div>

              {!operatingHours[selectedDay].closed && (
                <div className="text-sm text-neutral-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Hora de apertura:</span>
                    <span className="font-medium">
                      {OperatingHoursUtils.formatTime(operatingHours[selectedDay].open)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora de cierre:</span>
                    <span className="font-medium">
                      {OperatingHoursUtils.formatTime(operatingHours[selectedDay].close)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duración total:</span>
                    <span className="font-medium">
                      {OperatingHoursUtils.calculateDurationText(
                        operatingHours[selectedDay].open, 
                        operatingHours[selectedDay].close
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatingHoursCalendar;