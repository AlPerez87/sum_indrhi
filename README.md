# Sistema de Suministros INDRHI - Frontend

Frontend moderno desarrollado en React para el Sistema de Suministros del Instituto Nacional de Recursos Hidráulicos (INDRHI).

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Build tool y servidor de desarrollo ultra-rápido
- **React Router DOM** - Enrutamiento en aplicaciones React
- **Supabase** - Backend como servicio (BaaS) para autenticación y base de datos
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Iconos modernos

## 📋 Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Cuenta en Supabase
- Cuenta en Vercel (para despliegue)

## 🔧 Instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio/frontend-indrhi
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
VITE_ENVIRONMENT=development
```

**⚠️ IMPORTANTE**: No subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

4. **Ejecutar el servidor de desarrollo:**

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
│   ├── components/              # Componentes React
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Articulos.jsx
│   │   ├── Departamentos.jsx
│   │   └── ...
│   ├── services/
│   │   ├── authService.js       # Servicio de autenticación con Supabase
│   │   └── crmService.js        # Servicios del CRM con Supabase
│   ├── lib/
│   │   └── supabaseClient.js   # Cliente de Supabase
│   ├── context/
│   │   └── ThemeContext.jsx    # Contexto de tema claro/oscuro
│   ├── hooks/                   # Custom hooks
│   ├── utils/                   # Utilidades
│   ├── constants/               # Constantes
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
├── supabase-migration.sql       # Script SQL para crear tablas en Supabase
├── vercel.json                  # Configuración de Vercel
├── package.json                 # Dependencias del proyecto
├── vite.config.js               # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind
├── MIGRACION_SUPABASE.md        # Guía de migración completa
└── README.md                    # Este archivo
```

## 🔐 Autenticación

El sistema utiliza autenticación con Supabase Auth:

- Los usuarios pueden iniciar sesión con su **email** o **username**
- Las contraseñas se gestionan a través de Supabase Auth
- Los tokens de sesión se almacenan en `localStorage`

### Crear Usuarios

1. Crea el usuario en **Supabase Dashboard** → **Authentication** → **Users**
2. Agrega el usuario a la tabla `sum_usuarios_departamentos` con su información

Ver la guía completa en `MIGRACION_SUPABASE.md`

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Genera los archivos optimizados para producción
npm run preview      # Previsualiza la versión de producción
```

## 🌐 Despliegue en Vercel

### Configuración Rápida

1. **Conectar repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en **"Add New Project"**
   - Selecciona tu repositorio de GitHub

2. **Configurar variables de entorno:**
   - En **Settings** → **Environment Variables**, agrega:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ENVIRONMENT` = `production`

3. **Desplegar:**
   - Haz clic en **"Deploy"**
   - Espera a que termine el despliegue

### Configuración Detallada

Ver la guía completa en `MIGRACION_SUPABASE.md`

## 🔒 Seguridad

- Los tokens se almacenan en `localStorage`
- Las contraseñas nunca se almacenan en el frontend
- Todas las peticiones utilizan HTTPS en producción
- Row Level Security (RLS) configurado en Supabase
- Políticas de seguridad implementadas

## 🎨 Personalización

### Colores

Los colores principales se definen en `src/index.css` y `tailwind.config.js`:

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

### Error: "Missing Supabase environment variables"

**Solución:** Verifica que el archivo `.env` exista y contenga las variables correctas.

### Error de CORS

**Solución:** 
1. Ve a **Settings** → **API** en Supabase
2. Agrega tu dominio de Vercel a la lista de URLs permitidas

### El login no funciona

**Solución:**
1. Verifica que el usuario exista en Supabase Auth
2. Verifica que el usuario esté en `sum_usuarios_departamentos`
3. Revisa la consola del navegador para errores
4. Asegúrate de usar el email correcto

### Frontend no se actualiza después de cambios

**Solución:**
```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite
npm run dev
```

## 📄 Licencia

© 2025 Instituto Nacional de Recursos Hidráulicos (INDRHI). Todos los derechos reservados.

## 👥 Soporte

Para soporte técnico o preguntas sobre la migración:
- Consulta `MIGRACION_SUPABASE.md` para la guía completa
- Revisa la [documentación de Supabase](https://supabase.com/docs)
- Revisa la [documentación de Vercel](https://vercel.com/docs)

## 🔄 Migración desde WordPress

Si estás migrando desde WordPress, consulta `MIGRACION_SUPABASE.md` para instrucciones detalladas.

---

**Versión:** 2.0.0  
**Última actualización:** Noviembre 2025  
**Estado:** ✅ Listo para producción con Supabase
