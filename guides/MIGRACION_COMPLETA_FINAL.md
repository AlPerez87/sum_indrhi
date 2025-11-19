# Migración Completa a MySQL - Guía Final

## Estado Actual

✅ **Completado:**
- Roles migrados (8 registros)
- Usuarios migrados (4 usuarios con mapeo UUID->ID)
- Estructura de base de datos MySQL creada
- Sistema de autenticación MySQL implementado
- Adaptador de base de datos funcionando

⚠️ **Pendiente:**
- Migrar 247 departamentos completos
- Migrar 242 artículos completos
- Migrar tablas dependientes (usuarios_departamentos, solicitudes, etc.)

## Opción 1: Usar SERVICE_ROLE_KEY (Recomendado)

1. Obtén la SERVICE_ROLE_KEY desde Supabase Dashboard:
   - Ve a Settings → API
   - Copia la clave `service_role` (NO la `anon` key)

2. Agrega a tu `.env`:
   ```env
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   ```

3. Ejecuta el script de migración:
   ```bash
   node scripts/migrate-data-complete.js
   ```

Este script migrará TODOS los datos automáticamente.

## Opción 2: Exportar Manualmente desde Supabase

1. Ve a Supabase Dashboard → SQL Editor

2. Ejecuta y exporta:
   ```sql
   -- Exportar departamentos
   SELECT * FROM sum_departamentos ORDER BY id;
   -- Guarda como JSON o CSV
   
   -- Exportar artículos
   SELECT * FROM sum_articulos ORDER BY id;
   -- Guarda como JSON o CSV
   ```

3. Usa los datos exportados para completar la migración

## Cambiar a MySQL

Una vez completada la migración:

1. Edita `.env`:
   ```env
   VITE_DATABASE_TYPE=mysql
   ```

2. Reinicia la aplicación:
   ```bash
   npm run dev
   ```

3. Verifica en MySQL Workbench que todos los datos estén presentes

## Contraseñas Temporales

Todos los usuarios migrados tienen la contraseña temporal:
- **Contraseña:** `TempPassword123!`
- **Acción requerida:** Cambiar después del primer login

## Verificación

Después de la migración, verifica:
- ✅ Todos los departamentos están en MySQL
- ✅ Todos los artículos están en MySQL
- ✅ Los usuarios pueden iniciar sesión
- ✅ Las relaciones de foreign keys funcionan correctamente
- ✅ Los datos coinciden con Supabase

## Soporte

Si encuentras problemas:
1. Verifica las foreign keys en MySQL Workbench
2. Revisa los logs del script de migración
3. Asegúrate de que todos los departamentos y artículos estén migrados antes de migrar tablas dependientes

