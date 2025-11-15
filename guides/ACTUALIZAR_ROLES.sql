-- =====================================================
-- ACTUALIZACIÓN DE ROLES DEL SISTEMA
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script actualiza los roles existentes según las nuevas especificaciones:
-- - Administrador (se mantiene)
-- - Dirección Administrativa (nuevo)
-- - Encargado de Suministro (nuevo)
-- - Suministro (nuevo)
-- - Departamento (nuevo)
-- =====================================================

-- =====================================================
-- PASO 1: Verificar roles actuales y usuarios asignados
-- =====================================================
SELECT 
  r.id,
  r.nombre AS rol_actual,
  r.descripcion,
  r.activo,
  COUNT(ud.id) AS usuarios_asignados,
  STRING_AGG(ud.username, ', ' ORDER BY ud.username) AS usuarios
FROM sum_roles r
LEFT JOIN sum_usuarios_departamentos ud ON r.id = ud.rol_id
GROUP BY r.id, r.nombre, r.descripcion, r.activo
ORDER BY r.nombre;

-- =====================================================
-- PASO 2: Crear los nuevos roles si no existen
-- =====================================================

-- Crear rol "Dirección Administrativa"
INSERT INTO sum_roles (nombre, descripcion, activo) 
VALUES ('Dirección Administrativa', 'Rol para dirección administrativa del sistema', TRUE)
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion, activo = TRUE;

-- Crear rol "Encargado de Suministro"
INSERT INTO sum_roles (nombre, descripcion, activo) 
VALUES ('Encargado de Suministro', 'Rol para encargados de suministro', TRUE)
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion, activo = TRUE;

-- Crear rol "Suministro"
INSERT INTO sum_roles (nombre, descripcion, activo) 
VALUES ('Suministro', 'Rol para personal de suministro', TRUE)
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion, activo = TRUE;

-- Crear rol "Departamento"
INSERT INTO sum_roles (nombre, descripcion, activo) 
VALUES ('Departamento', 'Rol para usuarios de departamento', TRUE)
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion, activo = TRUE;

-- Asegurar que "Administrador" existe y está activo
INSERT INTO sum_roles (nombre, descripcion, activo) 
VALUES ('Administrador', 'Usuario con acceso completo al sistema', TRUE)
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion, activo = TRUE;

-- =====================================================
-- PASO 3: Migrar usuarios de roles antiguos a nuevos roles
-- =====================================================
-- ⚠️ IMPORTANTE: Revisa estas migraciones y ajústalas según tus necesidades
-- Por defecto, migramos así:
-- - "Director" -> "Dirección Administrativa"
-- - "Usuario" -> "Departamento"
-- - "Almacenista" -> "Suministro"
-- - Cualquier otro rol -> "Departamento"

-- Migrar usuarios con rol "Director" a "Dirección Administrativa"
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Dirección Administrativa' LIMIT 1)
WHERE rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Director' LIMIT 1);

-- Migrar usuarios con rol "Usuario" a "Departamento"
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Departamento' LIMIT 1)
WHERE rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Usuario' LIMIT 1);

-- Migrar usuarios con rol "Almacenista" a "Suministro"
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Suministro' LIMIT 1)
WHERE rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Almacenista' LIMIT 1);

-- Migrar cualquier otro rol que no sea Administrador a "Departamento" por defecto
-- (Ajusta esto según tus necesidades específicas)
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Departamento' LIMIT 1)
WHERE rol_id NOT IN (
  SELECT id FROM sum_roles 
  WHERE nombre IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento')
);

-- =====================================================
-- PASO 4: Desactivar roles antiguos que ya no se usan
-- =====================================================
-- Desactivar roles antiguos (no los eliminamos por seguridad, solo los desactivamos)
UPDATE sum_roles 
SET activo = FALSE
WHERE nombre IN ('Director', 'Usuario', 'Almacenista')
  AND nombre NOT IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento');

-- =====================================================
-- PASO 5: Verificar la migración
-- =====================================================
-- Verificar que todos los usuarios tienen roles válidos
SELECT 
  'Verificación de migración' AS tipo,
  COUNT(*) AS total_usuarios,
  COUNT(CASE WHEN r.nombre IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento') THEN 1 END) AS usuarios_con_roles_validos,
  COUNT(CASE WHEN r.nombre NOT IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento') OR r.nombre IS NULL THEN 1 END) AS usuarios_sin_rol_valido
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id;

-- Ver detalle de usuarios y sus nuevos roles
SELECT 
  ud.id,
  ud.username,
  ud.email,
  r.nombre AS rol_actual,
  r.descripcion AS descripcion_rol,
  CASE 
    WHEN r.nombre IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento') THEN '✅ Rol válido'
    WHEN r.nombre IS NULL THEN '❌ Sin rol asignado'
    ELSE '⚠️ Rol antiguo - requiere atención'
  END AS estado
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
ORDER BY ud.username;

-- Ver resumen por rol
SELECT 
  r.nombre AS rol,
  COUNT(ud.id) AS cantidad_usuarios,
  STRING_AGG(ud.username, ', ' ORDER BY ud.username) AS usuarios
FROM sum_roles r
LEFT JOIN sum_usuarios_departamentos ud ON r.id = ud.rol_id
WHERE r.activo = TRUE
  AND r.nombre IN ('Administrador', 'Dirección Administrativa', 'Encargado de Suministro', 'Suministro', 'Departamento')
GROUP BY r.id, r.nombre
ORDER BY cantidad_usuarios DESC, r.nombre;

-- =====================================================
-- PASO 6: Listar roles activos finales
-- =====================================================
SELECT 
  id,
  nombre,
  descripcion,
  activo,
  creado_en
FROM sum_roles
WHERE activo = TRUE
ORDER BY nombre;
