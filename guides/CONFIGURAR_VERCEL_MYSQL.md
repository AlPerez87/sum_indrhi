# Configurar MySQL en Vercel

## Problema Actual

El código intenta conectarse a MySQL directamente desde el frontend, lo cual **NO es posible** porque:
- MySQL requiere conexiones TCP directas
- Los navegadores bloquean conexiones directas a bases de datos
- Vercel despliega solo frontend estático

## Solución: API Routes con Serverless Functions

He creado las funciones API necesarias en `/api/query.js` y `/api/db.js`.

### Paso 1: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en **Vercel Dashboard**
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```
MYSQL_HOST=tu-host-mysql
MYSQL_PORT=3306
MYSQL_USER=tu-usuario
MYSQL_PASSWORD=tu-password
MYSQL_DATABASE=sum_indrhi
```

**⚠️ IMPORTANTE:** 
- Si tu MySQL está en `localhost`, NO funcionará desde Vercel
- Necesitas un MySQL accesible desde internet (ej: Railway, PlanetScale, AWS RDS, etc.)
- O usar un túnel como `ngrok` para desarrollo

### Paso 2: Actualizar el Cliente MySQL para Usar API

El cliente MySQL debe hacer peticiones HTTP a las API Routes en lugar de conectarse directamente.

### Paso 3: Desplegar

```bash
git add .
git commit -m "Add MySQL API routes"
git push
```

Vercel detectará automáticamente las funciones en `/api/` y las desplegará.

## Alternativa: Usar Supabase Temporalmente

Si necesitas que funcione **ahora mismo**, puedes:

1. Mantener `VITE_DATABASE_TYPE=supabase` en Vercel
2. Los datos ya están migrados a MySQL local
3. Usar MySQL local para desarrollo
4. Usar Supabase en producción hasta configurar MySQL remoto

## Próximos Pasos

1. ✅ Configurar MySQL remoto accesible desde internet
2. ✅ Agregar variables de entorno en Vercel
3. ✅ Actualizar cliente MySQL para usar API Routes
4. ✅ Desplegar y probar

