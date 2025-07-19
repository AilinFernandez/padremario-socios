# 🏢 Sistema de Gestión de Socios OPM

## 📋 Descripción General

Sistema web para la gestión integral de socios de la Obra del Padre Mario (OPM). Permite administrar socios, generar reportes, validar membresías y mantener un registro de auditoría completo.

## 🌐 **Acceso al Sistema**

**URL de Producción:** [Tu URL de AWS Amplify]
**Estado:** 🟡 **VERSIÓN DE PRUEBA** - En desarrollo activo

## ⚠️ **Notas Importantes**

### **Estado Actual:**
- ✅ **Funcionalidades principales operativas**
- 🟡 **Algunas características en desarrollo**
- ❌ **Sistema de emails pendiente de implementación**

### **Limitaciones Actuales:**
- El sistema de comunicación por email está en desarrollo
- Algunas funcionalidades avanzadas pueden tener bugs menores
- **NO usar para datos críticos de producción** hasta versión final

## 👥 **Usuarios de Prueba Pre-cargados**

### **Super Administrador:**
- **Email:** `admin@opm.org`
- **Contraseña:** `admin123`
- **Rol:** Super Administrador
- **Acceso:** Completo a todas las funcionalidades

### **Administrador:**
- **Email:** `gerente@opm.org`
- **Contraseña:** `gerente123`
- **Rol:** Administrador
- **Acceso:** Gestión de socios y reportes

### **Usuario Regular:**
- **Email:** `usuario@opm.org`
- **Contraseña:** `usuario123`
- **Rol:** Usuario
- **Acceso:** Consulta y validación

## 🔐 **Sistema de Roles y Permisos**

### **Super Administrador:**
- ✅ Gestión completa de socios
- ✅ Gestión de usuarios y roles
- ✅ Reportes y estadísticas
- ✅ Auditoría del sistema
- ✅ Configuración del sistema
- ✅ Comunicaciones

### **Administrador:**
- ✅ Gestión de socios
- ✅ Reportes y estadísticas
- ✅ Validación rápida
- ✅ Auditoría (limitada)

### **Usuario:**
- ✅ Consulta de socios
- ✅ Validación rápida
- ✅ Reportes básicos

## 🚀 **Funcionalidades Principales**

### **✅ Operativas:**
- **Gestión de Socios:** Crear, editar, eliminar y consultar socios
- **Validación Rápida:** Buscar socios por DNI
- **Reportes:** Generar reportes en Excel y PDF
- **Auditoría:** Registro completo de actividades
- **Sistema de Usuarios:** Gestión de roles y permisos
- **Dashboard:** Estadísticas en tiempo real

### **🟡 En Desarrollo:**
- **Comunicaciones:** Sistema de emails a socios
- **Notificaciones:** Alertas automáticas
- **Integración WhatsApp:** Envío de mensajes

### **📋 Pendientes:**
- **Pagos:** Gestión de cuotas y pagos
- **Eventos:** Gestión de eventos y asistencia
- **Documentos:** Subida y gestión de documentos

## 🛠️ **Tecnologías Utilizadas**

- **Frontend:** React.js, Bootstrap 5
- **Backend:** Firebase (Firestore, Authentication)
- **Hosting:** AWS Amplify
- **Base de Datos:** Firestore (NoSQL)

## 📱 **Compatibilidad**

- ✅ **Desktop:** Chrome, Firefox, Safari, Edge
- ✅ **Tablet:** iPad, Android tablets
- ✅ **Móvil:** iPhone, Android (responsive design)

## 🔧 **Instalación Local (Desarrolladores)**

```bash
# Clonar repositorio
git clone https://github.com/AilinFernandez/padremario-socios.git

# Instalar dependencias
cd padremario-socios
npm install

# Configurar Firebase
# Crear archivo .env con las credenciales

# Ejecutar en desarrollo
npm start
```

## 📞 **Soporte y Contacto**

- **Desarrollador:** [Tu información de contacto]
- **Reportar Bugs:** [Enlace a issues de GitHub]
- **Solicitar Funcionalidades:** [Enlace a issues de GitHub]

## 📄 **Documentación Adicional**

- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
- [Guía de Administración](./docs/GUIA_ADMINISTRACION.md)
- [Notas de Desarrollo](./docs/NOTAS_DESARROLLO.md)

## 🔄 **Historial de Versiones**

### **v1.0.0 (Actual)**
- ✅ Sistema base de gestión de socios
- ✅ Autenticación y autorización
- ✅ Reportes básicos
- ✅ Auditoría del sistema
- 🟡 Comunicaciones en desarrollo

### **Próximas Versiones**
- v1.1.0: Sistema de comunicaciones por email
- v1.2.0: Integración WhatsApp
- v2.0.0: Gestión de pagos y cuotas

---

**⚠️ IMPORTANTE:** Este sistema está en fase de desarrollo. No usar para datos críticos de producción hasta la versión final.
