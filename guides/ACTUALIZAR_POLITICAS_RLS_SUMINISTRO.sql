-- =====================================================
-- ACTUALIZAR POLÍTICAS RLS PARA ROLES DE SUMINISTRO
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script actualiza las políticas RLS para que los roles
-- "Encargado de Suministro" y "Suministro" puedan ver todas las solicitudes
-- de las tablas: aprobadas, gestionadas y despachadas
-- =====================================================

-- PASO 1: Verificar los IDs de los roles (EJECUTA ESTO PRIMERO)
-- =====================================================
SELECT 
    id,
    nombre,
    'Usar este ID en las políticas' as nota
FROM sum_roles
WHERE LOWER(nombre) IN ('administrador', 'encargado de suministro', 'suministro')
AND activo = TRUE
ORDER BY nombre;

-- ANOTA LOS IDs QUE OBTENGAS ARRIBA
-- Ejemplo: Administrador = 1, Encargado de Suministro = 2, Suministro = 3

-- PASO 2: Verificar la estructura de las tablas
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
AND column_name IN ('departamento', 'departamento_id')
ORDER BY table_name, column_name;

-- PASO 3: Eliminar las políticas SELECT existentes
-- =====================================================
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas by department or admin" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas by department or admin" ON sum_solicitudes_despachadas;

-- PASO 4: Crear nuevas políticas usando NOMBRES de roles (RECOMENDADO)
-- =====================================================
-- Esta opción es más fácil de mantener porque usa nombres en lugar de IDs

-- Política para sum_solicitudes_aprobadas
CREATE POLICY "Users can view solicitudes_aprobadas by department or admin or suministro"
ON sum_solicitudes_aprobadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento (si la tabla tiene departamento_id)
    -- Si la tabla NO tiene departamento_id, esta parte se puede eliminar o ajustar
    (
        EXISTS (
            SELECT 1 FROM sum_usuarios_departamentos
            WHERE user_id = auth.uid()
            AND departamento_id IS NOT NULL
        )
        AND
        EXISTS (
            SELECT 1 FROM sum_solicitudes_aprobadas sa
            JOIN sum_usuarios_departamentos ud ON ud.departamento_id = sa.departamento_id
            WHERE ud.user_id = auth.uid()
            AND sa.id = sum_solicitudes_aprobadas.id
        )
    )
);

-- Política para sum_solicitudes_gestionadas
CREATE POLICY "Users can view solicitudes_gestionadas by department or admin or suministro"
ON sum_solicitudes_gestionadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento (si la tabla tiene departamento_id)
    (
        EXISTS (
            SELECT 1 FROM sum_usuarios_departamentos
            WHERE user_id = auth.uid()
            AND departamento_id IS NOT NULL
        )
        AND
        EXISTS (
            SELECT 1 FROM sum_solicitudes_gestionadas sg
            JOIN sum_usuarios_departamentos ud ON ud.departamento_id = sg.departamento_id
            WHERE ud.user_id = auth.uid()
            AND sg.id = sum_solicitudes_gestionadas.id
        )
    )
);

-- Política para sum_solicitudes_despachadas
CREATE POLICY "Users can view solicitudes_despachadas by department or admin or suministro"
ON sum_solicitudes_despachadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver TODAS las solicitudes
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento (si la tabla tiene departamento_id)
    (
        EXISTS (
            SELECT 1 FROM sum_usuarios_departamentos
            WHERE user_id = auth.uid()
            AND departamento_id IS NOT NULL
        )
        AND
        EXISTS (
            SELECT 1 FROM sum_solicitudes_despachadas sd
            JOIN sum_usuarios_departamentos ud ON ud.departamento_id = sd.departamento_id
            WHERE ud.user_id = auth.uid()
            AND sd.id = sum_solicitudes_despachadas.id
        )
    )
);

-- PASO 5: Verificar que las políticas se crearon correctamente
-- =====================================================
SELECT 
    tablename,
    policyname,
    cmd,
    pg_get_expr(qual, polrelid) as using_clause
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
AND cmd = 'SELECT'
ORDER BY tablename;

-- PASO 6: Verificar usuarios con roles de suministro
-- =====================================================
SELECT 
    ud.id,
    ud.username,
    ud.email,
    r.nombre as rol_nombre,
    r.id as rol_id
FROM sum_usuarios_departamentos ud
JOIN sum_roles r ON ud.rol_id = r.id
WHERE LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
AND r.activo = TRUE
ORDER BY r.nombre, ud.username;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Si las tablas NO tienen el campo departamento_id, 
--    las políticas anteriores pueden fallar. En ese caso,
--    usa la versión simplificada que solo verifica roles.
--
-- 2. Si necesitas una política más simple que permita 
--    acceso total solo a roles de suministro (sin filtro 
--    por departamento), usa esta versión:
--
--    CREATE POLICY "roles_suministro_lectura_total"
--    ON sum_solicitudes_aprobadas
--    FOR SELECT
--    TO authenticated
--    USING (
--        EXISTS (
--            SELECT 1 FROM sum_usuarios_departamentos ud
--            JOIN sum_roles r ON ud.rol_id = r.id
--            WHERE ud.user_id = auth.uid()
--            AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
--            AND r.activo = TRUE
--        )
--    );
--
-- 3. Después de ejecutar este script, prueba en la aplicación
--    que los usuarios con roles de suministro puedan ver
--    todas las solicitudes.

