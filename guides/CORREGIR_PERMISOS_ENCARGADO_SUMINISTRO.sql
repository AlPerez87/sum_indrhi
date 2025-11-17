-- =====================================================
-- CORREGIR PERMISOS PARA ROL "ENCARGADO DE SUMINISTRO"
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script corrige las políticas RLS para que el rol
-- "Encargado de Suministro" pueda ver todas las solicitudes
-- en todos sus estados y recibir notificaciones
-- 
-- Basado en la estructura real de la base de datos:
-- - sum_usuarios_departamentos tiene rol_id (INTEGER) que referencia sum_roles
-- - Las tablas de solicitudes usan departamento (VARCHAR) no departamento_id
-- - Los roles activos son: Administrador (id:1), Encargado de Suministro (id:6), Suministro (id:7)
-- =====================================================

-- PASO 1: Verificar estructura de la tabla sum_usuarios_departamentos
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sum_usuarios_departamentos'
AND column_name IN ('rol_id', 'user_id', 'departamento_id')
ORDER BY column_name;

-- PASO 2: Verificar usuarios con rol "Encargado de Suministro"
-- =====================================================
SELECT 
    ud.id,
    ud.username,
    ud.email,
    ud.rol_id,
    r.nombre as rol_nombre,
    ud.user_id,
    ud.departamento_id
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
WHERE r.id IS NOT NULL
  AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
  AND r.activo = TRUE
ORDER BY r.nombre, ud.username;

-- PASO 3: Verificar IDs de roles de suministro
-- =====================================================
SELECT 
    id,
    nombre,
    descripcion,
    activo
FROM sum_roles
WHERE LOWER(nombre) IN ('administrador', 'encargado de suministro', 'suministro')
AND activo = TRUE
ORDER BY nombre;

-- Deberías ver:
-- id: 1 - Administrador
-- id: 6 - Encargado de Suministro
-- id: 7 - Suministro

-- PASO 4: Eliminar políticas SELECT existentes que puedan estar bloqueando
-- =====================================================
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas by department or admin" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas by department or admin" ON sum_solicitudes_despachadas;
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - aprobadas" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - gestionadas" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - despachadas" ON sum_solicitudes_despachadas;
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin or suministro" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas by department or admin or suministro" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas by department or admin or suministro" ON sum_solicitudes_despachadas;
DROP POLICY IF EXISTS "roles_suministro_ver_todas_aprobadas" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "roles_suministro_ver_todas_gestionadas" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "roles_suministro_ver_todas_despachadas" ON sum_solicitudes_despachadas;

-- PASO 5: Crear políticas corregidas que permitan acceso completo a roles de suministro
-- =====================================================
-- Las políticas permiten:
-- 1. Usuarios con roles de suministro (Administrador, Encargado de Suministro, Suministro) ven TODAS las solicitudes
-- 2. Otros usuarios ven solo las solicitudes de su departamento (usando JOIN con sum_departamentos)

-- Política para sum_solicitudes_aprobadas
CREATE POLICY "roles_suministro_ver_todas_aprobadas"
ON sum_solicitudes_aprobadas
FOR SELECT
TO authenticated
USING (
    -- Administradores y roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.activo = TRUE
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    -- Otros usuarios pueden ver solo las de su departamento
    -- Usando JOIN con sum_departamentos para obtener el nombre del departamento
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_departamentos d ON ud.departamento_id = d.id
        WHERE ud.user_id = auth.uid()
        AND ud.departamento_id IS NOT NULL
        AND d.departamento = sum_solicitudes_aprobadas.departamento
    )
);

-- Política para sum_solicitudes_gestionadas
CREATE POLICY "roles_suministro_ver_todas_gestionadas"
ON sum_solicitudes_gestionadas
FOR SELECT
TO authenticated
USING (
    -- Administradores y roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.activo = TRUE
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    -- Otros usuarios pueden ver solo las de su departamento
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_departamentos d ON ud.departamento_id = d.id
        WHERE ud.user_id = auth.uid()
        AND ud.departamento_id IS NOT NULL
        AND d.departamento = sum_solicitudes_gestionadas.departamento
    )
);

-- Política para sum_solicitudes_despachadas
CREATE POLICY "roles_suministro_ver_todas_despachadas"
ON sum_solicitudes_despachadas
FOR SELECT
TO authenticated
USING (
    -- Administradores y roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.activo = TRUE
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    -- Otros usuarios pueden ver solo las de su departamento
    EXISTS (
        SELECT 1 
        FROM sum_usuarios_departamentos ud
        JOIN sum_departamentos d ON ud.departamento_id = d.id
        WHERE ud.user_id = auth.uid()
        AND ud.departamento_id IS NOT NULL
        AND d.departamento = sum_solicitudes_despachadas.departamento
    )
);

-- PASO 6: Verificar que las políticas se crearon correctamente
-- =====================================================
SELECT 
    tablename,
    policyname,
    cmd as command,
    roles
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- Deberías ver políticas con nombres:
-- roles_suministro_ver_todas_aprobadas
-- roles_suministro_ver_todas_gestionadas
-- roles_suministro_ver_todas_despachadas

-- PASO 7: Probar acceso con un usuario de suministro
-- =====================================================
-- Ejecuta esto como un usuario con rol "Encargado de Suministro" (ej: emedina) para verificar:
-- 
-- SELECT COUNT(*) FROM sum_solicitudes_aprobadas;
-- SELECT COUNT(*) FROM sum_solicitudes_gestionadas;
-- SELECT COUNT(*) FROM sum_solicitudes_despachadas;
--
-- Si retorna 0 cuando debería haber datos, verifica:
-- 1. Que el usuario tenga el rol correcto en sum_usuarios_departamentos (rol_id = 6 o 7)
-- 2. Que el rol en sum_roles tenga el nombre exacto "Encargado de Suministro" o "Suministro"
-- 3. Que el rol en sum_roles esté activo (activo = TRUE)
-- 4. Que RLS esté habilitado en las tablas
-- 5. Que el usuario tenga user_id correcto (UUID de Supabase Auth)

-- Consulta de verificación completa:
SELECT 
    'Aprobadas' as tipo,
    COUNT(*) as total
FROM sum_solicitudes_aprobadas
UNION ALL
SELECT 
    'Gestionadas',
    COUNT(*)
FROM sum_solicitudes_gestionadas
UNION ALL
SELECT 
    'Despachadas',
    COUNT(*)
FROM sum_solicitudes_despachadas;

-- PASO 8: Verificar si RLS está habilitado
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
AND schemaname = 'public';

-- Si RLS está deshabilitado, habilítalo:
-- ALTER TABLE sum_solicitudes_aprobadas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_gestionadas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_despachadas ENABLE ROW LEVEL SECURITY;

-- PASO 9: Verificar usuario específico (reemplaza el email con el del usuario a verificar)
-- =====================================================
SELECT 
    ud.id,
    ud.username,
    ud.email,
    ud.rol_id,
    ud.user_id,
    ud.departamento_id,
    r.nombre as rol_nombre,
    r.activo as rol_activo,
    d.departamento as nombre_departamento
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_roles r ON ud.rol_id = r.id
LEFT JOIN sum_departamentos d ON ud.departamento_id = d.id
WHERE ud.email = 'emedina@indrhi.gob.do';  -- Cambia este email por el que quieras verificar

-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Las políticas usan rol_id con JOIN a sum_roles para verificar permisos
-- 2. Las tablas de solicitudes usan el campo 'departamento' (VARCHAR) para almacenar el nombre del departamento
-- 3. Para comparar departamentos, se hace JOIN con sum_departamentos usando departamento_id
-- 4. Los roles activos son: Administrador (id:1), Encargado de Suministro (id:6), Suministro (id:7)
-- 5. Asegúrate de que todos los usuarios tengan un rol_id válido asignado
-- 6. Las políticas permiten acceso completo a roles de suministro y acceso limitado por departamento a otros usuarios
