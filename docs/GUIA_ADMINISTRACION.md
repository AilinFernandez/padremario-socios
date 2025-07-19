# 🔧 Guía de Administración - Sistema OPM

## 🎯 **Índice**
1. [Acceso de Administrador](#acceso-de-administrador)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Sistema de Roles](#sistema-de-roles)
4. [Auditoría del Sistema](#auditoría-del-sistema)
5. [Configuración del Sistema](#configuración-del-sistema)
6. [Mantenimiento](#mantenimiento)
7. [Respaldo de Datos](#respaldo-de-datos)
8. [Solución de Problemas Avanzados](#solución-de-problemas-avanzados)

---

## 🔐 **Acceso de Administrador**

### **Credenciales de Super Administrador:**
- **Email:** `admin@opm.org`
- **Contraseña:** `admin123`

### **Credenciales de Administrador:**
- **Email:** `gerente@opm.org`
- **Contraseña:** `gerente123`

### **Importante:**
- **Cambiar contraseñas** después del primer acceso
- **No compartir credenciales** con usuarios regulares
- **Usar contraseñas seguras** (mínimo 8 caracteres, mayúsculas, números)

---

## 👥 **Gestión de Usuarios**

### **Crear Nuevo Usuario:**
1. **Ir a "Usuarios"** en el sidebar
2. **Hacer clic en "Nuevo Usuario"**
3. **Completar formulario:**
   - **Datos personales:** Nombre, apellido, email
   - **Rol:** Seleccionar rol apropiado
   - **Estado:** Activo por defecto
4. **Hacer clic en "Crear Usuario"**
5. **El usuario recibirá email** con instrucciones para establecer contraseña

### **Editar Usuario:**
1. **En la lista de usuarios,** hacer clic en el ícono de editar
2. **Modificar datos** necesarios
3. **Cambiar rol** si es necesario
4. **Hacer clic en "Guardar Cambios"**

### **Cambiar Estado de Usuario:**
- **Activar/Desactivar:** Controlar acceso al sistema
- **Usuarios inactivos** no pueden iniciar sesión
- **Los datos se mantienen** aunque el usuario esté inactivo

### **Eliminar Usuario:**
⚠️ **CUIDADO:** Esta acción no se puede deshacer
1. **Hacer clic en el ícono de eliminar**
2. **Confirmar eliminación**
3. **El usuario se marcará como eliminado**

---

## 🔐 **Sistema de Roles**

### **Roles Disponibles:**

#### **Super Administrador:**
- **Acceso completo** a todas las funcionalidades
- **Gestión de usuarios** y roles
- **Configuración del sistema**
- **Auditoría completa**
- **Comunicaciones**

#### **Administrador:**
- **Gestión de socios** (crear, editar, eliminar)
- **Reportes** y estadísticas
- **Validación rápida**
- **Auditoría limitada**
- **NO puede gestionar usuarios**

#### **Usuario:**
- **Consulta de socios**
- **Validación rápida**
- **Reportes básicos**
- **NO puede modificar datos**

### **Asignar Roles:**
1. **Ir a "Usuarios"**
2. **Seleccionar usuario**
3. **Cambiar rol** en el formulario de edición
4. **Guardar cambios**

### **Permisos por Funcionalidad:**

| Funcionalidad | Super Admin | Admin | Usuario |
|---------------|-------------|-------|---------|
| Gestión de Socios | ✅ Completo | ✅ Completo | ✅ Solo lectura |
| Gestión de Usuarios | ✅ Completo | ❌ No | ❌ No |
| Reportes | ✅ Completo | ✅ Completo | ✅ Básicos |
| Auditoría | ✅ Completo | ✅ Limitada | ❌ No |
| Configuración | ✅ Completo | ❌ No | ❌ No |
| Comunicaciones | ✅ Completo | ❌ No | ❌ No |

---

## 📋 **Auditoría del Sistema**

### **Acceso a Auditoría:**
- **Solo Super Administradores** y **Administradores**
- **Ir a "Auditoría"** en el sidebar

### **Información Registrada:**
- **Login/Logout** de usuarios
- **Creación/Edición/Eliminación** de socios
- **Búsquedas** realizadas
- **Reportes** generados
- **Navegación** entre páginas
- **Errores** del sistema

### **Filtros Disponibles:**
- **Por usuario:** Ver actividades de usuario específico
- **Por acción:** Filtrar por tipo de actividad
- **Por fecha:** Rango de fechas
- **Por límite:** Número de registros

### **Estadísticas:**
- **Total de acciones:** Número total de actividades
- **Acciones hoy:** Actividades del día actual
- **Usuarios activos:** Usuarios con actividad reciente
- **Usuarios inactivos:** Usuarios sin actividad

### **Exportar Auditoría:**
- **Los datos de auditoría** se pueden exportar
- **Formato CSV** para análisis en Excel
- **Incluye todos los campos** de auditoría

---

## ⚙️ **Configuración del Sistema**

### **Acceso a Configuración:**
- **Solo Super Administradores**
- **Ir a "Configuración"** en el sidebar

### **Opciones de Configuración:**

#### **Configuración General:**
- **Nombre de la organización**
- **Logo del sistema**
- **Configuración de emails** (cuando esté disponible)

#### **Configuración de Seguridad:**
- **Política de contraseñas**
- **Tiempo de sesión**
- **Intentos de login**

#### **Configuración de Reportes:**
- **Formato por defecto** (Excel/PDF)
- **Configuración de plantillas**

---

## 🔧 **Mantenimiento**

### **Tareas Diarias:**
- **Revisar auditoría** del día anterior
- **Verificar usuarios activos**
- **Revisar reportes** generados

### **Tareas Semanales:**
- **Revisar estadísticas** del sistema
- **Verificar respaldos** automáticos
- **Revisar usuarios inactivos**

### **Tareas Mensuales:**
- **Análisis de uso** del sistema
- **Revisión de permisos** de usuarios
- **Actualización de documentación**

### **Monitoreo del Sistema:**
- **Verificar rendimiento** del sistema
- **Revisar errores** en auditoría
- **Monitorear uso** de recursos

---

## 💾 **Respaldo de Datos**

### **Respaldo Automático:**
- **Firebase realiza respaldos** automáticos
- **Datos protegidos** contra pérdida
- **Recuperación automática** en caso de fallos

### **Respaldo Manual:**
- **Exportar datos** desde reportes
- **Guardar en ubicación segura**
- **Documentar fecha** de respaldo

### **Datos a Respalda:**
- **Lista completa de socios**
- **Reportes importantes**
- **Configuración del sistema**
- **Datos de auditoría**

### **Frecuencia de Respaldo:**
- **Diario:** Para datos críticos
- **Semanal:** Para datos generales
- **Mensual:** Para datos históricos

---

## 🚨 **Solución de Problemas Avanzados**

### **Problemas de Rendimiento:**
- **Verificar conexión** a internet
- **Limpiar caché** del navegador
- **Cerrar pestañas** innecesarias
- **Contactar al desarrollador** si persiste

### **Problemas de Acceso:**
- **Verificar credenciales** del usuario
- **Verificar estado** del usuario (activo/inactivo)
- **Verificar permisos** del rol
- **Revisar auditoría** para detectar problemas

### **Problemas de Datos:**
- **Verificar integridad** de los datos
- **Revisar auditoría** para cambios recientes
- **Restaurar desde respaldo** si es necesario
- **Contactar al desarrollador** para problemas técnicos

### **Problemas de Reportes:**
- **Verificar permisos** del usuario
- **Verificar datos** disponibles
- **Probar con diferentes** filtros
- **Contactar al desarrollador** si persiste

### **Problemas de Comunicaciones:**
⚠️ **EN DESARROLLO** - Esta funcionalidad estará disponible próximamente

---

## 📊 **Métricas y KPIs**

### **Métricas de Uso:**
- **Usuarios activos** por día/semana/mes
- **Acciones realizadas** por tipo
- **Tiempo de sesión** promedio
- **Páginas más visitadas**

### **Métricas de Socios:**
- **Total de socios** registrados
- **Socios por estado** (activo/inactivo)
- **Socios por sector** de trabajo
- **Socios por barrio**

### **Métricas de Sistema:**
- **Tiempo de respuesta** del sistema
- **Errores** registrados
- **Uso de recursos** del servidor
- **Disponibilidad** del sistema

---

## 📞 **Contacto Técnico**

### **Para Problemas Técnicos:**
- **Contactar al desarrollador** del sistema
- **Proporcionar detalles** del problema:
  - Descripción del problema
  - Pasos para reproducir
  - Capturas de pantalla
  - Información del navegador
  - Fecha y hora del problema

### **Para Solicitudes de Funcionalidades:**
- **Describir la funcionalidad** deseada
- **Explicar el beneficio** para la organización
- **Proporcionar ejemplos** de uso
- **Priorizar** la solicitud

### **Para Emergencias:**
- **Contactar inmediatamente** al desarrollador
- **Proporcionar información** de contacto
- **Describir el impacto** del problema
- **Seguir instrucciones** del desarrollador

---

## ⚠️ **Notas Importantes para Administradores**

### **Seguridad:**
- **Cambiar contraseñas** regularmente
- **No compartir credenciales** con otros usuarios
- **Revisar auditoría** regularmente
- **Reportar actividades** sospechosas

### **Datos:**
- **Este es un sistema de prueba** - No usar para datos críticos
- **Hacer respaldos** regulares
- **Verificar integridad** de los datos
- **Documentar cambios** importantes

### **Usuarios:**
- **Asignar roles** apropiados
- **Revisar permisos** regularmente
- **Desactivar usuarios** que no usen el sistema
- **Capacitar usuarios** en el uso del sistema

### **Sistema:**
- **Monitorear rendimiento** del sistema
- **Reportar problemas** al desarrollador
- **Mantener documentación** actualizada
- **Planificar actualizaciones** del sistema

---

**📅 Última actualización:** Julio 2025  
**🔄 Versión de la guía:** 1.0.0  
**👤 Para administradores del sistema OPM** 