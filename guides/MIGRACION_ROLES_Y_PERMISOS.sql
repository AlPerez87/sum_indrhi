-- =====================================================
-- MIGRACIÓN: Roles, Nombre Completo y Corrección de Permisos
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script:
-- 1. Crea la tabla sum_roles
-- 2. Agrega campo nombre_completo a sum_usuarios_departamentos
-- 3. Convierte el campo rol a foreign key hacia sum_roles
-- 4. Convierte despachado_por a foreign key hacia sum_usuarios_departamentos
-- 5. Corrige las políticas RLS para permisos correctos
-- =====================================================

-- =====================================================
-- PASO 1: Crear tabla sum_roles
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices para sum_roles
CREATE INDEX IF NOT EXISTS idx_roles_nombre ON sum_roles(nombre);
CREATE INDEX IF NOT EXISTS idx_roles_activo ON sum_roles(activo);

-- Insertar roles básicos si no existen
INSERT INTO sum_roles (nombre, descripcion) 
VALUES 
  ('Administrador', 'Usuario con acceso completo al sistema'),
  ('Director', 'Director de departamento con permisos de aprobación'),
  ('Usuario', 'Usuario regular del departamento'),
  ('Almacenista', 'Usuario encargado del almacén')
ON CONFLICT (nombre) DO NOTHING;

-- Habilitar RLS en sum_roles
ALTER TABLE sum_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para sum_roles
CREATE POLICY "Users can view roles" ON sum_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert roles" ON sum_roles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update roles" ON sum_roles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete roles" ON sum_roles FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- PASO 2: Agregar campo nombre_completo a sum_usuarios_departamentos
-- =====================================================
ALTER TABLE sum_usuarios_departamentos 
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255);

-- Crear índice para nombre_completo
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_completo ON sum_usuarios_departamentos(nombre_completo);

-- =====================================================
-- PASO 3: Migrar campo rol de VARCHAR a INTEGER (foreign key)
-- =====================================================

-- Primero, crear una columna temporal para el nuevo rol_id
ALTER TABLE sum_usuarios_departamentos 
ADD COLUMN IF NOT EXISTS rol_id INTEGER REFERENCES sum_roles(id);

-- Migrar datos existentes: mapear valores de rol a IDs de roles
-- Esto asume que los valores existentes coinciden con los nombres de roles
UPDATE sum_usuarios_departamentos 
SET rol_id = (
  SELECT id FROM sum_roles 
  WHERE LOWER(sum_roles.nombre) = LOWER(sum_usuarios_departamentos.rol)
  LIMIT 1
)
WHERE rol_id IS NULL;

-- Si hay roles que no coinciden, asignar 'Usuario' por defecto
UPDATE sum_usuarios_departamentos 
SET rol_id = (SELECT id FROM sum_roles WHERE nombre = 'Usuario' LIMIT 1)
WHERE rol_id IS NULL;

-- Eliminar la columna antigua 'rol' (comentado por seguridad, descomentar después de verificar)
-- ALTER TABLE sum_usuarios_departamentos DROP COLUMN IF EXISTS rol;

-- Renombrar rol_id a rol (opcional, o mantener rol_id)
-- ALTER TABLE sum_usuarios_departamentos RENAME COLUMN rol_id TO rol;

-- Crear índice para rol_id
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON sum_usuarios_departamentos(rol_id);

-- =====================================================
-- PASO 4: Migrar campo despachado_por de VARCHAR a INTEGER (foreign key)
-- =====================================================

-- Primero, crear una columna temporal para el nuevo despachado_por_id
ALTER TABLE sum_solicitudes_despachadas 
ADD COLUMN IF NOT EXISTS despachado_por_id INTEGER REFERENCES sum_usuarios_departamentos(id);

-- Migrar datos existentes: intentar encontrar usuarios por nombre_completo o username
-- Nota: Esto requiere que los nombres en despachado_por coincidan con nombre_completo o username
UPDATE sum_solicitudes_despachadas 
SET despachado_por_id = (
  SELECT id FROM sum_usuarios_departamentos 
  WHERE nombre_completo = sum_solicitudes_despachadas.despachado_por
     OR username = sum_solicitudes_despachadas.despachado_por
  LIMIT 1
)
WHERE despachado_por IS NOT NULL AND despachado_por != '' AND despachado_por_id IS NULL;

-- Crear índice para despachado_por_id
CREATE INDEX IF NOT EXISTS idx_despachadas_por_id ON sum_solicitudes_despachadas(despachado_por_id);

-- Mantener el campo despachado_por como VARCHAR por compatibilidad (se puede eliminar después)
-- O eliminar si se prefiere usar solo la foreign key:
-- ALTER TABLE sum_solicitudes_despachadas DROP COLUMN IF EXISTS despachado_por;

-- =====================================================
-- PASO 5: Crear función helper para verificar si usuario es administrador
-- =====================================================
CREATE OR REPLACE FUNCTION es_administrador(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Si no hay UUID, retornar false
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM sum_usuarios_departamentos ud
    INNER JOIN sum_roles r ON ud.rol_id = r.id
    WHERE ud.user_id = user_uuid 
      AND LOWER(r.nombre) = 'administrador'
      AND r.activo = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el departamento_id del usuario actual
CREATE OR REPLACE FUNCTION obtener_departamento_usuario(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  -- Si no hay UUID, retornar NULL
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT departamento_id 
    FROM sum_usuarios_departamentos 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 6: Eliminar políticas RLS antiguas de sum_solicitudes
-- =====================================================
DROP POLICY IF EXISTS "Users can view own solicitudes" ON sum_solicitudes;
DROP POLICY IF EXISTS "Users can insert own solicitudes" ON sum_solicitudes;
DROP POLICY IF EXISTS "Users can update own solicitudes" ON sum_solicitudes;
DROP POLICY IF EXISTS "Users can delete own solicitudes" ON sum_solicitudes;

-- =====================================================
-- PASO 7: Crear nuevas políticas RLS para sum_solicitudes
-- =====================================================

-- SELECT: Los usuarios pueden ver:
-- 1. Sus propias solicitudes
-- 2. Solicitudes de su departamento (si tienen departamento_id)
-- 3. Todas las solicitudes si son administradores
CREATE POLICY "Users can view solicitudes by department or admin" 
ON sum_solicitudes FOR SELECT 
USING (
  -- El usuario puede ver sus propias solicitudes
  (auth.uid() IS NOT NULL AND auth.uid() = usuario_id)
  OR
  -- O puede ver solicitudes de su departamento
  (
    auth.uid() IS NOT NULL
    AND obtener_departamento_usuario(auth.uid()) IS NOT NULL
    AND departamento_id = obtener_departamento_usuario(auth.uid())
  )
  OR
  -- O es administrador y puede ver todas
  (auth.uid() IS NOT NULL AND es_administrador(auth.uid()))
);

-- INSERT: Los usuarios solo pueden insertar sus propias solicitudes
CREATE POLICY "Users can insert own solicitudes" 
ON sum_solicitudes FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

-- UPDATE: Los usuarios pueden actualizar sus propias solicitudes o administradores pueden actualizar cualquiera
CREATE POLICY "Users can update own solicitudes or admin can update any" 
ON sum_solicitudes FOR UPDATE 
USING (
  auth.uid() = usuario_id 
  OR es_administrador(auth.uid())
);

-- DELETE: Los usuarios pueden eliminar sus propias solicitudes o administradores pueden eliminar cualquiera
CREATE POLICY "Users can delete own solicitudes or admin can delete any" 
ON sum_solicitudes FOR DELETE 
USING (
  auth.uid() = usuario_id 
  OR es_administrador(auth.uid())
);

-- =====================================================
-- PASO 8: Actualizar políticas RLS para otras tablas de solicitudes
-- =====================================================

-- Políticas para sum_solicitudes_aprobadas
DROP POLICY IF EXISTS "Users can view solicitudes_aprobadas" ON sum_solicitudes_aprobadas;
CREATE POLICY "Users can view solicitudes_aprobadas by department or admin" 
ON sum_solicitudes_aprobadas FOR SELECT 
USING (
  auth.role() = 'authenticated'
  AND (
    -- Usuarios pueden ver solicitudes aprobadas de su departamento
    (
      auth.uid() IS NOT NULL
      AND obtener_departamento_usuario(auth.uid()) IS NOT NULL
      AND departamento = (
        SELECT departamento 
        FROM sum_departamentos 
        WHERE id = obtener_departamento_usuario(auth.uid())
        LIMIT 1
      )
    )
    OR
    -- O es administrador y puede ver todas
    (auth.uid() IS NOT NULL AND es_administrador(auth.uid()))
  )
);

-- Políticas para sum_solicitudes_gestionadas
DROP POLICY IF EXISTS "Users can view solicitudes_gestionadas" ON sum_solicitudes_gestionadas;
CREATE POLICY "Users can view solicitudes_gestionadas by department or admin" 
ON sum_solicitudes_gestionadas FOR SELECT 
USING (
  -- Usuarios pueden ver solicitudes gestionadas de su departamento
  (
    obtener_departamento_usuario(auth.uid()) IS NOT NULL
    AND departamento = (
      SELECT departamento 
      FROM sum_departamentos 
      WHERE id = obtener_departamento_usuario(auth.uid())
      LIMIT 1
    )
  )
  OR
  -- O es administrador y puede ver todas
  es_administrador(auth.uid())
);

-- Políticas para sum_solicitudes_despachadas
DROP POLICY IF EXISTS "Users can view solicitudes_despachadas" ON sum_solicitudes_despachadas;
CREATE POLICY "Users can view solicitudes_despachadas by department or admin" 
ON sum_solicitudes_despachadas FOR SELECT 
USING (
  -- Usuarios pueden ver solicitudes despachadas de su departamento
  (
    obtener_departamento_usuario(auth.uid()) IS NOT NULL
    AND departamento = (
      SELECT departamento 
      FROM sum_departamentos 
      WHERE id = obtener_departamento_usuario(auth.uid())
      LIMIT 1
    )
  )
  OR
  -- O es administrador y puede ver todas
  es_administrador(auth.uid())
);

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE sum_roles IS 'Catálogo de roles del sistema';
COMMENT ON COLUMN sum_usuarios_departamentos.nombre_completo IS 'Nombre completo del usuario';
COMMENT ON COLUMN sum_usuarios_departamentos.rol_id IS 'ID del rol del usuario (foreign key a sum_roles)';
COMMENT ON COLUMN sum_solicitudes_despachadas.despachado_por_id IS 'ID del usuario que despachó la solicitud (foreign key a sum_usuarios_departamentos)';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Después de ejecutar este script, actualizar el código del frontend para:
--    - Usar rol_id en lugar de rol (o mantener ambos por compatibilidad)
--    - Usar despachado_por_id en lugar de despachado_por
--    - Usar nombre_completo cuando se muestre información del usuario
--
-- 2. Si se desea eliminar las columnas antiguas (rol VARCHAR y despachado_por VARCHAR),
--    descomentar las líneas correspondientes después de verificar que todo funciona correctamente.
--
-- 3. Las funciones es_administrador() y obtener_departamento_usuario() usan SECURITY DEFINER
--    para poder acceder a las tablas incluso con RLS habilitado.

