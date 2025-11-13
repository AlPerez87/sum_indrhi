# Configuración de Variables de Entorno

Este archivo contiene las instrucciones para configurar las variables de entorno necesarias.

## Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto `frontend-indrhi/` con el siguiente contenido:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment
VITE_ENVIRONMENT=development
```

## Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL**: Reemplaza `your-supabase-project-url`
   - **anon/public key**: Reemplaza `your-supabase-anon-key`

## Ejemplo de archivo .env completo

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_ENVIRONMENT=development
```

## Variables de Entorno para Producción (Vercel)

Cuando despliegues en Vercel, configura las mismas variables en:
1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. Para `VITE_ENVIRONMENT`, usa `production`

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` a GitHub
- El archivo `.env` ya está incluido en `.gitignore`
- Usa `.env.example` como plantilla (sin valores reales) si quieres documentar las variables necesarias

