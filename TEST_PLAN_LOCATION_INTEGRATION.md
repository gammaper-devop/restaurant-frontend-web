# Plan de Pruebas - Integración de Ubicaciones con Horarios de Operación

## Objetivo
Verificar que el sistema de gestión de ubicaciones de restaurantes funciona correctamente con la integración completa de horarios de operación y selector geográfico jerárquico.

## Pre-requisitos
1. Aplicación ejecutándose en http://localhost:5174
2. Backend con datos de prueba (países, ciudades, provincias, distritos)
3. Al menos un restaurante creado en el sistema

## Casos de Prueba

### 1. Navegación a Restaurant Locations
**Objetivo:** Verificar la navegación correcta al submódulo de ubicaciones.

**Pasos:**
1. Abrir http://localhost:5174
2. Navegar a Restaurants en el menú lateral
3. Hacer clic en "Locations" en el submenú

**Resultado Esperado:**
- La página de ubicaciones se carga correctamente
- Se muestra el selector de restaurante
- No hay errores en la consola del navegador

### 2. Selección de Restaurante
**Objetivo:** Verificar que la funcionalidad de selección de restaurante funciona correctamente.

**Pasos:**
1. En la página Restaurant Locations
2. Seleccionar un restaurante del dropdown
3. Verificar que se cargan las ubicaciones existentes (si las hay)

**Resultado Esperado:**
- El selector de restaurante funciona sin errores
- Se muestran las ubicaciones del restaurante seleccionado
- El botón "Add Location" se habilita

### 3. Crear Nueva Ubicación - Formulario Modal
**Objetivo:** Verificar que el modal de creación se abre correctamente con todos los componentes.

**Pasos:**
1. Con un restaurante seleccionado, hacer clic en "Add Location"
2. Verificar que se abre el modal con el formulario completo
3. Verificar todos los campos están presentes:
   - Dirección (Address)
   - Teléfono (Phone) - opcional
   - Latitud (Latitude)
   - Longitud (Longitude)
   - Selector jerárquico geográfico (País > Ciudad > Provincia > Distrito)
   - Componente de horarios de operación

**Resultado Esperado:**
- Modal se abre correctamente
- Todos los campos están visibles
- El selector geográfico está en orden jerárquico
- El componente OperatingHoursManager está presente
- Vista previa del estado de apertura está visible

### 4. Selector Geográfico Jerárquico
**Objetivo:** Verificar la funcionalidad del selector geográfico en cascada.

**Pasos:**
1. En el modal de nueva ubicación
2. Seleccionar un país del primer dropdown
3. Verificar que el dropdown de ciudades se habilita y carga datos
4. Seleccionar una ciudad
5. Verificar que el dropdown de provincias se habilita y carga datos
6. Seleccionar una provincia
7. Verificar que el dropdown de distritos se habilita y carga datos
8. Seleccionar un distrito
9. Cambiar la selección de país y verificar que se resetean los selectores inferiores

**Resultado Esperado:**
- Selectores se habilitan/deshabilitan correctamente en orden jerárquico
- Cambios en niveles superiores resetean niveles inferiores
- Los datos se cargan correctamente en cada nivel
- No hay errores de API en la consola

### 5. Gestión de Horarios de Operación
**Objetivo:** Verificar la funcionalidad completa del OperatingHoursManager.

**Pasos:**
1. En el modal de nueva ubicación
2. Probar configurar horarios para cada día de la semana
3. Usar la función "Aplicar a todos" para replicar horarios
4. Marcar algunos días como cerrados
5. Verificar la vista previa del estado actual con OpenStatusIndicator
6. Probar diferentes configuraciones de horarios (24h, horarios divididos, etc.)

**Resultado Esperado:**
- Los horarios se pueden configurar individualmente por día
- La función "Aplicar a todos" funciona correctamente
- Se pueden marcar días como cerrados
- La vista previa muestra el estado correcto según la hora actual
- El componente maneja todos los tipos de horarios (normales, 24h, cerrados)

### 6. Validación del Formulario
**Objetivo:** Verificar que las validaciones funcionan correctamente.

**Pasos:**
1. Intentar enviar el formulario sin completar campos requeridos
2. Verificar mensajes de validación para:
   - Dirección vacía
   - Selección geográfica incompleta (falta país, ciudad, provincia o distrito)
   - Coordenadas inválidas (0,0 o vacías)
   - Horarios de operación no configurados

**Resultado Esperado:**
- Se muestran mensajes de validación claros y específicos
- El formulario no se envía si faltan campos requeridos
- Los mensajes están en español y son descriptivos

### 7. Crear Ubicación Completa
**Objetivo:** Verificar que se puede crear una ubicación completa exitosamente.

**Pasos:**
1. Completar todos los campos requeridos:
   - Dirección: "Av. Principal 123"
   - Teléfono: "+51 999 888 777"
   - Latitud: -12.046374
   - Longitud: -77.042793
   - Selección geográfica completa
   - Horarios de operación configurados
2. Enviar el formulario
3. Verificar que la ubicación se crea correctamente

**Resultado Esperado:**
- La ubicación se crea sin errores
- Se muestra mensaje de éxito
- El modal se cierra
- La nueva ubicación aparece en la tabla
- La tabla muestra el estado de horarios actual

### 8. Editar Ubicación Existente
**Objetivo:** Verificar que la funcionalidad de edición funciona correctamente.

**Pasos:**
1. Con ubicaciones existentes, hacer clic en el botón de edición
2. Verificar que el modal se abre con los datos precargados:
   - Campos básicos llenos
   - Selección geográfica correcta (país, ciudad, provincia, distrito)
   - Horarios de operación cargados
3. Modificar algunos campos
4. Guardar los cambios

**Resultado Esperado:**
- El modal de edición se abre con datos precargados correctamente
- La jerarquía geográfica se carga en el orden correcto
- Los horarios se cargan correctamente en el componente
- Los cambios se guardan exitosamente
- La tabla se actualiza con los nuevos datos

### 9. Vista de Tabla con Estado de Horarios
**Objetivo:** Verificar que la tabla muestra correctamente la información y el estado de horarios.

**Pasos:**
1. Con ubicaciones creadas, verificar la tabla
2. Comprobar las columnas:
   - Dirección con ícono de ubicación
   - Teléfono
   - Estado de horarios (abierto/cerrado con próximo cambio)
   - Acciones (editar/eliminar)

**Resultado Esperado:**
- La tabla se carga correctamente
- El estado de horarios se muestra dinámicamente (abierto/cerrado)
- Los indicadores de estado cambian según la hora actual
- Se muestra información del próximo cambio de estado

### 10. Eliminar Ubicación
**Objetivo:** Verificar que la funcionalidad de eliminación funciona correctamente.

**Pasos:**
1. Hacer clic en el botón de eliminar de una ubicación
2. Confirmar en el modal de confirmación
3. Verificar que la ubicación se elimina

**Resultado Esperado:**
- Se muestra modal de confirmación
- La ubicación se elimina correctamente
- Se muestra mensaje de éxito
- La tabla se actualiza sin la ubicación eliminada

## Casos de Error a Probar

### 11. Manejo de Errores de API
**Objetivo:** Verificar que los errores de API se manejan correctamente.

**Pasos:**
1. Con las herramientas de desarrollador, simular errores de red
2. Intentar crear/editar/eliminar ubicaciones
3. Verificar manejo de errores

**Resultado Esperado:**
- Se muestran mensajes de error descriptivos
- La aplicación no se bloquea
- Los errores se registran en la consola

### 12. Datos Incompletos o Corruptos
**Objetivo:** Verificar el manejo de datos incompletos en el modo edición.

**Pasos:**
1. Simular datos de ubicación sin jerarquía geográfica completa
2. Intentar editar la ubicación

**Resultado Esperado:**
- Se muestra mensaje de error claro
- Se previene la corrupción de datos
- El usuario recibe instrucciones para resolver el problema

## Métricas de Éxito

✅ **Funcionalidad Completa:** Todas las operaciones CRUD funcionan sin errores
✅ **UX Intuitiva:** Los usuarios pueden completar flujos sin confusión
✅ **Validación Robusta:** Se previenen datos incorrectos o incompletos
✅ **Integración Perfecta:** Los horarios de operación están completamente integrados
✅ **Rendimiento:** Las operaciones se completan en tiempo razonable
✅ **Manejo de Errores:** Los errores se manejan graciosamente con mensajes claros

## Notas Técnicas

- **Consola de Desarrollador:** Monitorear la consola durante todas las pruebas para detectar errores JavaScript
- **Network Tab:** Verificar que las llamadas a API se realizan correctamente
- **Estado de React:** Si es posible, usar React DevTools para inspeccionar el estado de los componentes
- **Responsive Design:** Probar en diferentes tamaños de pantalla (escritorio, tablet, móvil)

## Reporte de Bugs

Durante las pruebas, documentar cualquier bug encontrado con:
1. Pasos para reproducir
2. Resultado esperado vs resultado actual
3. Screenshots o videos si es aplicable
4. Información de la consola del navegador
5. Información del entorno (navegador, versión, sistema operativo)