-- =====================================================
-- Script para Verificar Usuarios en Supabase Auth
-- =====================================================
-- Ejecuta este script en SQL Editor de Supabase para ver
-- todos los usuarios creados en auth.users

SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- Si no ves usuarios, necesitas crearlos primero en:
-- Supabase Dashboard → Authentication → Users → Add User
-- =====================================================

