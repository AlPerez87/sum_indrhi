# 🔧 Solución: Error de Foreign Key en sum_usuarios_departamentos

## ❌ Error Encontrado

```
ERROR: 23503: insert or update on table "sum_usuarios_departamentos" 
violates foreign key constraint "sum_usuarios_departamentos_user_id_fkey" 
DETAIL: Key (user_id)=(360aad03-5995-4030-a795-1ad54ebd935f) is not present in table "users".
```

## 🔍 Causa del Problema

El UUID que estás intentando insertar **no existe** en la tabla `auth.users` de Supabase. Esto puede ocurrir porque:

1. El usuario no fue creado en Supabase Auth
2. El UUID copiado es incorrecto
3. El usuario fue eliminado

## ✅ Solución Paso a Paso

### Paso 1: Verificar Usuarios Existentes

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta este query para ver todos los usuarios:

```sql
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

3. **Copia los UUIDs** que aparezcan en la columna `user_id`

### Paso 2: Crear Usuarios Faltantes

Si no ves los usuarios que necesitas, créalos:

1. Ve a **Authentication** → **Users**
2. Haz clic en **"Add User"** → **"Create New User"**
3. Para cada usuario, completa:
   - **Email**: El email del usuario
   - **Password**: Genera una contraseña segura
   - **Auto Confirm User**: ✅ (marcar)
4. Haz clic en **"Create User"**
5. **Copia el UUID** del usuario creado

### Paso 3: Obtener UUIDs Correctos

**Método 1: Desde la Interfaz Web**
1. Ve a **Authentication** → **Users**
2. Haz clic en cada usuario
3. El UUID está en el campo **"User UID"** o **"ID"**
4. Copia el UUID completo

**Método 2: Desde SQL Editor**
```sql
SELECT id, email FROM auth.users WHERE email IN (
  'ing.aperezp@gmail.com',
  'tic@indrhi.gob.do',
  'emedina@indrhi.gob.do',
  'administrativo@indrhi.gob.do'
);
```

### Paso 4: Actualizar el INSERT

Una vez que tengas los UUIDs correctos, ejecuta este INSERT en **SQL Editor**:

```sql
-- Reemplaza los UUIDs con los reales de tus usuarios
INSERT INTO sum_usuarios_departamentos (user_id, username, email, rol, departamento_id) VALUES
('UUID-REAL-DE-APP', 'App', 'ing.aperezp@gmail.com', 'Administrator', 81),
('UUID-REAL-DE-TIC', 'TIC', 'tic@indrhi.gob.do', 'Administrator', 81),
('UUID-REAL-DE-EMEDINA', 'emedina', 'emedina@indrhi.gob.do', 'Administrator', 198),
('UUID-REAL-DE-ADMINISTRATIVO', 'administrativo', 'administrativo@indrhi.gob.do', 'Departamento_administrativo', 43);
```

## 🔍 Verificación

Después de insertar, verifica que todo esté correcto:

```sql
SELECT 
  ud.id,
  ud.username,
  ud.email,
  ud.rol,
  d.departamento,
  au.id as auth_user_id,
  au.email as auth_email
FROM sum_usuarios_departamentos ud
LEFT JOIN sum_departamentos d ON ud.departamento_id = d.id
LEFT JOIN auth.users au ON ud.user_id = au.id;
```

Si ves `NULL` en `auth_user_id` o `auth_email`, significa que el UUID no coincide.

## ⚠️ Importante

- Los UUIDs deben ser **exactamente** los mismos que aparecen en `auth.users`
- Un UUID tiene el formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Asegúrate de copiar el UUID completo sin espacios

## 📝 Ejemplo de UUID Correcto

Un UUID válido se ve así:
```
360aad03-5995-4030-a795-1ad54ebd935f
```

**NO** debe tener:
- Espacios al inicio o final
- Caracteres adicionales
- Formato diferente

## 🆘 Si Aún Tienes Problemas

1. Verifica que los usuarios existan ejecutando el query de verificación
2. Si no existen, créalos en Supabase Auth primero
3. Copia los UUIDs directamente desde la interfaz de Supabase
4. Usa esos UUIDs en el INSERT

