-- =====================================================
-- ELIMINAR CAMPO ROL DE sum_usuarios_departamentos
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script elimina el campo 'rol' VARCHAR que ya no se utiliza
-- y asegura que todas las referencias usen 'rol_id' en su lugar
-- =====================================================

-- =====================================================
-- PASO 1: Verificar que todos los usuarios tienen rol_id asignado
-- =====================================================
-- Ejecuta esta consulta primero para verificar que no hay usuarios sin rol_id
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

-- =====================================================
-- PASO 2: Asignar rol_id a usuarios que no lo tengan
-- =====================================================
-- Si hay usuarios sin rol_id, ejecuta esto para asignarles 'Usuario' por defecto
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Usuario' LIMIT 1)
WHERE rol_id IS NULL;

-- =====================================================
-- PASO 3: Eliminar la restricción NOT NULL del campo rol (si existe)
-- =====================================================
-- Primero debemos eliminar la restricción NOT NULL antes de poder eliminar la columna
ALTER TABLE sum_usuarios_departamentos 
ALTER COLUMN rol DROP NOT NULL;

-- =====================================================
-- PASO 4: Eliminar el campo rol de la tabla
-- =====================================================
-- ⚠️ ADVERTENCIA: Esta acción es irreversible
-- Asegúrate de haber verificado que todos los usuarios tienen rol_id antes de ejecutar esto
ALTER TABLE sum_usuarios_departamentos 
DROP COLUMN IF EXISTS rol;

-- =====================================================
-- PASO 5: Verificar que la eliminación fue exitosa
-- =====================================================
-- Esta consulta debe mostrar solo las columnas sin 'rol'
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sum_usuarios_departamentos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Verifica que todos los usuarios tienen rol_id y el nombre del rol
SELECT 
  ud.id,
  ud.username,
  ud.email,
  ud.rol_id,
  r.nombre AS rol_actual,
  CASE 
    WHEN ud.rol_id IS NULL THEN '❌ ERROR: Usuario sin rol_id'
    ELSE '✅ OK'
  END AS estado
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
ORDER BY ud.id;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Este script elimina permanentemente el campo 'rol' VARCHAR
-- 2. Asegúrate de que todos los usuarios tengan 'rol_id' asignado antes de ejecutar
-- 3. El código del frontend ya debe estar actualizado para usar 'rol_id'
-- 4. Después de ejecutar este script, el campo 'rol' ya no existirá en la tabla

