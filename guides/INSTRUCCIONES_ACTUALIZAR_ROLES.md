# 📋 Instrucciones para Actualizar los Roles del Sistema

Este documento te guía paso a paso para actualizar los roles del sistema según las nuevas especificaciones.

## 🎯 Objetivo

Actualizar los roles del sistema a los siguientes:
- ✅ **Administrador** (se mantiene)
- 🆕 **Dirección Administrativa** (nuevo)
- 🆕 **Encargado de Suministro** (nuevo)
- 🆕 **Suministro** (nuevo)
- 🆕 **Departamento** (nuevo)

## 📝 Pasos para Ejecutar

### Paso 1: Revisar Roles Actuales

Antes de ejecutar el script, revisa qué roles existen y cuántos usuarios tienen cada uno:

```sql
SELECT 
  r.id,
  r.nombre AS rol_actual,
  COUNT(ud.id) AS usuarios_asignados,
  STRING_AGG(ud.username, ', ' ORDER BY ud.username) AS usuarios
FROM sum_roles r
LEFT JOIN sum_usuarios_departamentos ud ON r.id = ud.rol_id
GROUP BY r.id, r.nombre
ORDER BY r.nombre;
```

### Paso 2: Ejecutar el Script de Actualización

1. Abre el **SQL Editor** en tu proyecto de Supabase
2. Abre el archivo `ACTUALIZAR_ROLES.sql`
3. Copia y pega **todo el contenido** en el SQL Editor
4. Ejecuta el script completo
5. Verifica que no haya errores

### Paso 3: Verificar la Migración

Después de ejecutar el script, verifica:

1. **Que todos los usuarios tienen roles válidos:**
```sql
SELECT 
  ud.username,
  ud.email,
  r.nombre AS rol_actual
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
ORDER BY ud.username;
```

2. **Que solo existen los 5 roles activos:**
```sql
SELECT nombre, descripcion, activo
FROM sum_roles
WHERE activo = TRUE
ORDER BY nombre;
```

3. **Resumen por rol:**
```sql
SELECT 
  r.nombre AS rol,
  COUNT(ud.id) AS cantidad_usuarios
FROM sum_roles r
LEFT JOIN sum_usuarios_departamentos ud ON r.id = ud.rol_id
WHERE r.activo = TRUE
GROUP BY r.id, r.nombre
ORDER BY r.nombre;
```

## 🔄 Migración de Roles Antiguos

El script migra automáticamente los usuarios así:

- **Director** → **Dirección Administrativa**
- **Usuario** → **Departamento**
- **Almacenista** → **Suministro**
- **Cualquier otro rol** → **Departamento** (por defecto)

### ⚠️ Ajustar Migración Personalizada

Si necesitas cambiar cómo se migran los usuarios, modifica el **PASO 3** del script antes de ejecutar:

```sql
-- Ejemplo: Si quieres migrar "Director" a "Encargado de Suministro" en lugar de "Dirección Administrativa"
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Encargado de Suministro' LIMIT 1)
WHERE rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Director' LIMIT 1);
```

## 📊 Roles Finales

Después de ejecutar el script, tendrás estos 5 roles activos:

| Rol | Descripción |
|-----|-------------|
| **Administrador** | Usuario con acceso completo al sistema |
| **Dirección Administrativa** | Rol para dirección administrativa del sistema |
| **Encargado de Suministro** | Rol para encargados de suministro |
| **Suministro** | Rol para personal de suministro |
| **Departamento** | Rol para usuarios de departamento |

## 🔍 Consultas Útiles

### Ver usuarios sin rol asignado:
```sql
SELECT id, username, email
FROM sum_usuarios_departamentos
WHERE rol_id IS NULL;
```

### Asignar un rol específico a un usuario:
```sql
-- Reemplaza 'nombre_usuario' y 'Nombre del Rol' con los valores reales
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Nombre del Rol' LIMIT 1)
WHERE username = 'nombre_usuario';
```

### Ver todos los roles (activos e inactivos):
```sql
SELECT 
  nombre,
  descripcion,
  activo,
  (SELECT COUNT(*) FROM sum_usuarios_departamentos WHERE rol_id = sum_roles.id) AS usuarios_asignados
FROM sum_roles
ORDER BY activo DESC, nombre;
```

## ⚠️ Notas Importantes

1. **Roles antiguos no se eliminan**: Los roles antiguos (Director, Usuario, Almacenista) se desactivan pero NO se eliminan para mantener el historial.

2. **Migración automática**: El script migra automáticamente los usuarios de roles antiguos a los nuevos según el mapeo definido.

3. **Verificación requerida**: Después de ejecutar el script, verifica que todos los usuarios tienen roles válidos asignados.

4. **Permisos**: Después de actualizar los roles, necesitarás configurar los permisos y acciones para cada rol según lo que indiques.

## 🆘 Solución de Problemas

### Error: "duplicate key value violates unique constraint"
- **Causa**: El rol ya existe
- **Solución**: El script usa `ON CONFLICT DO UPDATE`, así que este error no debería ocurrir

### Usuarios sin rol después de la migración
- **Causa**: Algunos usuarios tenían roles que no se migraron correctamente
- **Solución**: Ejecuta esta consulta para asignarles "Departamento" por defecto:
```sql
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Departamento' LIMIT 1)
WHERE rol_id IS NULL;
```

### Los roles antiguos siguen apareciendo
- **Causa**: Los roles se desactivaron pero no se eliminaron
- **Solución**: Esto es normal. Los roles antiguos están desactivados (`activo = FALSE`) y no aparecerán en las consultas que filtren por `activo = TRUE`.

## ✅ Verificación Post-Ejecución

Después de ejecutar el script, verifica:

1. ✅ Solo existen 5 roles activos
2. ✅ Todos los usuarios tienen un rol válido asignado
3. ✅ La aplicación muestra correctamente los nuevos roles
4. ✅ Los usuarios pueden iniciar sesión correctamente
5. ✅ No hay errores en la consola del navegador

## 📝 Próximos Pasos

Después de actualizar los roles, necesitarás:

1. Configurar los permisos para cada rol
2. Actualizar las políticas RLS si es necesario
3. Probar que cada rol tiene acceso a las funcionalidades correctas
4. Documentar los permisos de cada rol

