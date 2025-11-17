# Instrucciones para Corregir Permisos del Rol "Encargado de Suministro"

## Problema
El rol "Encargado de Suministro" no puede:
- Ver las solicitudes en ninguno de sus estados (aprobadas, gestionadas, despachadas)
- Ver las solicitudes en las pantallas correspondientes
- Recibir notificaciones cuando una solicitud es aprobada

## Causa
Las políticas RLS (Row Level Security) en Supabase están bloqueando el acceso a estos usuarios porque no están correctamente configuradas para reconocer el rol "Encargado de Suministro".

## Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre tu proyecto en Supabase
2. Ve al **SQL Editor**
3. Abre el archivo `guides/CORREGIR_PERMISOS_ENCARGADO_SUMINISTRO.sql`
4. Copia y pega el contenido completo en el SQL Editor
5. Ejecuta el script completo

### Paso 2: Verificar que las Políticas se Crearon Correctamente

Después de ejecutar el script, verifica que las políticas se crearon ejecutando:

```sql
SELECT 
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY tablename, policyname;
```

Deberías ver políticas con nombres como:
- `roles_suministro_ver_todas_aprobadas`
- `roles_suministro_ver_todas_gestionadas`
- `roles_suministro_ver_todas_despachadas`

### Paso 3: Verificar el Rol del Usuario

Asegúrate de que el usuario tenga el rol correcto usando `rol_id`:

```sql
SELECT 
    ud.id,
    ud.username,
    ud.email,
    ud.rol_id,
    r.nombre as rol_nombre,
    r.activo as rol_activo
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
WHERE ud.email = 'email_del_usuario@ejemplo.com';
```

El campo `rol_nombre` debe contener exactamente: **"Encargado de Suministro"** o **"Suministro"**
El campo `rol_activo` debe ser **TRUE**

Verifica que el `rol_id` apunte al ID correcto:

```sql
SELECT 
    r.id,
    r.nombre,
    r.activo
FROM sum_roles r
WHERE LOWER(r.nombre) IN ('encargado de suministro', 'suministro')
AND r.activo = TRUE;
```

### Paso 4: Probar el Acceso

1. Cierra sesión en la aplicación
2. Inicia sesión con un usuario que tenga el rol "Encargado de Suministro"
3. Verifica que puedas:
   - Ver las solicitudes aprobadas en `/solicitudes-aprobadas`
   - Ver las solicitudes gestionadas en `/solicitudes-gestionadas`
   - Ver las solicitudes despachadas en `/solicitudes-despachadas`
   - Ver las notificaciones en la campana cuando se apruebe una solicitud
   - Ver los datos en el Panel

### Paso 5: Si Aún No Funciona

Si después de ejecutar el script aún no funciona, verifica:

1. **RLS está habilitado**: Las tablas deben tener RLS habilitado
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN (
       'sum_solicitudes_aprobadas',
       'sum_solicitudes_gestionadas',
       'sum_solicitudes_despachadas'
   );
   ```

2. **El usuario está autenticado**: Verifica que el usuario tenga una sesión activa en Supabase Auth

3. **El rol está configurado correctamente**: 
   - El campo `rol_id` en `sum_usuarios_departamentos` debe apuntar al ID correcto en `sum_roles`
   - El nombre del rol en `sum_roles` debe ser exactamente "Encargado de Suministro" o "Suministro"
   - El campo `activo` en `sum_roles` debe ser `TRUE`

4. **Las tablas tienen el campo correcto**: Si las tablas usan `departamento_id` en lugar de `departamento`, necesitarás ajustar las políticas

### Notas Importantes

- El script elimina las políticas SELECT existentes antes de crear las nuevas
- Las nuevas políticas permiten acceso completo a usuarios con roles de suministro
- Otros usuarios solo pueden ver solicitudes de su propio departamento
- Las políticas usan `rol_id` con JOIN a `sum_roles` para verificar los permisos
- Asegúrate de que todos los usuarios tengan un `rol_id` válido asignado

### Contacto

Si después de seguir estos pasos el problema persiste, verifica:
1. Los logs de la consola del navegador para ver errores específicos
2. Los logs de Supabase para ver errores de políticas RLS
3. Que el usuario tenga permisos de autenticación en Supabase Auth

