# Sistema de Suministros INDRHI - Frontend

Frontend moderno desarrollado en React para el Sistema de Suministros del Instituto Nacional de Recursos Hidráulicos (INDRHI).

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Build tool y servidor de desarrollo ultra-rápido
- **React Router DOM** - Enrutamiento en aplicaciones React
- **Axios** - Cliente HTTP para realizar peticiones al backend
- **CSS3** - Estilos modernos y responsivos

## 📋 Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- WordPress instalado y funcionando (Backend)
- Plugin "INDRHI Headless Auth" activado en WordPress

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
cd frontend-indrhi
npm install
```

2. **Configurar la URL del API:**

Edita el archivo `src/services/authService.js` y ajusta la URL del API si es necesario:

```javascript
const API_URL = 'http://localhost/suministros.indrhi.gob.do/wp-json/indrhi/v1'
```

3. **Ejecutar el servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
frontend-indrhi/
├── public/
│   └── logo-indrhi.png          # Logo de la institución
├── src/
│   ├── components/
│   │   ├── Login.jsx            # Componente de login
│   │   ├── Login.css            # Estilos del login
│   │   ├── Dashboard.jsx        # Panel principal
│   │   └── Dashboard.css        # Estilos del dashboard
│   ├── services/
│   │   └── authService.js       # Servicio de autenticación
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos generales de App
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
├── index.html                   # HTML principal
├── package.json                 # Dependencias del proyecto
├── vite.config.js               # Configuración de Vite
└── README.md                    # Este archivo
```

## 🔐 Autenticación

El sistema utiliza autenticación basada en tokens que se comunica con el backend de WordPress:

- **Endpoint de Login:** `/wp-json/indrhi/v1/login`
- **Endpoint de Validación:** `/wp-json/indrhi/v1/validate`

### Credenciales de Prueba

Utiliza cualquier usuario válido de WordPress:
- **Usuario/Email:** Tu nombre de usuario o correo electrónico de WordPress
- **Contraseña:** Tu contraseña de WordPress

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Genera los archivos optimizados para producción
npm run preview      # Previsualiza la versión de producción
```

## 🌐 Despliegue en Producción

1. **Construir la aplicación:**
```bash
npm run build
```

2. **Los archivos generados estarán en la carpeta `dist/`**

3. **Configurar el servidor web:**
   - Copia el contenido de `dist/` a tu servidor
   - Configura el servidor para redirigir todas las rutas a `index.html`
   - Asegúrate de que el CORS esté correctamente configurado en WordPress

## 🔒 Seguridad

- Los tokens se almacenan en `localStorage`
- Las contraseñas nunca se almacenan en el frontend
- Todas las peticiones al API utilizan HTTPS en producción
- El plugin de WordPress maneja la validación de credenciales

## 🎨 Personalización

### Colores

Los colores principales se definen en `src/index.css`:

```css
:root {
  --primary-color: #1e40af;
  --primary-dark: #1e3a8a;
  --secondary-color: #3b82f6;
  --success-color: #10b981;
  --error-color: #ef4444;
}
```

### Logo

Reemplaza el archivo `public/logo-indrhi.png` con tu propio logo.

## 📱 Responsive Design

La aplicación es completamente responsive y se adapta a:
- 📱 Dispositivos móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Escritorio (1024px+)
- 🖥️ Pantallas grandes (1400px+)

## 🐛 Solución de Problemas

### Error de CORS

Si encuentras errores de CORS, verifica:
1. Que el plugin "INDRHI Headless Auth" esté activo en WordPress
2. Que la URL en `authService.js` sea correcta
3. Que WordPress esté funcionando correctamente

### El login no funciona

1. Verifica que WordPress esté corriendo
2. Comprueba las credenciales de usuario
3. Revisa la consola del navegador para errores
4. Asegúrate de que el endpoint `/wp-json/indrhi/v1/login` esté accesible

## 📄 Licencia

© 2025 Instituto Nacional de Recursos Hidráulicos (INDRHI). Todos los derechos reservados.

## 👥 Soporte

Para soporte técnico, contacta al departamento de TI de INDRHI.

