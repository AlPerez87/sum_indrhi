-- =====================================================
-- AGREGAR CAMPO ENVIADA A TABLA sum_solicitudes
-- =====================================================
-- Este script agrega el campo 'enviada' para marcar solicitudes enviadas
-- y mejorar el rendimiento al verificar el estado

-- Agregar columna enviada si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sum_solicitudes' 
        AND column_name = 'enviada'
    ) THEN
        ALTER TABLE sum_solicitudes 
        ADD COLUMN enviada INTEGER DEFAULT 0;
        
        -- Crear índice para mejorar búsquedas
        CREATE INDEX IF NOT EXISTS idx_solicitudes_enviada 
        ON sum_solicitudes(enviada);
        
        -- Marcar como enviadas las solicitudes que ya están en sum_autorizar_solicitudes
        UPDATE sum_solicitudes s
        SET enviada = 1
        WHERE EXISTS (
            SELECT 1 
            FROM sum_autorizar_solicitudes a 
            WHERE a.numero_solicitud = s.numero_solicitud
        );
    END IF;
END $$;

