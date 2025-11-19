-- =====================================================
-- Script de Migración a MySQL
-- Sistema de Suministros INDRHI
-- =====================================================
-- Este script crea todas las tablas necesarias en MySQL
-- basado en la estructura PostgreSQL/Supabase actual
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sum_indrhi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sum_indrhi;

-- =====================================================
-- TABLA: sum_articulos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_articulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  existencia INT DEFAULT 0,
  cantidad_minima INT DEFAULT 0,
  valor DECIMAL(10, 2) DEFAULT 0,
  unidad VARCHAR(50) NOT NULL DEFAULT 'UNIDAD',
  CONSTRAINT chk_unidad CHECK (unidad IN ('UNIDAD', 'RESMA', 'BLOCKS O TALONARIO', 'PAQUETE', 'GALON', 'YARDA', 'LIBRA', 'CAJA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para sum_articulos
CREATE INDEX idx_articulos_codigo ON sum_articulos(codigo);
CREATE INDEX idx_articulos_descripcion ON sum_articulos(descripcion(255));
CREATE INDEX idx_articulos_unidad ON sum_articulos(unidad);
CREATE INDEX idx_articulos_existencia ON sum_articulos(existencia);

-- =====================================================
-- TABLA: sum_departamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_departamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  departamento VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para sum_departamentos
CREATE INDEX idx_departamentos_codigo ON sum_departamentos(codigo);
CREATE INDEX idx_departamentos_nombre ON sum_departamentos(departamento);

-- =====================================================
-- TABLA: sum_roles
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: usuarios (reemplaza auth.users de Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verificado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_usuarios_departamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_usuarios_departamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  departamento_id INT,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  nombre_completo VARCHAR(255),
  rol_id INT,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (departamento_id) REFERENCES sum_departamentos(id) ON DELETE SET NULL,
  FOREIGN KEY (rol_id) REFERENCES sum_roles(id) ON DELETE SET NULL,
  INDEX idx_usuarios_user_id (user_id),
  INDEX idx_usuarios_departamento_id (departamento_id),
  INDEX idx_usuarios_username (username),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_entrada_mercancia
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_entrada_mercancia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_entrada VARCHAR(50) NOT NULL,
  numero_orden VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  suplidor VARCHAR(255) NOT NULL,
  articulos_cantidades_unidades TEXT NOT NULL,
  UNIQUE KEY uk_entrada_orden (numero_entrada, numero_orden),
  INDEX idx_entrada_numero (numero_entrada),
  INDEX idx_entrada_fecha (fecha),
  INDEX idx_entrada_suplidor (suplidor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_solicitudes
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  departamento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  enviada INT DEFAULT 0,
  FOREIGN KEY (departamento_id) REFERENCES sum_departamentos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_solicitudes_numero (numero_solicitud),
  INDEX idx_solicitudes_departamento_id (departamento_id),
  INDEX idx_solicitudes_usuario_id (usuario_id),
  INDEX idx_solicitudes_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_autorizar_solicitudes
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_autorizar_solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  INDEX idx_autorizar_numero (numero_solicitud),
  INDEX idx_autorizar_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_solicitudes_aprobadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_aprobadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  INDEX idx_aprobadas_numero (numero_solicitud),
  INDEX idx_aprobadas_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_solicitudes_gestionadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_gestionadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  INDEX idx_gestionadas_numero (numero_solicitud),
  INDEX idx_gestionadas_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sum_solicitudes_despachadas
-- =====================================================
CREATE TABLE IF NOT EXISTS sum_solicitudes_despachadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  articulos_cantidades TEXT NOT NULL,
  despachado_por VARCHAR(255),
  despachado_por_id INT,
  FOREIGN KEY (despachado_por_id) REFERENCES sum_usuarios_departamentos(id) ON DELETE SET NULL,
  INDEX idx_despachadas_numero (numero_solicitud),
  INDEX idx_despachadas_fecha (fecha),
  INDEX idx_despachadas_por (despachado_por_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
ALTER TABLE sum_articulos COMMENT = 'Catálogo de artículos del sistema de suministros';
ALTER TABLE sum_departamentos COMMENT = 'Departamentos de la institución';
ALTER TABLE sum_usuarios_departamentos COMMENT = 'Relación entre usuarios de autenticación y departamentos';
ALTER TABLE sum_entrada_mercancia COMMENT = 'Registro de entradas de mercancía al almacén';
ALTER TABLE sum_solicitudes COMMENT = 'Solicitudes de artículos creadas por usuarios';
ALTER TABLE sum_autorizar_solicitudes COMMENT = 'Solicitudes pendientes de autorización';
ALTER TABLE sum_solicitudes_aprobadas COMMENT = 'Solicitudes aprobadas por directores';
ALTER TABLE sum_solicitudes_gestionadas COMMENT = 'Solicitudes en proceso de gestión';
ALTER TABLE sum_solicitudes_despachadas COMMENT = 'Solicitudes despachadas y entregadas';
ALTER TABLE usuarios COMMENT = 'Usuarios del sistema (reemplaza auth.users de Supabase)';
ALTER TABLE sum_roles COMMENT = 'Catálogo de roles del sistema';

