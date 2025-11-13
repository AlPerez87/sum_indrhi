# 🔧 Configuración de Variables de Entorno en Vercel

## Credenciales de Supabase

**Project ID:** `uracpvmatedurfdsylxd`  
**Project URL:** `https://uracpvmatedurfdsylxd.supabase.co`  
**Public API Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYWNwdm1hdGVkdXJmZHN5bHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTE5ODksImV4cCI6MjA3ODYyNzk4OX0.Z-Aiba6NKouJRR_hqsJzhWLwVhXUGIVs99i--muENXc`

## Pasos para Configurar en Vercel

### 1. Acceder a la Configuración del Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **"Sistema Suministros INDRHI"**
3. Haz clic en **"Settings"** (Configuración)

### 2. Agregar Variables de Entorno

1. En el menú lateral, haz clic en **"Environment Variables"**
2. Agrega las siguientes variables:

#### Variable 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://uracpvmatedurfdsylxd.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYWNwdm1hdGVkdXJmZHN5bHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTE5ODksImV4cCI6MjA3ODYyNzk4OX0.Z-Aiba6NKouJRR_hqsJzhWLwVhXUGIVs99i--muENXc`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 3:
- **Name:** `VITE_ENVIRONMENT`
- **Value:** `production`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 3. Guardar y Redesplegar

1. Haz clic en **"Save"** para guardar las variables
2. Ve a la pestaña **"Deployments"**
3. Haz clic en los tres puntos (⋯) del último despliegue
4. Selecciona **"Redeploy"**
5. Confirma el redespliegue

### 4. Verificar la Configuración

Después del redespliegue:

1. Visita tu URL de Vercel (ej: `https://tu-proyecto.vercel.app`)
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores relacionados con Supabase
4. Intenta hacer login con un usuario de prueba

## ⚠️ Importante

- Las variables de entorno solo se aplican después de un nuevo despliegue
- Si ya desplegaste antes de agregar las variables, necesitas redesplegar
- Las variables están disponibles en tiempo de build, no en runtime

## 🔍 Verificar que Funciona

1. **En el navegador:**
   - Abre la aplicación desplegada
   - Abre la consola del navegador (F12)
   - Busca errores relacionados con `VITE_SUPABASE_URL` o `Missing Supabase`

2. **En Vercel:**
   - Ve a **Deployments** → Selecciona el último despliegue
   - Revisa los **Build Logs**
   - Verifica que no haya errores de build

3. **Prueba de conexión:**
   - Intenta hacer login
   - Si funciona, la conexión está correcta

## 📝 Notas

- El archivo `.env.local.example` contiene estas credenciales para referencia local
- **NO** subas el archivo `.env` con credenciales reales a GitHub
- Las credenciales en Vercel están seguras y encriptadas

