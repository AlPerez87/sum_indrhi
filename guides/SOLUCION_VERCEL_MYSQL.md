# Solución: MySQL en Vercel

## Problema Identificado

El sistema sigue usando Supabase porque **MySQL no puede ejecutarse directamente desde el frontend**. Esto es una limitación de seguridad del navegador.

## Solución Implementada

He creado una arquitectura híbrida:

### Desarrollo Local
- Usa conexión directa a MySQL (`mysqlClient.js`)
- Se conecta a `localhost:3306`

### Producción (Vercel)
- Usa API Routes (`mysqlClientApi.js`)
- Hace peticiones HTTP a `/api/query`
- Las Serverless Functions se conectan a MySQL

## Archivos Creados

1. **`api/db.js`** - Funciones de base de datos MySQL
2. **`api/query.js`** - API Route para queries MySQL
3. **`src/lib/mysqlClientApi.js`** - Cliente que usa API Routes
4. **`vercel.json`** - Configuración actualizada para Serverless Functions

## Configuración Requerida en Vercel

### 1. Variables de Entorno

Ve a **Vercel Dashboard** → **Settings** → **Environment Variables** y agrega:

```
MYSQL_HOST=tu-host-mysql-remoto
MYSQL_PORT=3306
MYSQL_USER=tu-usuario
MYSQL_PASSWORD=tu-password
MYSQL_DATABASE=sum_indrhi
VITE_DATABASE_TYPE=mysql
```

**⚠️ IMPORTANTE:** 
- Tu MySQL debe ser accesible desde internet (NO `localhost`)
- Opciones: Railway, PlanetScale, AWS RDS, DigitalOcean, etc.
- O usar un túnel como `ngrok` para desarrollo

### 2. Desplegar

```bash
git add .
git commit -m "Add MySQL API routes for Vercel"
git push
```

Vercel detectará automáticamente las funciones en `/api/` y las desplegará.

## Verificación

Después del despliegue:

1. Verifica que las API Routes funcionen:
   ```
   https://tu-app.vercel.app/api/query?table=sum_roles
   ```

2. Verifica en la consola del navegador que use `mysqlClientApi` en producción

3. Verifica que los datos vengan de MySQL, no de Supabase

## Alternativa Temporal

Si necesitas que funcione **ahora mismo** sin configurar MySQL remoto:

1. Mantén `VITE_DATABASE_TYPE=supabase` en Vercel
2. Los datos están migrados a MySQL local
3. Usa MySQL local para desarrollo
4. Usa Supabase en producción hasta configurar MySQL remoto

## Próximos Pasos

1. ✅ Configurar MySQL remoto accesible desde internet
2. ✅ Agregar variables de entorno en Vercel
3. ✅ Desplegar y verificar que funcione
4. ✅ Cambiar `VITE_DATABASE_TYPE=mysql` en Vercel

