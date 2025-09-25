import React, { useState } from 'react';
import {
  OperatingHoursManager,
  OperatingHoursCalendar,
  OpenStatusIndicator,
  OperatingHoursHub,
  MultiLocationOperatingHoursHub,
  useOpenStatus
} from '../components/operating-hours';
import type { OperatingHours, RestaurantLocation } from '../types';

// Datos de demostración
const demoOperatingHours: OperatingHours = {
  monday: { open: '08:00', close: '22:00', closed: false },
  tuesday: { open: '08:00', close: '22:00', closed: false },
  wednesday: { open: '08:00', close: '22:00', closed: false },
  thursday: { open: '08:00', close: '23:00', closed: false },
  friday: { open: '08:00', close: '23:30', closed: false },
  saturday: { open: '09:00', close: '23:30', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false }
};

const demoLocations: Partial<RestaurantLocation>[] = [
  {
    id: 1,
    address: 'Sucursal Centro - Av. Principal 123',
    operatingHours: demoOperatingHours,
    district: {
      id: 1,
      name: 'Centro Histórico',
      province: { 
        id: 1, 
        name: 'Lima',
        city: { id: 1, name: 'Lima', country: { id: 1, name: 'Perú', active: true, created_at: '', updated_at: '' }, active: true, created_at: '', updated_at: '' },
        active: true, 
        created_at: '', 
        updated_at: '' 
      },
      active: true,
      created_at: '',
      updated_at: ''
    },
    latitude: -12.046,
    longitude: -77.043,
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 2,
    address: 'Sucursal Norte - Av. Norte 456',
    operatingHours: {
      ...demoOperatingHours,
      sunday: { open: '00:00', close: '00:00', closed: true },
      saturday: { open: '10:00', close: '22:00', closed: false }
    },
    district: {
      id: 2,
      name: 'San Isidro',
      province: { 
        id: 1, 
        name: 'Lima',
        city: { id: 1, name: 'Lima', country: { id: 1, name: 'Perú', active: true, created_at: '', updated_at: '' }, active: true, created_at: '', updated_at: '' },
        active: true, 
        created_at: '', 
        updated_at: '' 
      },
      active: true,
      created_at: '',
      updated_at: ''
    },
    latitude: -12.096,
    longitude: -77.036,
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 3,
    address: 'Sucursal Sur - Av. Sur 789',
    operatingHours: {
      monday: { open: '07:00', close: '15:00', closed: false },
      tuesday: { open: '07:00', close: '15:00', closed: false },
      wednesday: { open: '07:00', close: '15:00', closed: false },
      thursday: { open: '07:00', close: '15:00', closed: false },
      friday: { open: '07:00', close: '15:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    district: {
      id: 3,
      name: 'Miraflores',
      province: { 
        id: 1, 
        name: 'Lima',
        city: { id: 1, name: 'Lima', country: { id: 1, name: 'Perú', active: true, created_at: '', updated_at: '' }, active: true, created_at: '', updated_at: '' },
        active: true, 
        created_at: '', 
        updated_at: '' 
      },
      active: true,
      created_at: '',
      updated_at: ''
    },
    latitude: -12.119,
    longitude: -77.030,
    active: true,
    created_at: '',
    updated_at: ''
  }
];

const OperatingHoursDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('hub');
  const [demoHours, setDemoHours] = useState<OperatingHours>(demoOperatingHours);
  const [selectedLocation, setSelectedLocation] = useState<RestaurantLocation>(demoLocations[0] as RestaurantLocation);

  // Usar el hook personalizado
  const status = useOpenStatus(demoHours, 5000); // Actualizar cada 5 segundos para demo

  const demoSections = [
    {
      id: 'hub',
      title: 'Operating Hours Hub',
      description: 'Componente integrador completo con todas las vistas'
    },
    {
      id: 'manager',
      title: 'Operating Hours Manager',
      description: 'Editor completo de horarios con validación'
    },
    {
      id: 'calendar',
      title: 'Operating Hours Calendar',
      description: 'Calendario visual semanal con barras de tiempo'
    },
    {
      id: 'status',
      title: 'Open Status Indicator',
      description: 'Indicadores de estado abierto/cerrado en tiempo real'
    },
    {
      id: 'multi',
      title: 'Multi-Location Hub',
      description: 'Monitoreo de múltiples ubicaciones'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Demostración de Componentes de Horarios
              </h1>
              <p className="text-neutral-600">
                Prueba todos los componentes visuales para gestionar horarios de operación
              </p>
            </div>
          </div>

          {/* Estado actual en tiempo real */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2">Estado Actual (Actualizado en tiempo real)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {status.isOpen ? 'ABIERTO' : 'CERRADO'}
                </div>
                <div className="text-sm text-neutral-600">{status.statusText}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-neutral-800 mb-1">
                  {status.currentTime.toLocaleTimeString('es-ES')}
                </div>
                <div className="text-sm text-neutral-600">Hora actual</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-neutral-800 mb-1">
                  {status.todayKey.charAt(0).toUpperCase() + status.todayKey.slice(1)}
                </div>
                <div className="text-sm text-neutral-600">Día actual</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600 mb-1">
                  {status.nextChangeText || 'No hay cambios próximos'}
                </div>
                <div className="text-sm text-neutral-600">Próximo cambio</div>
              </div>
            </div>
          </div>

          {/* Selector de demostración */}
          <div className="mt-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Selecciona una demostración:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {demoSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedDemo(section.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedDemo === section.id
                      ? 'border-blue-300 bg-blue-50 text-blue-900'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{section.title}</div>
                  <div className="text-xs text-neutral-600">{section.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido de demostración */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            {demoSections.find(s => s.id === selectedDemo)?.title}
          </h2>

          {/* Operating Hours Hub Demo */}
          {selectedDemo === 'hub' && (
            <OperatingHoursHub
              location={selectedLocation}
              onHoursUpdate={(hours) => setDemoHours(hours)}
              showAllViews={true}
              defaultView="calendar"
              editable={true}
            />
          )}

          {/* Operating Hours Manager Demo */}
          {selectedDemo === 'manager' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Funcionalidades del Manager</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Edición individual de cada día de la semana</li>
                  <li>• Validación en tiempo real de horarios</li>
                  <li>• Función "Aplicar a todos" para horarios uniformes</li>
                  <li>• Soporte para horarios que cruzan medianoche</li>
                  <li>• Indicador de estado actual en tiempo real</li>
                </ul>
              </div>

              <OperatingHoursManager
                operatingHours={demoHours}
                onChange={setDemoHours}
                locationName="Sucursal Demo"
                showPreview={false}
              />
            </div>
          )}

          {/* Operating Hours Calendar Demo */}
          {selectedDemo === 'calendar' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Vista Completa</h3>
                  <OperatingHoursCalendar
                    operatingHours={demoHours}
                    locationName="Sucursal Demo"
                    highlightCurrent={true}
                    showLegend={true}
onDayClick={(day, schedule) => {}}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Vista Compacta</h3>
                  <OperatingHoursCalendar
                    operatingHours={demoHours}
                    locationName="Sucursal Demo"
                    compact={true}
                    showLegend={false}
onDayClick={(day, schedule) => {}}
                  />
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">✨ Características del Calendario</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Barras visuales que muestran horarios de operación</li>
                      <li>• Destaque del día actual con estado en tiempo real</li>
                      <li>• Modal detallado al hacer click en cualquier día</li>
                      <li>• Soporte para horarios que cruzan medianoche</li>
                      <li>• Vista compacta para espacios reducidos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Open Status Indicator Demo */}
          {selectedDemo === 'status' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diferentes variantes */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Diferentes Variantes</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Badge (por defecto)</h4>
                      <OpenStatusIndicator
                        operatingHours={demoHours}
                        variant="badge"
                        size="md"
                        showNextChange={true}
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Minimal</h4>
                      <OpenStatusIndicator
                        operatingHours={demoHours}
                        variant="minimal"
                        size="md"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Inline</h4>
                      <OpenStatusIndicator
                        operatingHours={demoHours}
                        variant="inline"
                        size="md"
                        showNextChange={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Card variant */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Card con detalles</h3>
                  <OpenStatusIndicator
                    operatingHours={demoHours}
                    locationName="Sucursal Demo"
                    variant="card"
                    size="lg"
                    showDetails={true}
                    showNextChange={true}
                  />
                </div>
              </div>

              {/* Diferentes tamaños */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Diferentes Tamaños</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <OpenStatusIndicator operatingHours={demoHours} size="sm" />
                  <OpenStatusIndicator operatingHours={demoHours} size="md" />
                  <OpenStatusIndicator operatingHours={demoHours} size="lg" />
                  <OpenStatusIndicator operatingHours={demoHours} size="xl" />
                </div>
              </div>
            </div>
          )}

          {/* Multi-Location Demo */}
          {selectedDemo === 'multi' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🏢 Multi-Location Management</h3>
                <p className="text-sm text-purple-800">
                  Gestiona horarios de múltiples ubicaciones desde una sola interfaz. 
                  Haz click en cualquier ubicación para ver sus detalles completos.
                </p>
              </div>

              <MultiLocationOperatingHoursHub
                locations={demoLocations as RestaurantLocation[]}
                onLocationSelect={(location) => setSelectedLocation(location as RestaurantLocation)}
                refreshInterval={10000} // 10 segundos para demo
              />
            </div>
          )}
        </div>

        {/* Panel de información */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">💻 Información de Desarrollo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Componentes Implementados</h4>
              <ul className="space-y-1 text-neutral-600">
                <li>✅ OperatingHoursManager - Editor completo</li>
                <li>✅ OperatingHoursCalendar - Vista de calendario</li>
                <li>✅ OpenStatusIndicator - Indicador de estado</li>
                <li>✅ OperatingHoursHub - Componente integrador</li>
                <li>✅ MultiLocationStatusMonitor - Monitor múltiple</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Funcionalidades</h4>
              <ul className="space-y-1 text-neutral-600">
                <li>⚡ Actualización en tiempo real</li>
                <li>✨ Validación automática</li>
                <li>🎨 Múltiples variantes visuales</li>
                <li>📱 Diseño responsive</li>
                <li>🕒 Soporte para horarios nocturnos</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-800 mb-2">Estado Actual del Demo</h4>
            <div className="text-xs text-neutral-600 font-mono">
              <pre>{JSON.stringify(demoHours, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursDemo;