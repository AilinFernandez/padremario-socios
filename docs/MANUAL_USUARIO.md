# 📖 Manual de Usuario - Sistema OPM

## 🎯 **Índice**
1. [Acceso al Sistema](#acceso-al-sistema)
2. [Primer Inicio de Sesión](#primer-inicio-de-sesión)
3. [Navegación Principal](#navegación-principal)
4. [Gestión de Socios](#gestión-de-socios)
5. [Validación Rápida](#validación-rápida)
6. [Reportes](#reportes)
7. [Auditoría](#auditoría)
8. [Comunicaciones](#comunicaciones)
9. [Configuración](#configuración)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🔐 **Acceso al Sistema**

### **URL del Sistema:**
[Tu URL de AWS Amplify]

### **Navegadores Compatibles:**
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 👤 **Primer Inicio de Sesión**

### **Usuarios Pre-cargados:**

#### **Super Administrador:**
- **Email:** `admin@opm.org`
- **Contraseña:** `admin123`

#### **Administrador:**
- **Email:** `gerente@opm.org`
- **Contraseña:** `gerente123`

#### **Usuario Regular:**
- **Email:** `usuario@opm.org`
- **Contraseña:** `usuario123`

### **Pasos para Iniciar Sesión:**
1. **Abrir el navegador** y ir a la URL del sistema
2. **Ingresar email** y contraseña
3. **Hacer clic en "Iniciar Sesión"**
4. **Serás redirigido al Dashboard**

---

## 🧭 **Navegación Principal**

### **Barra Lateral (Sidebar):**
- **Dashboard:** Vista general del sistema
- **Socios:** Gestión de socios
- **Nuevo Socio:** Registrar nuevo socio
- **Validación Rápida:** Buscar por DNI
- **Reportes:** Generar reportes
- **Usuarios:** Gestión de usuarios (solo admin)
- **Auditoría:** Registro de actividades
- **Comunicaciones:** Envío de mensajes
- **Configuración:** Ajustes del sistema

### **Funciones del Sidebar:**
- **Colapsar/Expandir:** Botón con flecha para hacer el sidebar más pequeño
- **Navegación rápida:** Clic en cualquier opción para ir a esa sección
- **Indicador activo:** La sección actual se resalta en azul

---

## 👥 **Gestión de Socios**

### **Ver Lista de Socios:**
1. **Clic en "Socios"** en el sidebar
2. **Verás una tabla** con todos los socios
3. **Usar filtros** para buscar socios específicos:
   - **Búsqueda:** Nombre, apellido, DNI o email
   - **Estado:** Activo, Inactivo, Pendiente
   - **Sector:** Filtrar por sector de trabajo
   - **Barrio:** Filtrar por barrio

### **Crear Nuevo Socio:**
1. **Clic en "Nuevo Socio"** en el sidebar
2. **Completar formulario:**
   - **Datos personales:** Nombre, apellido, DNI, email
   - **Información de contacto:** Teléfono, dirección
   - **Sectores:** Seleccionar sectores de trabajo
   - **Estado:** Activo por defecto
3. **Hacer clic en "Guardar Socio"**

### **Editar Socio:**
1. **En la lista de socios,** hacer clic en el ícono de editar (lápiz)
2. **Modificar los campos** necesarios
3. **Hacer clic en "Guardar Cambios"**

### **Ver Detalles de Socio:**
1. **En la lista de socios,** hacer clic en el ícono de ver (ojo)
2. **Ver información completa** del socio
3. **Acceder a historial** de actividades

### **Eliminar Socio:**
1. **En la lista de socios,** hacer clic en el ícono de eliminar (basura)
2. **Confirmar eliminación** en el popup
3. **El socio se marcará como eliminado**

---

## 🔍 **Validación Rápida**

### **Buscar Socio por DNI:**
1. **Clic en "Validación Rápida"** en el sidebar
2. **Ingresar DNI** en el campo de búsqueda
3. **Hacer clic en "Buscar"** o presionar Enter
4. **Ver resultado:**
   - ✅ **Socio encontrado:** Muestra información del socio
   - ❌ **No encontrado:** Mensaje de "Socio no encontrado"

### **Información Mostrada:**
- Nombre completo
- Estado de membresía
- Sectores de trabajo
- Fecha de alta
- Última actividad

---

## 📊 **Reportes**

### **Generar Reporte:**
1. **Clic en "Reportes"** en el sidebar
2. **Seleccionar tipo de reporte:**
   - **Lista de Socios:** Todos los socios
   - **Socios por Estado:** Filtrado por estado
   - **Socios por Sector:** Filtrado por sector
   - **Estadísticas Generales:** Resumen del sistema
3. **Aplicar filtros** si es necesario
4. **Seleccionar formato:**
   - **Excel (.xlsx):** Para análisis en Excel
   - **PDF:** Para impresión o archivo
5. **Hacer clic en "Generar Reporte"**

### **Descargar Reporte:**
- **El archivo se descargará** automáticamente
- **Verificar carpeta de descargas** del navegador
- **Abrir archivo** con programa correspondiente

---

## 📋 **Auditoría**

### **Ver Registro de Actividades:**
1. **Clic en "Auditoría"** en el sidebar (solo administradores)
2. **Ver tabla de actividades** con:
   - Fecha y hora
   - Usuario que realizó la acción
   - Tipo de acción
   - Detalles de la acción
   - Página donde ocurrió

### **Filtrar Actividades:**
- **Por usuario:** Buscar actividades de un usuario específico
- **Por acción:** Filtrar por tipo de acción
- **Por fecha:** Seleccionar rango de fechas
- **Por límite:** Número de registros a mostrar

### **Estadísticas:**
- **Total de acciones:** Número total de actividades
- **Acciones hoy:** Actividades del día actual
- **Usuarios activos:** Usuarios que han usado el sistema
- **Usuarios inactivos:** Usuarios sin actividad reciente

---

## 📧 **Comunicaciones**

### **Estado Actual:**
⚠️ **EN DESARROLLO** - Esta funcionalidad estará disponible próximamente

### **Funcionalidades Futuras:**
- Envío de emails a socios
- Plantillas de mensajes
- Historial de comunicaciones
- Integración con WhatsApp

---

## ⚙️ **Configuración**

### **Acceso:**
- **Solo Super Administradores** pueden acceder
- **Clic en "Configuración"** en el sidebar

### **Opciones Disponibles:**
- **Configuración del sistema**
- **Gestión de usuarios**
- **Configuración de emails** (cuando esté disponible)

---

## 🔧 **Solución de Problemas**

### **No puedo iniciar sesión:**
- ✅ **Verificar email y contraseña**
- ✅ **Verificar conexión a internet**
- ✅ **Limpiar caché del navegador**
- ✅ **Intentar en navegador diferente**

### **La página no carga:**
- ✅ **Verificar URL correcta**
- ✅ **Verificar conexión a internet**
- ✅ **Recargar página (F5)**
- ✅ **Contactar al administrador**

### **No puedo crear/editar socios:**
- ✅ **Verificar permisos de usuario**
- ✅ **Completar todos los campos obligatorios**
- ✅ **Verificar formato de DNI**
- ✅ **Verificar formato de email**

### **Los reportes no se descargan:**
- ✅ **Verificar permisos de descarga**
- ✅ **Verificar espacio en disco**
- ✅ **Verificar bloqueador de popups**
- ✅ **Intentar con navegador diferente**

### **Problemas de rendimiento:**
- ✅ **Cerrar otras pestañas del navegador**
- ✅ **Limpiar caché del navegador**
- ✅ **Verificar conexión a internet**
- ✅ **Contactar al administrador**

---

## 📞 **Contacto y Soporte**

### **Para Reportar Problemas:**
- **Contactar al administrador del sistema**
- **Proporcionar detalles del problema:**
  - Qué estabas haciendo
  - Qué error apareció
  - En qué navegador ocurrió
  - Fecha y hora del problema

### **Para Solicitar Funcionalidades:**
- **Contactar al administrador del sistema**
- **Describir la funcionalidad deseada**
- **Explicar el beneficio para la organización**

---

## ⚠️ **Notas Importantes**

### **Seguridad:**
- **No compartir credenciales** con otros usuarios
- **Cerrar sesión** al terminar de usar el sistema
- **No usar en computadoras públicas** sin cerrar sesión

### **Datos:**
- **Este es un sistema de prueba** - No usar para datos críticos
- **Hacer respaldos** de información importante
- **Verificar datos** antes de guardar

### **Actualizaciones:**
- **El sistema se actualiza automáticamente**
- **Nuevas funcionalidades** se agregarán gradualmente
- **Mantener informado** sobre cambios importantes

---

**📅 Última actualización:** Julio 2025  
**🔄 Versión del manual:** 1.0.0 