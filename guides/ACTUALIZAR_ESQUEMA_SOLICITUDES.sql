-- =====================================================
-- ACTUALIZAR ESQUEMA PARA SOPORTAR NUEVO FORMATO DE NÚMERO DE SOLICITUD
-- =====================================================
-- Este script actualiza las tablas para que acepten el nuevo formato
-- SD{departamento_id}-{año}-{número} en lugar de solo números enteros

-- 1. Actualizar tabla sum_autorizar_solicitudes
ALTER TABLE sum_autorizar_solicitudes 
  ALTER COLUMN numero_solicitud TYPE VARCHAR(50);

-- 2. Actualizar tabla sum_solicitudes_aprobadas
ALTER TABLE sum_solicitudes_aprobadas 
  ALTER COLUMN numero_solicitud TYPE VARCHAR(50);

-- 3. Actualizar tabla sum_solicitudes_gestionadas
ALTER TABLE sum_solicitudes_gestionadas 
  ALTER COLUMN numero_solicitud TYPE VARCHAR(50);

-- 4. Actualizar tabla sum_solicitudes_despachadas
ALTER TABLE sum_solicitudes_despachadas 
  ALTER COLUMN numero_solicitud TYPE VARCHAR(50);

-- Nota: La tabla sum_solicitudes ya tiene VARCHAR(50), no necesita cambios

