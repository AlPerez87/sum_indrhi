-- =====================================================
-- Script de Migración a Supabase PostgreSQL
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script crea todas las tablas necesarias en Supabase
-- basado en la estructura MySQL original
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: sum_articulos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_articulos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  existencia INTEGER DEFAULT 0,
  cantidad_minima INTEGER DEFAULT 0,
  valor DECIMAL(10, 2) DEFAULT 0,
  unidad VARCHAR(50) NOT NULL DEFAULT 'UNIDAD',
  CHECK (unidad IN ('UNIDAD', 'RESMA', 'BLOCKS O TALONARIO', 'PAQUETE', 'GALON', 'YARDA', 'LIBRA', 'CAJA'))
);

-- Índices para sum_articulos
CREATE INDEX IF NOT EXISTS idx_articulos_codigo ON sum_articulos(codigo);
CREATE INDEX IF NOT EXISTS idx_articulos_descripcion ON sum_articulos(descripcion);
CREATE INDEX IF NOT EXISTS idx_articulos_unidad ON sum_articulos(unidad);
CREATE INDEX IF NOT EXISTS idx_articulos_existencia ON sum_articulos(existencia);

-- =====================================================
-- TABLA: sum_departamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_departamentos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  departamento VARCHAR(255) NOT NULL
);

-- Índices para sum_departamentos
CREATE INDEX IF NOT EXISTS idx_departamentos_codigo ON sum_departamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_departamentos_nombre ON sum_departamentos(departamento);

-- =====================================================
-- TABLA: sum_usuarios_departamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_usuarios_departamentos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  rol VARCHAR(50) NOT NULL,
  departamento_id INTEGER REFERENCES sum_departamentos(id),
  fecha_asignacion TIMESTAMP DEFAULT NOW(),
  actualizado TIMESTAMP DEFAULT NOW()
);

-- Índices para sum_usuarios_departamentos
CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON sum_usuarios_departamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_departamento_id ON sum_usuarios_departamentos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON sum_usuarios_departamentos(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON sum_usuarios_departamentos(email);

-- =====================================================
-- TABLA: sum_entrada_mercancia
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_entrada_mercancia (
  id SERIAL PRIMARY KEY,
  numero_entrada VARCHAR(50) NOT NULL,
  numero_orden VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  suplidor VARCHAR(255) NOT NULL,
  articulos_cantidades_unidades TEXT NOT NULL,
  UNIQUE(numero_entrada, numero_orden)
);

-- Índices para sum_entrada_mercancia
CREATE INDEX IF NOT EXISTS idx_entrada_numero ON sum_entrada_mercancia(numero_entrada);
CREATE INDEX IF NOT EXISTS idx_entrada_fecha ON sum_entrada_mercancia(fecha);
CREATE INDEX IF NOT EXISTS idx_entrada_suplidor ON sum_entrada_mercancia(suplidor);

-- =====================================================
-- TABLA: sum_solicitudes
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes (
  id SERIAL PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES sum_departamentos(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  articulos_cantidades TEXT NOT NULL
);

-- Índices para sum_solicitudes
CREATE INDEX IF NOT EXISTS idx_solicitudes_numero ON sum_solicitudes(numero_solicitud);
CREATE INDEX IF NOT EXISTS idx_solicitudes_departamento_id ON sum_solicitudes(departamento_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario_id ON sum_solicitudes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON sum_solicitudes(fecha);

-- =====================================================
-- TABLA: sum_autorizar_solicitudes
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_autorizar_solicitudes (
  id SERIAL PRIMARY KEY,
  numero_solicitud INTEGER NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL
);

-- Índices para sum_autorizar_solicitudes
CREATE INDEX IF NOT EXISTS idx_autorizar_numero ON sum_autorizar_solicitudes(numero_solicitud);
CREATE INDEX IF NOT EXISTS idx_autorizar_fecha ON sum_autorizar_solicitudes(fecha);

-- =====================================================
-- TABLA: sum_solicitudes_aprobadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_aprobadas (
  id SERIAL PRIMARY KEY,
  numero_solicitud INTEGER NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL
);

-- Índices para sum_solicitudes_aprobadas
CREATE INDEX IF NOT EXISTS idx_aprobadas_numero ON sum_solicitudes_aprobadas(numero_solicitud);
CREATE INDEX IF NOT EXISTS idx_aprobadas_fecha ON sum_solicitudes_aprobadas(fecha);

-- =====================================================
-- TABLA: sum_solicitudes_gestionadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_gestionadas (
  id SERIAL PRIMARY KEY,
  numero_solicitud INTEGER NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL
);

-- Índices para sum_solicitudes_gestionadas
CREATE INDEX IF NOT EXISTS idx_gestionadas_numero ON sum_solicitudes_gestionadas(numero_solicitud);
CREATE INDEX IF NOT EXISTS idx_gestionadas_fecha ON sum_solicitudes_gestionadas(fecha);

-- =====================================================
-- TABLA: sum_solicitudes_despachadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_despachadas (
  id SERIAL PRIMARY KEY,
  numero_solicitud INTEGER NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  despachado_por VARCHAR(255)
);

-- Índices para sum_solicitudes_despachadas
CREATE INDEX IF NOT EXISTS idx_despachadas_numero ON sum_solicitudes_despachadas(numero_solicitud);
CREATE INDEX IF NOT EXISTS idx_despachadas_fecha ON sum_solicitudes_despachadas(fecha);
CREATE INDEX IF NOT EXISTS idx_despachadas_por ON sum_solicitudes_despachadas(despachado_por);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE sum_articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_usuarios_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_entrada_mercancia ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_autorizar_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_aprobadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_gestionadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sum_solicitudes_despachadas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para sum_articulos (todos pueden ver, solo autenticados pueden modificar)
CREATE POLICY "Users can view articulos" ON sum_articulos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert articulos" ON sum_articulos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update articulos" ON sum_articulos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete articulos" ON sum_articulos FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_departamentos
CREATE POLICY "Users can view departamentos" ON sum_departamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert departamentos" ON sum_departamentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update departamentos" ON sum_departamentos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete departamentos" ON sum_departamentos FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_usuarios_departamentos
CREATE POLICY "Users can view usuarios_departamentos" ON sum_usuarios_departamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert usuarios_departamentos" ON sum_usuarios_departamentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own usuario_departamento" ON sum_usuarios_departamentos FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete usuarios_departamentos" ON sum_usuarios_departamentos FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_entrada_mercancia
CREATE POLICY "Users can view entrada_mercancia" ON sum_entrada_mercancia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert entrada_mercancia" ON sum_entrada_mercancia FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update entrada_mercancia" ON sum_entrada_mercancia FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete entrada_mercancia" ON sum_entrada_mercancia FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_solicitudes (usuarios solo ven las suyas, excepto administradores)
CREATE POLICY "Users can view own solicitudes" ON sum_solicitudes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own solicitudes" ON sum_solicitudes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own solicitudes" ON sum_solicitudes FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own solicitudes" ON sum_solicitudes FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para sum_autorizar_solicitudes
CREATE POLICY "Users can view autorizar_solicitudes" ON sum_autorizar_solicitudes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert autorizar_solicitudes" ON sum_autorizar_solicitudes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update autorizar_solicitudes" ON sum_autorizar_solicitudes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete autorizar_solicitudes" ON sum_autorizar_solicitudes FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_solicitudes_aprobadas
CREATE POLICY "Users can view solicitudes_aprobadas" ON sum_solicitudes_aprobadas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert solicitudes_aprobadas" ON sum_solicitudes_aprobadas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update solicitudes_aprobadas" ON sum_solicitudes_aprobadas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete solicitudes_aprobadas" ON sum_solicitudes_aprobadas FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_solicitudes_gestionadas
CREATE POLICY "Users can view solicitudes_gestionadas" ON sum_solicitudes_gestionadas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert solicitudes_gestionadas" ON sum_solicitudes_gestionadas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update solicitudes_gestionadas" ON sum_solicitudes_gestionadas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete solicitudes_gestionadas" ON sum_solicitudes_gestionadas FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sum_solicitudes_despachadas
CREATE POLICY "Users can view solicitudes_despachadas" ON sum_solicitudes_despachadas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert solicitudes_despachadas" ON sum_solicitudes_despachadas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update solicitudes_despachadas" ON sum_solicitudes_despachadas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete solicitudes_despachadas" ON sum_solicitudes_despachadas FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar el campo 'actualizado' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente el campo actualizado
CREATE TRIGGER update_sum_usuarios_departamentos_updated_at 
    BEFORE UPDATE ON sum_usuarios_departamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE sum_articulos IS 'Catálogo de artículos del sistema de suministros';
COMMENT ON TABLE sum_departamentos IS 'Departamentos de la institución';
COMMENT ON TABLE sum_usuarios_departamentos IS 'Relación entre usuarios de autenticación y departamentos';
COMMENT ON TABLE sum_entrada_mercancia IS 'Registro de entradas de mercancía al almacén';
COMMENT ON TABLE sum_solicitudes IS 'Solicitudes de artículos creadas por usuarios';
COMMENT ON TABLE sum_autorizar_solicitudes IS 'Solicitudes pendientes de autorización';
COMMENT ON TABLE sum_solicitudes_aprobadas IS 'Solicitudes aprobadas por directores';
COMMENT ON TABLE sum_solicitudes_gestionadas IS 'Solicitudes en proceso de gestión';
COMMENT ON TABLE sum_solicitudes_despachadas IS 'Solicitudes despachadas y entregadas';

