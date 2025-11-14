# 👥 Instrucciones para Crear Usuarios en Supabase

## ⚠️ IMPORTANTE

Los usuarios **DEBEN** crearse primero en **Supabase Auth** antes de agregarlos a la tabla `sum_usuarios_departamentos`.

## 📋 Pasos para Crear Usuarios

### Paso 1: Crear Usuario en Supabase Auth

1. Ve a **Supabase Dashboard** → **Authentication** → **Users**
2. Haz clic en **"Add User"** → **"Create New User"**
3. Completa los datos:
   - **Email**: El email del usuario
   - **Password**: Genera una contraseña segura (guárdala)
   - **Auto Confirm User**: ✅ (marcar esta opción)
4. Haz clic en **"Create User"**
5. **IMPORTANTE:** Copia el **UUID** del usuario creado (lo encontrarás en la lista de usuarios)

### Paso 2: Insertar en sum_usuarios_departamentos

Después de crear cada usuario en Auth, ejecuta este SQL en **SQL Editor**:

```sql
INSERT INTO sum_usuarios_departamentos (user_id, username, email, rol, departamento_id) VALUES
('f4f8340b-b9f7-4674-8466-52b5819c57dd', 'App', 'ing.aperezp@gmail.com', 'Administrator', 81),
('9c1572ad-1e73-4523-8007-17fa8d7ad6c6', 'TIC', 'tic@indrhi.gob.do', 'Administrator', 81),
('77ad0f05-d01b-4008-a8d0-70e5d216e4da', 'emedina', 'emedina@indrhi.gob.do', 'Administrator', 198);
```

**Reemplaza `UUID-DEL-USUARIO-X` con los UUIDs reales que copiaste.**

## 📝 Usuarios Creados

1. **App** (ing.aperezp@gmail.com)
   - UUID: `f4f8340b-b9f7-4674-8466-52b5819c57dd`
   - Rol: `Administrator`
   - Departamento ID: `81` (DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES)
   - Estado: ✅ Creado y sincronizado

2. **TIC** (tic@indrhi.gob.do)
   - UUID: `9c1572ad-1e73-4523-8007-17fa8d7ad6c6`
   - Rol: `Administrator`
   - Departamento ID: `81` (DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES)
   - Estado: ✅ Creado y sincronizado

3. **emedina** (emedina@indrhi.gob.do)
   - UUID: `77ad0f05-d01b-4008-a8d0-70e5d216e4da`
   - Rol: `Administrator`
   - Departamento ID: `198` (SECCION DE ALMACEN Y SUMINISTRO)
   - Estado: ✅ Creado y sincronizado

## 🔍 Cómo Obtener el UUID de un Usuario

1. Ve a **Authentication** → **Users**
2. Busca el usuario en la lista
3. Haz clic en el usuario para ver sus detalles
4. El **UUID** está en el campo **"User UID"** o **"ID"**
5. Copia ese UUID completo (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## ✅ Verificación

Después de crear los usuarios y sincronizarlos:

1. Verifica que los usuarios aparezcan en `sum_usuarios_departamentos`
2. Intenta hacer login en la aplicación con el email y contraseña creados
3. Verifica que el usuario tenga acceso correcto según su rol

## 🔐 Notas sobre Contraseñas

- Las contraseñas de WordPress **NO** se pueden migrar
- Cada usuario necesita una **nueva contraseña** en Supabase
- Puedes usar "Forgot Password" en la aplicación si lo configuras
- O proporciona las contraseñas directamente a los usuarios

## 📞 Si Tienes Problemas

- Verifica que el UUID sea correcto (debe ser un UUID válido)
- Verifica que el `departamento_id` exista en `sum_departamentos`
- Revisa los logs en Supabase Dashboard para errores

