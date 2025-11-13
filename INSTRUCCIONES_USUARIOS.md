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
('360aad03-5995-4030-a795-1ad54ebd935f', 'App', 'ing.aperezp@gmail.com', 'Administrator', 81),
('9ce5979b-caf9-415f-b581-fda7a888aad3', 'TIC', 'tic@indrhi.gob.do', 'Administrator', 81),
('90de6ebe-ccb2-4191-8c11-d9242b1bdc34', 'emedina', 'emedina@indrhi.gob.do', 'Administrator', 198),
('357af1ab-42cd-4055-adfc-ebccf36eca17', 'administrativo', 'administrativo@indrhi.gob.do', 'Departamento_administrativo', 43);
```

**Reemplaza `UUID-DEL-USUARIO-X` con los UUIDs reales que copiaste.**

## 📝 Usuarios a Crear

1. **App** (ing.aperezp@gmail.com)
   - Rol: `Administrator`
   - Departamento ID: `81` (DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES)

2. **TIC** (tic@indrhi.gob.do)
   - Rol: `Administrator`
   - Departamento ID: `81` (DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES)

3. **emedina** (emedina@indrhi.gob.do)
   - Rol: `Administrator`
   - Departamento ID: `198` (SECCION DE ALMACEN Y SUMINISTRO)

4. **administrativo** (administrativo@indrhi.gob.do)
   - Rol: `Departamento_administrativo`
   - Departamento ID: `43` (DEPARTAMENTO ADMINISTRATIVO)

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

