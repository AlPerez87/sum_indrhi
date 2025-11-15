# Comandos Supabase para Verificar Permisos de Solicitudes

## Problema
Los roles "Encargado de Suministro" y "Suministro" no pueden ver todas las solicitudes existentes en las tablas de aprobadas, gestionadas y despachadas.

## Pasos para Verificar y Corregir

### 1. Verificar Cuántas Solicitudes Existen

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Contar solicitudes en cada tabla
SELECT 'Aprobadas' as tipo, COUNT(*) as total FROM sum_solicitudes_aprobadas
UNION ALL
SELECT 'Gestionadas', COUNT(*) FROM sum_solicitudes_gestionadas
UNION ALL
SELECT 'Despachadas', COUNT(*) FROM sum_solicitudes_despachadas;
```

### 2. Ver Todas las Solicitudes

```sql
-- Ver todas las aprobadas
SELECT id, numero_solicitud, fecha, departamento 
FROM sum_solicitudes_aprobadas 
ORDER BY id DESC;

-- Ver todas las gestionadas
SELECT id, numero_solicitud, fecha, departamento 
FROM sum_solicitudes_gestionadas 
ORDER BY id DESC;

-- Ver todas las despachadas
SELECT id, numero_solicitud, fecha, departamento 
FROM sum_solicitudes_despachadas 
ORDER BY id DESC;
```

### 3. Verificar Políticas RLS Actuales

```sql
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
ORDER BY tablename;
```

### 4. Verificar Roles y sus IDs

```sql
-- Ver todos los roles disponibles y sus IDs
SELECT 
    id,
    nombre,
    descripcion,
    activo
FROM sum_roles
WHERE activo = TRUE
ORDER BY nombre;
```

### 5. Verificar Usuarios con Roles de Suministro

```sql
-- Ver usuarios con roles de suministro (usando rol_id)
SELECT 
    ud.id,
    ud.username,
    ud.email,
    ud.departamento_id,
    r.id as rol_id,
    r.nombre as rol_nombre
FROM sum_usuarios_departamentos ud
JOIN sum_roles r ON ud.rol_id = r.id
WHERE LOWER(r.nombre) IN ('encargado de suministro', 'suministro', 'administrador')
ORDER BY r.nombre, ud.username;
```

### 6. Ver la Definición Completa de las Políticas Actuales

```sql
-- Ver la definición SQL completa de las políticas SELECT
SELECT 
    p.tablename,
    p.policyname,
    p.cmd as command,
    pg_get_expr(p.qual, p.polrelid) as using_clause
FROM pg_policies p
JOIN pg_class c ON c.relname = p.tablename
WHERE p.tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
AND p.cmd = 'SELECT'
ORDER BY p.tablename;
```

### 7. Obtener los IDs de los Roles de Suministro

**IMPORTANTE:** Ejecuta esto primero para obtener los IDs de los roles antes de crear las políticas.

```sql
-- Obtener los IDs de los roles que necesitan acceso total
SELECT 
    id,
    nombre,
    'Usar este ID en las políticas' as nota
FROM sum_roles
WHERE LOWER(nombre) IN ('administrador', 'encargado de suministro', 'suministro')
AND activo = TRUE;
```

**Anota los IDs que obtengas** (por ejemplo: Administrador = 1, Encargado de Suministro = 2, Suministro = 3)

### 8. Actualizar las Políticas SELECT Existentes

**IMPORTANTE:** Primero necesitas eliminar las políticas SELECT existentes y crear nuevas que incluyan los roles de suministro.

```sql
-- PASO 1: Eliminar las políticas SELECT existentes
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin" ON sum_solicitudes_aprobadas;
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas by department or admin" ON sum_solicitudes_gestionadas;
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas by department or admin" ON sum_solicitudes_despachadas;

-- PASO 2: Crear nuevas políticas que permitan acceso a roles de suministro
-- NOTA: Reemplaza los IDs (1, 2, 3) con los IDs reales que obtuviste en el paso anterior

-- Para sum_solicitudes_aprobadas
CREATE POLICY "Users can view solicitudes_aprobadas by department or admin or suministro"
ON sum_solicitudes_aprobadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver todas
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.id IN (1, 2, 3) -- Reemplaza con los IDs reales: Administrador, Encargado de Suministro, Suministro
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_aprobadas
            WHERE sum_solicitudes_aprobadas.id = sum_solicitudes_aprobadas.id
        )
    )
);

-- Para sum_solicitudes_gestionadas
CREATE POLICY "Users can view solicitudes_gestionadas by department or admin or suministro"
ON sum_solicitudes_gestionadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver todas
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.id IN (1, 2, 3) -- Reemplaza con los IDs reales
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_gestionadas
            WHERE sum_solicitudes_gestionadas.id = sum_solicitudes_gestionadas.id
        )
    )
);

-- Para sum_solicitudes_despachadas
CREATE POLICY "Users can view solicitudes_despachadas by department or admin or suministro"
ON sum_solicitudes_despachadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver todas
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND r.id IN (1, 2, 3) -- Reemplaza con los IDs reales
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_despachadas
            WHERE sum_solicitudes_despachadas.id = sum_solicitudes_despachadas.id
        )
    )
);
```

#### Opción Alternativa: Usar Nombres de Roles en Lugar de IDs

Si prefieres usar nombres de roles en lugar de IDs (más fácil de mantener):

```sql
-- Para sum_solicitudes_aprobadas (usando nombres)
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin" ON sum_solicitudes_aprobadas;

CREATE POLICY "Users can view solicitudes_aprobadas by department or admin or suministro"
ON sum_solicitudes_aprobadas
FOR SELECT
TO authenticated
USING (
    -- Usuarios con roles de suministro pueden ver todas
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos ud
        JOIN sum_roles r ON ud.rol_id = r.id
        WHERE ud.user_id = auth.uid()
        AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
        AND r.activo = TRUE
    )
    OR
    -- Usuarios pueden ver solicitudes de su departamento (si la tabla tiene departamento_id)
    -- Si la tabla NO tiene departamento_id, elimina esta parte del OR
    EXISTS (
        SELECT 1 FROM sum_usuarios_departamentos
        WHERE user_id = auth.uid()
        AND departamento_id IN (
            SELECT departamento_id FROM sum_solicitudes_aprobadas
            WHERE sum_solicitudes_aprobadas.id = sum_solicitudes_aprobadas.id
        )
    )
);

-- Repetir para sum_solicitudes_gestionadas y sum_solicitudes_despachadas con el mismo patrón
```

#### Opción B: Política más permisiva (permitir lectura a todos los usuarios autenticados)

**⚠️ ADVERTENCIA:** Esta opción permite que TODOS los usuarios autenticados vean TODAS las solicitudes. Úsala solo para pruebas o si realmente quieres que todos tengan acceso.

```sql
-- Para sum_solicitudes_aprobadas
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas by department or admin" ON sum_solicitudes_aprobadas;
CREATE POLICY "todos_lectura_aprobadas"
ON sum_solicitudes_aprobadas FOR SELECT
TO authenticated
USING (true);

-- Para sum_solicitudes_gestionadas
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas by department or admin" ON sum_solicitudes_gestionadas;
CREATE POLICY "todos_lectura_gestionadas"
ON sum_solicitudes_gestionadas FOR SELECT
TO authenticated
USING (true);

-- Para sum_solicitudes_despachadas
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas by department or admin" ON sum_solicitudes_despachadas;
CREATE POLICY "todos_lectura_despachadas"
ON sum_solicitudes_despachadas FOR SELECT
TO authenticated
USING (true);
```

### 9. Verificar Estructura de las Tablas

```sql
-- Ver qué campos tienen las tablas (importante para saber si tienen departamento_id)
SELECT 
    table_name,
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
```

**NOTA IMPORTANTE:** Si las tablas NO tienen el campo `departamento_id`, las políticas deben ajustarse para usar solo el campo `departamento` (VARCHAR) o eliminar la parte del filtro por departamento.

### 10. Verificar Después de Crear las Políticas

```sql
-- Ver todas las políticas activas
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    pg_get_expr(qual, polrelid) as using_clause
FROM pg_policies 
WHERE tablename IN (
    'sum_solicitudes_aprobadas',
    'sum_solicitudes_gestionadas',
    'sum_solicitudes_despachadas'
)
ORDER BY tablename, cmd, policyname;
```

### 11. Probar las Políticas con un Usuario de Suministro

```sql
-- Verificar qué solicitudes puede ver un usuario específico
-- Reemplaza 'USER_ID_AQUI' con el UUID del usuario que quieres probar
SELECT 
    'Aprobadas' as tipo,
    COUNT(*) as total_visible
FROM sum_solicitudes_aprobadas
WHERE EXISTS (
    SELECT 1 FROM sum_usuarios_departamentos ud
    JOIN sum_roles r ON ud.rol_id = r.id
    WHERE ud.user_id = 'USER_ID_AQUI'::uuid
    AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    AND r.activo = TRUE
)
UNION ALL
SELECT 'Gestionadas', COUNT(*) FROM sum_solicitudes_gestionadas
WHERE EXISTS (
    SELECT 1 FROM sum_usuarios_departamentos ud
    JOIN sum_roles r ON ud.rol_id = r.id
    WHERE ud.user_id = 'USER_ID_AQUI'::uuid
    AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    AND r.activo = TRUE
)
UNION ALL
SELECT 'Despachadas', COUNT(*) FROM sum_solicitudes_despachadas
WHERE EXISTS (
    SELECT 1 FROM sum_usuarios_departamentos ud
    JOIN sum_roles r ON ud.rol_id = r.id
    WHERE ud.user_id = 'USER_ID_AQUI'::uuid
    AND LOWER(r.nombre) IN ('administrador', 'encargado de suministro', 'suministro')
    AND r.activo = TRUE
);
```

## Solución Rápida (Solo para Pruebas)

Si necesitas verificar rápidamente si el problema es RLS, puedes deshabilitarlo temporalmente:

```sql
-- DESHABILITAR RLS (solo para pruebas)
ALTER TABLE sum_solicitudes_aprobadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_gestionadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_despachadas DISABLE ROW LEVEL SECURITY;
```

**Luego prueba en la aplicación si ahora se muestran todas las solicitudes.**

Si funciona, el problema es RLS. Vuelve a habilitar RLS y crea las políticas correctas:

```sql
-- VOLVER A HABILITAR RLS
ALTER TABLE sum_solicitudes_aprobadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_gestionadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_despachadas ENABLE ROW LEVEL SECURITY;
```

## Notas Importantes

1. **Las políticas RLS se evalúan en el servidor**, por lo que si hay políticas restrictivas, el código del frontend no puede evitarlas.

2. **Verifica que los roles estén escritos exactamente** como aparecen en la base de datos (puede haber diferencias de mayúsculas/minúsculas).

3. **Si las tablas no tienen `departamento_id`**, las políticas deben usar solo el campo `departamento` (VARCHAR).

4. **Después de crear/modificar políticas**, espera unos segundos para que se apliquen los cambios.

