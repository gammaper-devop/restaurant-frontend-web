# 🕒 Integración de Horarios de Operación en Add/Edit Location

Esta documentación describe cómo se ha integrado el sistema de gestión de horarios de operación en el formulario de Add/Edit Location dentro del módulo de Restaurant Locations.

## 📋 Resumen de la Implementación

### 🎯 Objetivo
Permitir que los usuarios configuren horarios de operación directamente al crear o editar ubicaciones de restaurantes, proporcionando una experiencia fluida y completa.

### 🛠️ Componentes Integrados

1. **OperatingHoursManager**: Editor completo de horarios con validación
2. **OpenStatusIndicator**: Indicador visual del estado actual (abierto/cerrado)
3. **Hook useOperatingHours**: Gestión del estado y operaciones CRUD

## 🏗️ Arquitectura de la Integración

### Flujo de Datos
```
FormData (LocationFormData)
├── Basic Info (address, phone, coordinates)
├── Geographic Info (district)
└── Operating Hours (OperatingHours) ⭐ NUEVA SECCIÓN
```

### Estructura Actualizada

#### LocationFormData Interface
```typescript
interface LocationFormData {
  id?: number;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  districtId: number;
  restaurantId: number;
  operatingHours?: OperatingHours; // ⭐ NUEVO
  isNew?: boolean;
}
```

#### API DTO Update
```typescript
const locationData = {
  restaurant: formData.restaurantId,
  address: formData.address,
  phone: formData.phone,
  latitude: Number(formData.latitude),
  longitude: Number(formData.longitude),
  district: formData.districtId,
  operatingHours: formData.operatingHours, // ⭐ ENVIADO AL BACKEND
};
```

## 🔄 Funcionalidades Implementadas

### 1. **Crear Nueva Ubicación**
- ✅ Horarios por defecto pre-configurados
- ✅ Vista previa del estado operacional
- ✅ Validación en tiempo real
- ✅ Gestión completa de horarios semanales

### 2. **Editar Ubicación Existente**
- ✅ Carga horarios existentes desde la API
- ✅ Preserva horarios durante la edición
- ✅ Actualización incremental de horarios

### 3. **Tabla de Ubicaciones**
- ✅ Nueva columna "Status" con indicador en tiempo real
- ✅ Estado visual abierto/cerrado para cada ubicación
- ✅ Actualización automática del estado

## 🎨 Interfaz de Usuario

### Formulario Modal Expandido
```
┌─ Add/Edit Location (Modal XL) ─────────────────────┐
│ 📍 Basic Information                               │
│ ├─ Address, Phone                                  │
│ ├─ Coordinates (Lat, Lng)                          │
│ └─ District Selection                               │
│                                                    │
│ ─────────────────────────────────────────────────  │
│                                                    │
│ 🕒 Horarios de Operación ⭐ NUEVA SECCIÓN         │
│ ├─ Vista Previa del Estado                         │
│ │   └─ [🟢 Abierto] próximo cierre en 2h          │
│ ├─ Editor Semanal                                  │
│ │   ├─ Lunes: 09:00 - 22:00                       │
│ │   ├─ Martes: 09:00 - 22:00                      │
│ │   ├─ Miércoles: 09:00 - 22:00                   │
│ │   ├─ Jueves: 09:00 - 22:00                      │
│ │   ├─ Viernes: 09:00 - 23:00                     │
│ │   ├─ Sábado: 10:00 - 23:00                      │
│ │   └─ Domingo: 10:00 - 21:00                     │
│ └─ Funciones: "Aplicar a todos", Validación       │
│                                                    │
│ ─────────────────────────────────────────────────  │
│                                                    │
│                           [Cancel] [Save Location] │
└────────────────────────────────────────────────────┘
```

### Tabla de Ubicaciones Actualizada
```
┌─ Locations for Restaurant X ───────────────────────┐
│                                                    │
│ Address          Status       Phone      Coords    │
│ ─────────────────────────────────────────────────  │
│ 📍 Av. Main 123   🟢 Abierto   📞 +123     Lat/Lng │
│ 📍 Av. Norte 456  🔴 Cerrado   📞 +456     Lat/Lng │
│ 📍 Av. Sur 789    🟢 Abierto   📞 +789     Lat/Lng │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 🔧 Implementación Técnica

### Hooks y State Management

#### 1. FormData State
```typescript
const [formData, setFormData] = useState<LocationFormData>({
  restaurantId: 0,
  address: '',
  phone: '',
  latitude: 0,
  longitude: 0,
  districtId: 0,
  operatingHours: OperatingHoursUtils.getDefaultOperatingHours(), // ⭐
  isNew: true,
});
```

#### 2. Operating Hours Handler
```typescript
const handleOperatingHoursChange = (hours: OperatingHours) => {
  setFormData(prev => ({
    ...prev,
    operatingHours: hours,
  }));
};
```

#### 3. Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation
  
  const locationData = {
    restaurant: formData.restaurantId,
    address: formData.address,
    phone: formData.phone,
    latitude: Number(formData.latitude),
    longitude: Number(formData.longitude),
    district: formData.districtId,
    operatingHours: formData.operatingHours, // ⭐ Incluido en DTO
  };

  if (formData.isNew) {
    await restaurantLocationsService.create(locationData);
  } else {
    await restaurantLocationsService.update(formData.id!, locationData);
  }
};
```

### Componentes Integrados

#### 1. OperatingHoursManager en el Formulario
```tsx
<OperatingHoursManager
  operatingHours={formData.operatingHours}
  onChange={onOperatingHoursChange}
  locationName={formData.address || 'Nueva Ubicación'}
  showPreview={false}
  disabled={loading}
/>
```

#### 2. OpenStatusIndicator en la Tabla
```tsx
<OpenStatusIndicator
  operatingHours={row.operatingHours || OperatingHoursUtils.getDefaultOperatingHours()}
  variant="minimal"
  size="sm"
  showNextChange={false}
/>
```

#### 3. Vista Previa en el Formulario
```tsx
<OpenStatusIndicator
  operatingHours={formData.operatingHours}
  locationName="Vista Previa"
  variant="badge"
  size="md"
  showNextChange={true}
/>
```

## 📊 Casos de Uso

### Caso 1: Crear Nueva Ubicación
1. Usuario selecciona restaurante
2. Hace click en "Add Location"
3. Completa información básica
4. Configura horarios de operación (pre-cargados con defaults)
5. Ve vista previa del estado actual
6. Guarda la ubicación con horarios incluidos

### Caso 2: Editar Ubicación Existente
1. Usuario hace click en "Edit" en una ubicación
2. Formulario se carga con datos existentes incluyendo horarios
3. Puede modificar horarios usando el editor visual
4. Ve preview del estado actualizado
5. Guarda cambios

### Caso 3: Visualizar Estado de Ubicaciones
1. Lista de ubicaciones muestra estado en tiempo real
2. Usuarios ven rápidamente qué ubicaciones están abiertas/cerradas
3. Estado se actualiza automáticamente

## 🔍 Validación y Manejo de Errores

### Validaciones Implementadas
- ✅ Horarios válidos (formato HH:MM)
- ✅ Hora de cierre posterior a hora de apertura
- ✅ Soporte para horarios que cruzan medianoche
- ✅ Validación de días cerrados
- ✅ Feedback visual de errores

### Manejo de Errores
- ✅ Fallback a horarios por defecto si no existen
- ✅ Validación antes de envío al backend
- ✅ Mensajes de error descriptivos
- ✅ Recuperación automática de estados inválidos

## 🚀 Beneficios de la Integración

### Para Usuarios
1. **Flujo Completo**: Configuración de ubicación y horarios en un solo paso
2. **Vista Previa**: Ven inmediatamente el estado operacional
3. **Validación Instantánea**: Errores detectados en tiempo real
4. **Experiencia Intuitiva**: Editor visual fácil de usar

### Para Desarrolladores
1. **Código Modular**: Componentes reutilizables
2. **Tipado Fuerte**: TypeScript en toda la cadena
3. **Estado Consistente**: Sincronización automática con backend
4. **Mantenible**: Separación clara de responsabilidades

### Para el Sistema
1. **Datos Completos**: Ubicaciones siempre tienen horarios
2. **Consistencia**: Estado operacional calculado uniformemente
3. **Performance**: Cálculos optimizados del estado
4. **Escalabilidad**: Soporte para múltiples ubicaciones

## 🎯 Próximos Pasos

### Mejoras Potenciales
1. **Horarios Especiales**: Soporte para días festivos
2. **Templates**: Plantillas de horarios predefinidas
3. **Bulk Edit**: Edición masiva de horarios
4. **Analytics**: Métricas de horarios más utilizados
5. **Notificaciones**: Alertas de cambio de estado

### Integraciones Futuras
1. **Dashboard**: Widget de resumen de estados
2. **Reportes**: Analytics de horarios operacionales
3. **API Pública**: Exposición de estado para clientes
4. **Mobile**: Componentes adaptados para móvil

---

## ✅ Checklist de Implementación Completada

- [x] ✅ Hook `useOperatingHours` implementado
- [x] ✅ Interface `LocationFormData` actualizada
- [x] ✅ Handlers para cambio de horarios
- [x] ✅ Integración en formulario de creación
- [x] ✅ Integración en formulario de edición
- [x] ✅ Columna de estado en tabla de ubicaciones
- [x] ✅ Modal expandido a tamaño XL
- [x] ✅ Vista previa de estado en formulario
- [x] ✅ Validación y manejo de errores
- [x] ✅ Sincronización con backend API
- [x] ✅ Fallbacks y valores por defecto
- [x] ✅ Documentación completa

**🎉 ¡La integración está completamente lista y funcional!**