# Verificar Configuración Actual

## Problema Identificado

El sistema sigue usando Supabase porque:

1. **MySQL local no es accesible desde Vercel**
   - Tu MySQL está en `localhost:3306` (solo accesible localmente)
   - Vercel está en la nube y no puede conectarse a tu `localhost`

2. **Variables de entorno no configuradas en Vercel**
   - El `.env` local solo funciona en desarrollo
   - Vercel necesita las variables configuradas en su dashboard

3. **El código detecta producción y usa Supabase por defecto**
   - Si `VITE_DATABASE_TYPE` no está definido, usa `'supabase'` por defecto

## Cómo Verificar Qué Está Usando

### En el Navegador (Consola del Desarrollador)

1. Abre tu app en Vercel
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Ejecuta:
   ```javascript
   console.log('Database Type:', import.meta.env.VITE_DATABASE_TYPE || 'supabase (default)')
   ```

### En el Código

El código en `src/config/database.js` tiene:
```javascript
export const DATABASE_TYPE = import.meta.env.VITE_DATABASE_TYPE || 'supabase'
```

Si `VITE_DATABASE_TYPE` no está definido en Vercel, usará `'supabase'` por defecto.

## Soluciones

### Opción 1: Configurar MySQL Remoto (Recomendado para producción)

1. **Obtén un MySQL accesible desde internet:**
   - Railway.app (gratis para empezar)
   - PlanetScale (gratis tier)
   - AWS RDS
   - DigitalOcean
   - O cualquier hosting MySQL

2. **Configura variables en Vercel:**
   - Ve a Vercel Dashboard → Settings → Environment Variables
   - Agrega:
     ```
     VITE_DATABASE_TYPE=mysql
     MYSQL_HOST=tu-host-remoto.com
     MYSQL_PORT=3306
     MYSQL_USER=tu-usuario
     MYSQL_PASSWORD=tu-password
     MYSQL_DATABASE=sum_indrhi
     ```

3. **Migra datos al MySQL remoto:**
   - Usa el mismo script de migración pero apuntando al MySQL remoto

4. **Despliega:**
   ```bash
   git push
   ```

### Opción 2: Mantener Supabase Temporalmente (Más Rápido)

Si necesitas que funcione **ahora mismo**:

1. **Mantén Supabase en producción:**
   - No cambies `VITE_DATABASE_TYPE` en Vercel
   - O configúralo como `supabase` explícitamente

2. **Usa MySQL local para desarrollo:**
   - En tu `.env` local: `VITE_DATABASE_TYPE=mysql`
   - Desarrolla con MySQL local
   - Los datos están migrados y funcionan

3. **Migra a MySQL remoto cuando estés listo:**
   - Configura MySQL remoto
   - Migra datos
   - Cambia variables en Vercel

## Verificación de Datos Migrados

Para verificar que los datos están en MySQL local:

```bash
# Conecta a MySQL
mysql -u root -p sum_indrhi

# Verifica datos
SELECT COUNT(*) FROM sum_roles;
SELECT COUNT(*) FROM sum_departamentos;
SELECT COUNT(*) FROM sum_articulos;
SELECT COUNT(*) FROM usuarios;
```

Deberías ver:
- 8 roles
- 247 departamentos
- 242 artículos
- 4 usuarios

## Estado Actual

✅ **Datos migrados correctamente a MySQL local**
✅ **Sistema funciona con MySQL en desarrollo local**
⚠️ **Vercel sigue usando Supabase porque MySQL local no es accesible**

## Recomendación

Para **producción inmediata**: Mantén Supabase en Vercel y MySQL local para desarrollo.

Para **migración completa**: Configura MySQL remoto y actualiza variables en Vercel.

