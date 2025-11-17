-- =====================================================
-- CORREGIR PERMISOS PARA ROL "ENCARGADO DE SUMINISTRO"
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script corrige las políticas RLS para que el rol
-- "Encargado de Suministro" pueda ver todas las solicitudes
-- en todos sus estados y recibir notificaciones
-- =====================================================

-- PASO 1: Verificar estructura de la tabla sum_usuarios_departamentos
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sum_usuarios_departamentos'
AND column_name IN ('rol_id', 'user_id')
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

-- ANOTA LOS IDs QUE OBTENGAS (ejemplo: Administrador = 1, Encargado de Suministro = 2, Suministro = 3)

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

-- PASO 5: Crear políticas que permitan acceso completo a roles de suministro
-- =====================================================
-- Usando rol_id con JOIN a sum_roles
-- =====================================================

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
    -- Otros usuarios pueden ver solo las de su departamento (si tienen departamento_id)
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IS NOT NULL
        AND departamento = (
            SELECT departamento FROM sum_solicitudes_aprobadas
            WHERE sum_solicitudes_aprobadas.id = sum_solicitudes_aprobadas.id
        )
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
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IS NOT NULL
        AND departamento = (
            SELECT departamento FROM sum_solicitudes_gestionadas
            WHERE sum_solicitudes_gestionadas.id = sum_solicitudes_gestionadas.id
        )
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
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IS NOT NULL
        AND departamento = (
            SELECT departamento FROM sum_solicitudes_despachadas
            WHERE sum_solicitudes_despachadas.id = sum_solicitudes_despachadas.id
        )
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
ORDER BY tablename, policyname;

-- PASO 7: Probar acceso con un usuario de suministro
-- =====================================================
-- Ejecuta esto como un usuario con rol "Encargado de Suministro" para verificar:
-- SELECT COUNT(*) FROM sum_solicitudes_aprobadas;
-- SELECT COUNT(*) FROM sum_solicitudes_gestionadas;
-- SELECT COUNT(*) FROM sum_solicitudes_despachadas;

-- Si retorna 0 cuando debería haber datos, verifica:
-- 1. Que el usuario tenga el rol correcto en sum_usuarios_departamentos
-- 2. Que el campo 'rol_id' apunte al ID correcto en sum_roles
-- 3. Que el rol en sum_roles tenga el nombre exacto "Encargado de Suministro" o "Suministro"
-- 4. Que el rol en sum_roles esté activo (activo = TRUE)
-- 5. Que RLS esté habilitado en las tablas

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

-- NOTA IMPORTANTE:
-- =====================================================
-- Si las tablas tienen un campo 'departamento_id' en lugar de 'departamento',
-- necesitarás ajustar las políticas para usar ese campo. Ejemplo:
--
-- AND departamento_id = (
--     SELECT departamento_id FROM sum_solicitudes_aprobadas
--     WHERE sum_solicitudes_aprobadas.id = sum_solicitudes_aprobadas.id
-- )

