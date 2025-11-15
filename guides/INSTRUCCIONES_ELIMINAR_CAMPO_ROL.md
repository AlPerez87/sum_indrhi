# 📋 Instrucciones para Eliminar el Campo `rol` de la Base de Datos

Este documento te guía paso a paso para eliminar el campo `rol` VARCHAR de la tabla `sum_usuarios_departamentos` y asegurar que todas las referencias usen `rol_id`.

## 🎯 Objetivo

Eliminar el campo `rol` VARCHAR que ya no tiene utilidad real y asegurar que todas las referencias en el código y la base de datos usen `rol_id` (foreign key a `sum_roles`).

## ✅ Cambios Realizados en el Código

Los siguientes archivos ya han sido actualizados para usar `rol_id`:

1. ✅ `src/services/authService.js` - Actualizado para obtener el rol desde `sum_roles` usando `rol_id`
2. ✅ `src/components/Usuarios.jsx` - Ya usa `rol_id` y muestra el nombre del rol desde `sum_roles`
3. ✅ `INSERT_DATOS_SUPABASE.sql` - Actualizado para usar `rol_id` en lugar de `rol`

## 📝 Pasos para Ejecutar en Supabase

### Paso 1: Verificar Usuarios Sin rol_id

Antes de eliminar el campo `rol`, asegúrate de que todos los usuarios tengan `rol_id` asignado:

```sql
-- Verificar usuarios sin rol_id
SELECT 
  id,
  username,
  email,
  rol AS rol_antiguo,
  rol_id,
  CASE 
    WHEN rol_id IS NULL THEN '⚠️ SIN ROL_ID - REQUIERE ATENCIÓN'
    ELSE '✅ OK'
  END AS estado
FROM sum_usuarios_departamentos
WHERE rol_id IS NULL;
```

Si hay usuarios sin `rol_id`, ejecuta:

```sql
-- Asignar rol "Usuario" por defecto a usuarios sin rol_id
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Usuario' LIMIT 1)
WHERE rol_id IS NULL;
```

### Paso 2: Ejecutar el Script de Eliminación

1. Abre el **SQL Editor** en tu proyecto de Supabase
2. Abre el archivo `ELIMINAR_CAMPO_ROL.sql`
3. Copia y pega **todo el contenido** en el SQL Editor
4. Ejecuta el script completo
5. Verifica que no haya errores

El script realizará las siguientes acciones:

1. ✅ Verificará que todos los usuarios tienen `rol_id`
2. ✅ Asignará `rol_id` a usuarios que no lo tengan
3. ✅ Eliminará la restricción `NOT NULL` del campo `rol`
4. ✅ Eliminará el campo `rol` de la tabla
5. ✅ Verificará que la eliminación fue exitosa

### Paso 3: Verificación Final

Después de ejecutar el script, verifica que:

1. ✅ El campo `rol` ya no existe en la tabla:
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'sum_usuarios_departamentos'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

2. ✅ Todos los usuarios tienen `rol_id` y el nombre del rol se muestra correctamente:
```sql
SELECT 
  ud.id,
  ud.username,
  ud.email,
  ud.rol_id,
  r.nombre AS rol_actual
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
ORDER BY ud.id;
```

3. ✅ La aplicación funciona correctamente:
   - Los usuarios pueden iniciar sesión
   - El rol se muestra correctamente en la interfaz
   - Puedes editar el rol de los usuarios desde la tabla

## 🔍 Consultas Útiles

### Ver estructura actual de la tabla:
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'sum_usuarios_departamentos'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Ver usuarios y sus roles actuales:
```sql
SELECT 
  ud.id,
  ud.username,
  ud.email,
  ud.rol_id,
  r.nombre AS rol,
  r.descripcion AS descripcion_rol
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
ORDER BY ud.username;
```

### Asignar un rol específico a un usuario:
```sql
-- Reemplaza 'nombre_usuario' y 'Nombre del Rol' con los valores reales
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Nombre del Rol' LIMIT 1)
WHERE username = 'nombre_usuario';
```

## ⚠️ Advertencias Importantes

1. **Irreversible**: La eliminación del campo `rol` es permanente. Asegúrate de haber verificado todo antes de ejecutar.

2. **Backup**: Se recomienda hacer un backup de la tabla antes de ejecutar:
```sql
-- Crear tabla de respaldo (opcional)
CREATE TABLE sum_usuarios_departamentos_backup AS 
SELECT * FROM sum_usuarios_departamentos;
```

3. **Verificación**: Asegúrate de que todos los usuarios tengan `rol_id` antes de eliminar el campo `rol`.

4. **Código actualizado**: El código del frontend ya está actualizado para usar `rol_id`, pero verifica que la aplicación funcione correctamente después de eliminar el campo.

## 🆘 Solución de Problemas

### Error: "column rol does not exist"
- **Causa**: El campo ya fue eliminado anteriormente
- **Solución**: El script usa `DROP COLUMN IF EXISTS`, así que este error no debería ocurrir

### Error: "column rol is referenced in a foreign key constraint"
- **Causa**: Hay alguna restricción que referencia el campo `rol`
- **Solución**: Verifica si hay triggers o funciones que usen el campo `rol` y actualízalos primero

### Los usuarios no pueden iniciar sesión después de eliminar el campo
- **Causa**: El código aún intenta acceder al campo `rol`
- **Solución**: Verifica que todos los archivos del código estén actualizados (ya están actualizados en este commit)

### Usuarios sin rol después de eliminar el campo
- **Causa**: Algunos usuarios no tenían `rol_id` asignado
- **Solución**: Ejecuta el Paso 1 para asignar `rol_id` a todos los usuarios

## 📞 Verificación Post-Ejecución

Después de ejecutar el script, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ Los usuarios pueden iniciar sesión
3. ✅ El rol se muestra correctamente en la interfaz
4. ✅ Puedes editar el rol de los usuarios
5. ✅ No hay errores en la consola del navegador
6. ✅ No hay errores en los logs de Supabase

## 📝 Notas Finales

- El campo `rol` VARCHAR ya no es necesario porque ahora usamos `rol_id` que es una foreign key a `sum_roles`
- Esto mejora la integridad de los datos y permite gestionar los roles de manera centralizada
- Todos los cambios en el código ya están implementados y probados

