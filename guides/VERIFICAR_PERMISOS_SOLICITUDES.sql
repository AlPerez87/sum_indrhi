-- =====================================================
-- COMANDOS PARA VERIFICAR PERMISOS DE SOLICITUDES
-- Roles: Encargado de Suministro y Suministro
-- =====================================================

-- 1. VERIFICAR POLÍTICAS RLS EN LAS TABLAS DE SOLICITUDES
-- =====================================================

-- Ver políticas de sum_solicitudes_aprobadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY tablename, policyname;

-- 2. VERIFICAR CUÁNTAS SOLICITUDES HAY EN CADA TABLA
-- =====================================================

-- Contar solicitudes aprobadas
SELECT COUNT(*) as total_aprobadas FROM sum_solicitudes_aprobadas;

-- Contar solicitudes gestionadas
SELECT COUNT(*) as total_gestionadas FROM sum_solicitudes_gestionadas;

-- Contar solicitudes despachadas
SELECT COUNT(*) as total_despachadas FROM sum_solicitudes_despachadas;

-- Ver todas las solicitudes aprobadas con detalles
SELECT 
    id,
    numero_solicitud,
    fecha,
    departamento,
    articulos_cantidades
FROM sum_solicitudes_aprobadas
ORDER BY id DESC;

-- Ver todas las solicitudes gestionadas con detalles
SELECT 
    id,
    numero_solicitud,
    fecha,
    departamento,
    articulos_cantidades
FROM sum_solicitudes_gestionadas
ORDER BY id DESC;

-- Ver todas las solicitudes despachadas con detalles
SELECT 
    id,
    numero_solicitud,
    fecha,
    departamento,
    articulos_cantidades,
    despachado_por
FROM sum_solicitudes_despachadas
ORDER BY id DESC;

-- 3. VERIFICAR ROLES DE USUARIOS
-- =====================================================

-- Ver usuarios con roles Encargado de Suministro o Suministro
SELECT 
    id,
    username,
    email,
    rol,
    departamento_id
FROM sum_usuarios_departamentos
WHERE LOWER(rol) IN ('encargado de suministro', 'suministro')
ORDER BY rol, username;

-- 4. VERIFICAR SI HAY POLÍTICAS QUE FILTRAN POR DEPARTAMENTO
-- =====================================================

-- Ver políticas detalladas con su definición SQL
SELECT 
    p.tablename,
    p.policyname,
    p.cmd as command,
    p.qual as using_expression,
    p.with_check as with_check_expression,
    pg_get_expr(p.qual, p.polrelid) as using_clause,
    pg_get_expr(p.with_check, p.polrelid) as with_check_clause
FROM pg_policies p
JOIN pg_class c ON c.relname = p.tablename
WHERE p.tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY p.tablename, p.policyname;

-- 5. CREAR/ACTUALIZAR POLÍTICAS PARA PERMITIR ACCESO TOTAL A ESTOS ROLES
-- =====================================================

-- IMPORTANTE: Ejecuta estos comandos solo si las políticas actuales están restringiendo el acceso

-- Política para sum_solicitudes_aprobadas (permitir lectura a todos los roles de suministro)
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - aprobadas" ON sum_solicitudes_aprobadas;

CREATE POLICY "Permitir lectura a roles de suministro - aprobadas"
ON sum_solicitudes_aprobadas
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND LOWER(rol) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_aprobadas
            WHERE sum_solicitudes_aprobadas.id = sum_solicitudes_aprobadas.id
        )
    )
);

-- Política para sum_solicitudes_gestionadas
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - gestionadas" ON sum_solicitudes_gestionadas;

CREATE POLICY "Permitir lectura a roles de suministro - gestionadas"
ON sum_solicitudes_gestionadas
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND LOWER(rol) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_gestionadas
            WHERE sum_solicitudes_gestionadas.id = sum_solicitudes_gestionadas.id
        )
    )
);

-- Política para sum_solicitudes_despachadas
DROP POLICY IF EXISTS "Permitir lectura a roles de suministro - despachadas" ON sum_solicitudes_despachadas;

CREATE POLICY "Permitir lectura a roles de suministro - despachadas"
ON sum_solicitudes_despachadas
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND LOWER(rol) IN ('administrador', 'encargado de suministro', 'suministro')
    )
    OR
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_despachadas
            WHERE sum_solicitudes_despachadas.id = sum_solicitudes_despachadas.id
        )
    )
);

-- 6. VERIFICAR DESPUÉS DE CREAR LAS POLÍTICAS
-- =====================================================

-- Ver todas las políticas actuales
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY tablename, policyname;

-- 7. ALTERNATIVA: DESHABILITAR RLS TEMPORALMENTE PARA PRUEBAS (NO RECOMENDADO EN PRODUCCIÓN)
-- =====================================================

-- Solo para pruebas, puedes deshabilitar RLS temporalmente:
-- ALTER TABLE sum_solicitudes_aprobadas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_gestionadas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_despachadas DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitar:
-- ALTER TABLE sum_solicitudes_aprobadas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_gestionadas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sum_solicitudes_despachadas ENABLE ROW LEVEL SECURITY;

-- 8. VERIFICAR SI LAS TABLAS TIENEN CAMPO departamento_id
-- =====================================================

-- Ver estructura de las tablas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY table_name, ordinal_position;

-- NOTA: Si las tablas no tienen departamento_id, las políticas anteriores necesitarán ajustarse
-- para usar solo el campo 'departamento' (VARCHAR) en lugar de departamento_id

