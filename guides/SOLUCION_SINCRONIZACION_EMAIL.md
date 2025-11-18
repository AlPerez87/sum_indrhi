# Solución: Problema de Sincronización de Email entre Tabla y Supabase Auth

## Problema Identificado

Cuando se cambia el email de un usuario manualmente desde Supabase Dashboard, puede ocurrir que:
- El email se actualice en la tabla `sum_usuarios_departamentos` pero NO en `auth.users` (Supabase Auth)
- O viceversa, el email se actualice en `auth.users` pero NO en `sum_usuarios_departamentos`

Esto causa que:
- El usuario no pueda iniciar sesión con el nuevo email
- No se pueda asignar una contraseña al usuario
- Aparezca como si el usuario no existiera

## Solución Aplicada

### 1. Corrección Inmediata

El email del usuario `emencia@indrhi.gob.do` ha sido sincronizado manualmente ejecutando:

```sql
UPDATE auth.users 
SET email = 'emencia@indrhi.gob.do', 
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{email}', '"emencia@indrhi.gob.do"') 
WHERE id = '77ad0f05-d01b-4008-a8d0-70e5d216e4da';
```

### 2. Prevención Futura

Se ha agregado una función `sincronizarEmailUsuario` en `crmService.js` que:
- Verifica si el email en la tabla coincide con el de Supabase Auth
- Sincroniza automáticamente el email antes de actualizar contraseñas
- Proporciona mensajes claros si no hay permisos de administrador

### 3. Mejoras en el Login

Se mejoró el manejo de errores en `authService.js` para:
- Detectar problemas de sincronización de email
- Proporcionar mensajes de error más claros al usuario
- Guiar al administrador sobre cómo resolver el problema

## Cómo Sincronizar Manualmente (si es necesario)

### Opción 1: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users** en Supabase Dashboard
2. Busca el usuario por su ID o email antiguo
3. Haz clic en el usuario
4. Actualiza el campo **Email** con el nuevo email
5. Guarda los cambios

### Opción 2: Desde SQL Editor

Si necesitas sincronizar desde la tabla hacia Auth:

```sql
-- Reemplaza 'nuevo_email@indrhi.gob.do' y 'user_id_aqui' con los valores correctos
UPDATE auth.users 
SET email = 'nuevo_email@indrhi.gob.do',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb), 
        '{email}', 
        '"nuevo_email@indrhi.gob.do"'
    )
WHERE id = 'user_id_aqui';
```

Si necesitas sincronizar desde Auth hacia la tabla:

```sql
-- Reemplaza 'nuevo_email@indrhi.gob.do' y 'user_id_aqui' con los valores correctos
UPDATE sum_usuarios_departamentos
SET email = 'nuevo_email@indrhi.gob.do'
WHERE user_id = 'user_id_aqui';
```

## Verificación

Para verificar que el email está sincronizado correctamente:

```sql
-- Verificar email en ambas tablas
SELECT 
    ud.id,
    ud.email as email_tabla,
    ud.user_id,
    au.email as email_auth
FROM sum_usuarios_departamentos ud
LEFT JOIN auth.users au ON ud.user_id = au.id
WHERE ud.email LIKE '%emencia%' OR ud.email LIKE '%emedina%';
```

Ambos emails deben coincidir.

## Prevención

### Al Cambiar un Email Manualmente:

1. **SIEMPRE** actualiza el email en ambos lugares:
   - `sum_usuarios_departamentos` (tabla de usuarios)
   - `auth.users` (Supabase Auth)

2. O usa la función `sincronizarEmailUsuario` antes de operaciones críticas

3. Verifica la sincronización después de cualquier cambio manual

## Notas Técnicas

- La función `sincronizarEmailUsuario` requiere permisos de administrador (service role key)
- Si no tienes estos permisos, deberás sincronizar manualmente desde Supabase Dashboard
- El código ahora intenta sincronizar automáticamente antes de actualizar contraseñas
- Los mensajes de error ahora son más descriptivos para ayudar a identificar problemas de sincronización

## Actualización: Edge Function para Contraseñas

**Nota importante**: La actualización de contraseñas ahora se realiza a través de una Edge Function de Supabase (`update-user-password`) para mayor seguridad. Ver `CONFIGURAR_EDGE_FUNCTION_PASSWORD.md` para más detalles.

