# 📋 Instrucciones para Migración de Roles y Corrección de Permisos

## Resumen de Cambios

Esta migración implementa los siguientes cambios en el sistema:

1. **Nueva tabla `sum_roles`**: Catálogo de roles del sistema
2. **Campo `nombre_completo`**: Agregado a `sum_usuarios_departamentos`
3. **Campo `rol_id`**: Reemplaza el campo `rol` VARCHAR por una foreign key a `sum_roles`
4. **Campo `despachado_por_id`**: Agregado a `sum_solicitudes_despachadas` como foreign key a `sum_usuarios_departamentos`
5. **Corrección de políticas RLS**: Los usuarios ahora pueden ver solicitudes de su departamento y los administradores pueden ver todas las solicitudes

## Pasos para Aplicar la Migración

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido completo del archivo `MIGRACION_ROLES_Y_PERMISOS.sql`
3. Ejecuta el script completo
4. Verifica que no haya errores en la ejecución

### Paso 2: Verificar la Migración de Datos

Después de ejecutar el script, verifica que:

1. **Roles creados**: Deberías tener al menos estos roles en `sum_roles`:
   - Administrador
   - Director
   - Usuario
   - Almacenista

2. **Usuarios migrados**: Verifica que los usuarios tengan `rol_id` asignado:
   ```sql
   SELECT id, username, rol, rol_id, nombre_completo 
   FROM sum_usuarios_departamentos;
   ```

3. **Solicitudes despachadas**: Verifica que las solicitudes despachadas tengan `despachado_por_id` cuando sea posible:
   ```sql
   SELECT id, numero_solicitud, despachado_por, despachado_por_id 
   FROM sum_solicitudes_despachadas;
   ```

### Paso 3: Actualizar Datos Existentes (Opcional)

Si necesitas actualizar el campo `nombre_completo` de los usuarios existentes:

```sql
-- Ejemplo: Actualizar nombre_completo basado en username
UPDATE sum_usuarios_departamentos 
SET nombre_completo = username 
WHERE nombre_completo IS NULL OR nombre_completo = '';
```

### Paso 4: Probar los Permisos

1. **Inicia sesión con un usuario regular** (no administrador):
   - Debe poder ver sus propias solicitudes
   - Debe poder ver solicitudes de otros usuarios del mismo departamento
   - NO debe poder ver solicitudes de otros departamentos

2. **Inicia sesión con un usuario administrador**:
   - Debe poder ver TODAS las solicitudes del sistema
   - Debe poder ver solicitudes de todos los departamentos

## Estructura de la Nueva Tabla de Roles

La tabla `sum_roles` tiene la siguiente estructura:

- `id`: SERIAL PRIMARY KEY
- `nombre`: VARCHAR(50) NOT NULL UNIQUE
- `descripcion`: TEXT
- `activo`: BOOLEAN DEFAULT TRUE
- `creado_en`: TIMESTAMP DEFAULT NOW()

## Cambios en el Código del Frontend

El código del frontend ya ha sido actualizado para:

1. **Obtener roles**: Usa `crmService.getRoles()` para obtener la lista de roles
2. **Mostrar nombre completo**: Los servicios ahora incluyen `nombre_completo` en las consultas
3. **Mostrar despachado por**: Las solicitudes despachadas ahora muestran el `nombre_completo` del usuario que despachó

## Nuevas Funciones Disponibles en el Servicio

```javascript
// Obtener todos los roles
await crmService.getRoles()

// Crear un nuevo rol
await crmService.createRol({ nombre: 'Nuevo Rol', descripcion: '...' })

// Actualizar rol
await crmService.updateRol(id, { nombre: 'Rol Actualizado' })

// Eliminar rol
await crmService.deleteRol(id)

// Actualizar rol de usuario
await crmService.updateUsuarioRol(usuarioId, rolId)

// Actualizar nombre completo de usuario
await crmService.updateUsuarioNombreCompleto(usuarioId, 'Nombre Completo')
```

## Políticas RLS Implementadas

### Para `sum_solicitudes`:
- **SELECT**: Los usuarios pueden ver sus propias solicitudes, solicitudes de su departamento, o todas si son administradores
- **INSERT**: Solo pueden insertar sus propias solicitudes
- **UPDATE**: Pueden actualizar sus propias solicitudes o administradores pueden actualizar cualquiera
- **DELETE**: Pueden eliminar sus propias solicitudes o administradores pueden eliminar cualquiera

### Para otras tablas de solicitudes (`sum_solicitudes_aprobadas`, `sum_solicitudes_gestionadas`, `sum_solicitudes_despachadas`):
- **SELECT**: Los usuarios pueden ver solicitudes de su departamento o todas si son administradores

## Notas Importantes

1. **Compatibilidad hacia atrás**: El campo `rol` VARCHAR se mantiene por compatibilidad, pero se recomienda usar `rol_id` en el futuro.

2. **Campo `despachado_por`**: Se mantiene como VARCHAR por compatibilidad, pero el nuevo campo `despachado_por_id` es la referencia correcta.

3. **Funciones helper**: Se crearon dos funciones SQL:
   - `es_administrador(user_uuid)`: Verifica si un usuario es administrador
   - `obtener_departamento_usuario(user_uuid)`: Obtiene el departamento_id de un usuario

4. **Eliminar columnas antiguas**: Después de verificar que todo funciona correctamente, puedes eliminar las columnas antiguas:
   ```sql
   -- Descomentar estas líneas después de verificar que todo funciona
   -- ALTER TABLE sum_usuarios_departamentos DROP COLUMN IF EXISTS rol;
   -- ALTER TABLE sum_solicitudes_despachadas DROP COLUMN IF EXISTS despachado_por;
   ```

## Solución de Problemas

### Error: "function es_administrador does not exist"
- Asegúrate de que el script SQL se ejecutó completamente
- Verifica que las funciones se crearon correctamente ejecutando:
  ```sql
  SELECT proname FROM pg_proc WHERE proname IN ('es_administrador', 'obtener_departamento_usuario');
  ```

### Los usuarios no pueden ver solicitudes de su departamento
- Verifica que los usuarios tengan `departamento_id` asignado
- Verifica que las políticas RLS se crearon correctamente:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'sum_solicitudes';
  ```

### Los administradores no pueden ver todas las solicitudes
- Verifica que el rol "Administrador" existe en `sum_roles`
- Verifica que el usuario tiene `rol_id` apuntando al rol "Administrador"
- Verifica que la función `es_administrador()` funciona correctamente:
  ```sql
  SELECT es_administrador('UUID_DEL_USUARIO');
  ```

## Soporte

Si encuentras algún problema durante la migración, verifica:
1. Los logs de Supabase para errores SQL
2. La consola del navegador para errores del frontend
3. Que todas las políticas RLS estén habilitadas correctamente

