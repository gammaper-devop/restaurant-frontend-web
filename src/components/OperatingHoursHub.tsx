import React, { useState, useEffect } from 'react';
import OperatingHoursManager from './OperatingHoursManager';
import OperatingHoursCalendar from './OperatingHoursCalendar';
import OpenStatusIndicator, { MultiLocationStatusMonitor } from './OpenStatusIndicator';
import { Button, Modal, Toast } from './ui';
import { useOperatingHours } from '../hooks';
import { OperatingHoursUtils } from '../utils';
import type { 
  OperatingHours, 
  RestaurantLocation,
  DayOfWeek,
  DaySchedule
} from '../types';

interface OperatingHoursHubProps {
  location: RestaurantLocation;
  onHoursUpdate?: (hours: OperatingHours) => void;
  showAllViews?: boolean;
  defaultView?: 'manager' | 'calendar' | 'status';
  editable?: boolean;
}

const OperatingHoursHub: React.FC<OperatingHoursHubProps> = ({
  location,
  onHoursUpdate,
  showAllViews = true,
  defaultView = 'calendar',
  editable = true
}) => {
  const [currentView, setCurrentView] = useState(defaultView);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const {
    operatingHours,
    updateOperatingHours,
    loading: hookLoading,
    error: hookError
  } = useOperatingHours(location.id);

  const [localHours, setLocalHours] = useState<OperatingHours>(
    operatingHours || OperatingHoursUtils.getDefaultOperatingHours()
  );

  // Sincronizar con datos del hook
  useEffect(() => {
    if (operatingHours) {
      setLocalHours(operatingHours);
    }
  }, [operatingHours]);

  // Detectar cambios no guardados
  useEffect(() => {
    if (operatingHours) {
      const hasChanges = JSON.stringify(localHours) !== JSON.stringify(operatingHours);
      setUnsavedChanges(hasChanges);
    }
  }, [localHours, operatingHours]);

  const handleHoursChange = (hours: OperatingHours) => {
    setLocalHours(hours);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      await updateOperatingHours(localHours);
      onHoursUpdate?.(localHours);
      setUnsavedChanges(false);
      setShowSaveConfirm(false);
      setShowToast({
        message: 'Horarios actualizados exitosamente',
        type: 'success'
      });
    } catch (error) {
      setShowToast({
        message: 'Error al actualizar horarios',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    if (operatingHours) {
      setLocalHours(operatingHours);
      setUnsavedChanges(false);
    }
    setShowSaveConfirm(false);
  };

  const handleViewChange = (newView: typeof currentView) => {
    if (unsavedChanges && editable) {
      setShowSaveConfirm(true);
      return;
    }
    setCurrentView(newView);
  };

  const handleDayClick = (_day: DayOfWeek, _schedule: DaySchedule) => {
    if (editable) {
      setCurrentView('manager');
    }
  };

  const viewButtons = [
    {
      id: 'status' as const,
      label: 'Estado Actual',
      icon: '🔴',
      description: 'Indicador en tiempo real'
    },
    {
      id: 'calendar' as const,
      label: 'Calendario',
      icon: '📅',
      description: 'Vista semanal completa'
    },
    {
      id: 'manager' as const,
      label: 'Editor',
      icon: '⚙️',
      description: 'Gestión de horarios'
    }
  ];

  if (hookLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-neutral-600">Cargando horarios...</span>
        </div>
      </div>
    );
  }

  if (hookError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar horarios
          </h3>
          <p className="text-red-700 mb-4">{hookError}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Gestión de Horarios
                </h2>
                <p className="text-neutral-600">
                  {location.address} • {location.district?.name}
                </p>
              </div>
            </div>

            {/* Indicador de estado rápido */}
            <div className="hidden md:block">
              <OpenStatusIndicator
                operatingHours={localHours}
                variant="badge"
                size="md"
                showNextChange={true}
              />
            </div>
          </div>

          {/* Botones de guardado */}
          {editable && unsavedChanges && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={isLoading}
              >
                Descartar
              </Button>
              <Button
                onClick={handleSaveChanges}
                size="sm"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>

        {/* Navegación entre vistas */}
        {showAllViews && (
          <div className="grid grid-cols-3 gap-2">
            {viewButtons.map(button => (
              <button
                key={button.id}
                onClick={() => handleViewChange(button.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  currentView === button.id
                    ? 'border-primary-300 bg-primary-50 text-primary-900'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{button.icon}</span>
                  <span className="font-semibold text-sm">{button.label}</span>
                </div>
                <p className="text-xs text-neutral-600">{button.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Indicador de cambios no guardados */}
        {unsavedChanges && editable && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-orange-800 font-medium">
                Tienes cambios sin guardar
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="min-h-[500px]">
        {currentView === 'status' && (
          <div className="space-y-4">
            <OpenStatusIndicator
              operatingHours={localHours}
              locationName={location.address}
              variant="card"
              size="lg"
              showDetails={true}
              showNextChange={true}
            />
            
            {/* Vista compacta del calendario para contexto */}
            <OperatingHoursCalendar
              operatingHours={localHours}
              locationName={location.address}
              compact={true}
              showLegend={false}
              onDayClick={handleDayClick}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <OperatingHoursCalendar
            operatingHours={localHours}
            locationName={location.address}
            highlightCurrent={true}
            showLegend={true}
            onDayClick={handleDayClick}
          />
        )}

        {currentView === 'manager' && (
          <OperatingHoursManager
            operatingHours={localHours}
            locationName={location.address}
            onChange={handleHoursChange}
            disabled={!editable || isLoading}
            showPreview={false}
          />
        )}
      </div>

      {/* Modal de confirmación para cambios no guardados */}
      <Modal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Cambios no guardados"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Tienes cambios no guardados
              </h3>
              <p className="text-neutral-600 text-sm">
                Si cambias de vista sin guardar, perderás los cambios realizados en los horarios.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={handleDiscardChanges}
              disabled={isLoading}
            >
              Descartar cambios
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Guardando...' : 'Guardar y continuar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast notifications */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          duration={4000}
          isVisible={true}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

// Componente para vista de múltiples ubicaciones
interface MultiLocationHubProps {
  locations: RestaurantLocation[];
  onLocationSelect?: (location: RestaurantLocation) => void;
  refreshInterval?: number;
}

export const MultiLocationOperatingHoursHub: React.FC<MultiLocationHubProps> = ({
  locations,
  onLocationSelect,
  refreshInterval = 60000
}) => {
  const [selectedLocation, setSelectedLocation] = useState<RestaurantLocation | null>(null);

  const locationData = locations.map(location => ({
    id: location.id,
    name: location.address,
    operatingHours: location.operatingHours || OperatingHoursUtils.getDefaultOperatingHours()
  }));

  const handleLocationClick = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    if (location) {
      setSelectedLocation(location);
      onLocationSelect?.(location);
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitor de múltiples ubicaciones */}
      <MultiLocationStatusMonitor
        locations={locationData}
        onLocationClick={handleLocationClick}
        refreshInterval={refreshInterval}
      />

      {/* Hub detallado para ubicación seleccionada */}
      {selectedLocation && (
        <OperatingHoursHub
          location={selectedLocation}
          showAllViews={true}
          defaultView="calendar"
          editable={true}
        />
      )}
    </div>
  );
};

export default OperatingHoursHub;